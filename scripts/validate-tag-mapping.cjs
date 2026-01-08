/**
 * 标签映射完整性验证脚本
 * 
 * 验证内容：
 * 1. 所有书签都有对应的标签映射
 * 2. 每个书签有 1-3 个标签
 * 3. 所有映射的标签都在标签体系中定义
 * 
 * Property 1: Tag Coverage Completeness
 * Property 9: Migration Mapping Completeness
 * Validates: Requirements 0.2, 0.4, 0.5
 */

const fs = require('fs');
const path = require('path');

/**
 * 获取所有定义的标签
 * @param {Object} tagMapping - 标签映射配置
 * @returns {Set<string>} 所有标签集合
 */
function getAllDefinedTags(tagMapping) {
    const tags = new Set();
    for (const category of Object.values(tagMapping.tags)) {
        for (const tag of category) {
            tags.add(tag);
        }
    }
    return tags;
}

/**
 * 验证标签映射完整性
 * @param {Object} bookmarks - 书签数据
 * @param {Object} tagMapping - 标签映射配置
 * @returns {Object} 验证结果
 */
function validateTagMapping(bookmarks, tagMapping) {
    const result = {
        success: true,
        errors: [],
        warnings: [],
        stats: {
            totalBookmarks: 0,
            mappedBookmarks: 0,
            unmappedBookmarks: [],
            invalidTagCount: [],
            undefinedTags: [],
            tagDistribution: {}
        }
    };

    const definedTags = getAllDefinedTags(tagMapping);
    const bookmarkMappings = tagMapping.bookmarkMappings;

    // 统计标签分布
    for (const tag of definedTags) {
        result.stats.tagDistribution[tag] = 0;
    }

    result.stats.totalBookmarks = bookmarks.bookmarks.length;

    for (const bookmark of bookmarks.bookmarks) {
        const title = bookmark.title;
        const mapping = bookmarkMappings[title];

        // 检查是否有映射
        if (!mapping) {
            result.stats.unmappedBookmarks.push(title);
            result.errors.push(`书签 "${title}" 没有标签映射`);
            result.success = false;
            continue;
        }

        result.stats.mappedBookmarks++;

        // 检查标签数量 (1-3个)
        if (mapping.length < 1 || mapping.length > 3) {
            result.stats.invalidTagCount.push({
                title,
                count: mapping.length,
                tags: mapping
            });
            result.errors.push(`书签 "${title}" 的标签数量为 ${mapping.length}，应为 1-3 个`);
            result.success = false;
        }

        // 检查标签是否在定义中
        for (const tag of mapping) {
            if (!definedTags.has(tag)) {
                result.stats.undefinedTags.push({ title, tag });
                result.errors.push(`书签 "${title}" 使用了未定义的标签 "${tag}"`);
                result.success = false;
            } else {
                result.stats.tagDistribution[tag]++;
            }
        }
    }

    // 检查未使用的标签
    for (const [tag, count] of Object.entries(result.stats.tagDistribution)) {
        if (count === 0) {
            result.warnings.push(`标签 "${tag}" 未被任何书签使用`);
        }
    }

    return result;
}

/**
 * 格式化输出验证结果
 * @param {Object} result - 验证结果
 */
function printResult(result) {
    console.log('\n========== 标签映射验证结果 ==========\n');

    // 统计信息
    console.log('📊 统计信息:');
    console.log(`   总书签数: ${result.stats.totalBookmarks}`);
    console.log(`   已映射数: ${result.stats.mappedBookmarks}`);
    console.log(`   未映射数: ${result.stats.unmappedBookmarks.length}`);

    // 标签分布
    console.log('\n📈 标签使用分布:');
    const sortedTags = Object.entries(result.stats.tagDistribution)
        .sort((a, b) => b[1] - a[1]);
    for (const [tag, count] of sortedTags) {
        const bar = '█'.repeat(Math.min(count, 20));
        console.log(`   ${tag.padEnd(12)} ${String(count).padStart(2)} ${bar}`);
    }

    // 错误信息
    if (result.errors.length > 0) {
        console.log('\n❌ 错误:');
        for (const error of result.errors) {
            console.log(`   - ${error}`);
        }
    }

    // 警告信息
    if (result.warnings.length > 0) {
        console.log('\n⚠️ 警告:');
        for (const warning of result.warnings) {
            console.log(`   - ${warning}`);
        }
    }

    // 最终结果
    console.log('\n========================================');
    if (result.success) {
        console.log('✅ 验证通过！所有书签都有有效的标签映射。');
    } else {
        console.log('❌ 验证失败！请修复上述错误。');
    }
    console.log('========================================\n');
}

/**
 * 主函数
 */
function main() {
    const bookmarksPath = path.join(__dirname, '../src/data/bookmarks.json');
    const tagMappingPath = path.join(__dirname, '../src/data/tag-mapping.json');

    // 读取文件
    let bookmarks, tagMapping;
    try {
        bookmarks = JSON.parse(fs.readFileSync(bookmarksPath, 'utf8'));
        tagMapping = JSON.parse(fs.readFileSync(tagMappingPath, 'utf8'));
    } catch (error) {
        console.error('❌ 读取文件失败:', error.message);
        process.exit(1);
    }

    // 验证
    const result = validateTagMapping(bookmarks, tagMapping);

    // 输出结果
    printResult(result);

    // 退出码
    process.exit(result.success ? 0 : 1);
}

// 导出函数供测试使用
module.exports = {
    getAllDefinedTags,
    validateTagMapping
};

// 直接运行时执行主函数
if (require.main === module) {
    main();
}
