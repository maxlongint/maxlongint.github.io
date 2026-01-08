/**
 * 应用标签映射脚本 - 根据 tag-mapping.json 更新 bookmarks.json 中的书签标签
 * 
 * 功能:
 * 1. 读取 tag-mapping.json 中的书签映射
 * 2. 更新 bookmarks.json 中每个书签的 tags 数组
 * 3. 更新 tags 对象，添加新标签配置
 * 4. 清理不再使用的旧标签
 * 
 * 用法:
 *   node scripts/apply-tag-mapping.cjs [--dry-run]
 */

const fs = require('fs');
const path = require('path');

// 黄金角度颜色生成算法（与 parse-and-merge-issue.cjs 保持一致）
function generateTagColor(index) {
    const goldenAngle = 137.5;
    const hue = (index * goldenAngle) % 360;
    const saturation = 45 + (index % 3) * 10;
    const lightnessBase = 88;
    const lightnessStep = 2;
    const maxSteps = 6;
    const lightness = lightnessBase - (index % maxSteps) * lightnessStep;
    const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    const textLightness = Math.max(20, lightness - 50);
    const textColor = `hsl(${hue}, ${Math.min(saturation + 20, 80)}%, ${textLightness}%)`;

    function hslToHex(h, s, l) {
        s /= 100;
        l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;
        if (0 <= h && h < 60) { r = c; g = x; b = 0; }
        else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
        else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
        else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
        else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
        else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
        const toHex = num => {
            const hex = Math.round((num + m) * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    const hexColor = hslToHex(hue, saturation, lightness);
    return {
        className: '',
        color: hexColor,
        backgroundColor: backgroundColor,
        textColor: textColor,
    };
}

/**
 * 自定义 JSON 格式化
 */
function formatBookmarksJson(data) {
    let json = JSON.stringify(data, null, 4);
    
    json = json.replace(/"tags":\s*\[\s*([^\]]+?)\s*\]/g, (_match, content) => {
        const tags = content.match(/"[^"]+"/g) || [];
        return `"tags": [${tags.join(', ')}]`;
    });
    
    json = json.replace(/"addedDate":\s+"([^"]+)"/g, '"addedDate": "$1"');
    
    return json;
}

/**
 * 主函数
 */
function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    
    console.log('\n🔄 应用标签映射...\n');
    
    if (dryRun) {
        console.log('🔍 Dry-run 模式：只预览，不实际修改文件\n');
    }

    // 读取文件
    const bookmarksPath = path.join(__dirname, '../src/data/bookmarks.json');
    const mappingPath = path.join(__dirname, '../src/data/tag-mapping.json');
    
    const bookmarksData = JSON.parse(fs.readFileSync(bookmarksPath, 'utf8'));
    const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

    // 统计
    const stats = {
        updated: 0,
        unchanged: 0,
        newTags: [],
        removedTags: []
    };

    // 收集所有新标签
    const allNewTags = new Set();
    for (const category of Object.values(mappingData.tags)) {
        for (const tag of category) {
            allNewTags.add(tag);
        }
    }

    // 更新每个书签的标签
    for (const bookmark of bookmarksData.bookmarks) {
        const newTags = mappingData.bookmarkMappings[bookmark.title];
        
        if (newTags && newTags.length > 0) {
            const oldTags = [...bookmark.tags];
            const tagsChanged = JSON.stringify(oldTags.sort()) !== JSON.stringify([...newTags].sort());
            
            if (tagsChanged) {
                bookmark.tags = newTags;
                stats.updated++;
                console.log(`📝 ${bookmark.title}: [${oldTags.join(', ')}] → [${newTags.join(', ')}]`);
            } else {
                stats.unchanged++;
            }
        } else {
            console.log(`⚠️ 未找到映射: ${bookmark.title}`);
        }
    }

    // 收集当前使用的标签
    const usedTags = new Set();
    for (const bookmark of bookmarksData.bookmarks) {
        for (const tag of bookmark.tags) {
            usedTags.add(tag);
        }
    }

    // 获取现有标签（排除 All 和 __meta__）
    const existingTags = new Set(
        Object.keys(bookmarksData.tags).filter(k => k !== 'All' && k !== '__meta__')
    );

    // 添加新标签配置
    let colorIndex = existingTags.size;
    for (const tag of allNewTags) {
        if (!bookmarksData.tags[tag]) {
            bookmarksData.tags[tag] = generateTagColor(colorIndex);
            stats.newTags.push(tag);
            colorIndex++;
        }
    }

    // 删除不再使用的旧标签
    for (const tag of existingTags) {
        if (!usedTags.has(tag)) {
            delete bookmarksData.tags[tag];
            stats.removedTags.push(tag);
        }
    }

    // 更新元数据
    const tagCount = Object.keys(bookmarksData.tags).filter(k => k !== 'All' && k !== '__meta__').length;
    bookmarksData.tags.__meta__ = {
        ...bookmarksData.tags.__meta__,
        lastColorIndex: colorIndex - 1,
        totalTags: tagCount,
        lastUpdated: new Date().toISOString(),
        migratedFromMapping: true
    };

    // 输出统计
    console.log('\n' + '='.repeat(50));
    console.log('\n📊 统计信息:');
    console.log(`   更新书签: ${stats.updated}`);
    console.log(`   未变化: ${stats.unchanged}`);
    console.log(`   新增标签: ${stats.newTags.length}`);
    console.log(`   删除标签: ${stats.removedTags.length}`);
    
    if (stats.newTags.length > 0) {
        console.log(`\n✨ 新增标签: ${stats.newTags.join(', ')}`);
    }
    if (stats.removedTags.length > 0) {
        console.log(`\n🗑️ 删除标签: ${stats.removedTags.join(', ')}`);
    }

    // 保存文件
    if (!dryRun) {
        const hasChanges = stats.updated > 0 || stats.newTags.length > 0 || stats.removedTags.length > 0;
        
        if (hasChanges) {
            const formattedJson = formatBookmarksJson(bookmarksData);
            fs.writeFileSync(bookmarksPath, formattedJson + '\n', 'utf8');
            console.log('\n💾 已保存到 bookmarks.json');
        } else {
            console.log('\n📝 无变更，跳过保存');
        }
    } else {
        console.log('\n💡 这是 dry-run 模式，实际运行请移除 --dry-run 参数');
    }
}

main();
