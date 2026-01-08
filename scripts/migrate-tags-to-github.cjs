/**
 * 标签迁移脚本 - 将本地标签迁移到 GitHub Labels
 * 
 * 功能:
 * 1. 读取 tag-mapping.json 中的新标签体系
 * 2. 为每个标签创建 GitHub Label（添加 "分类:" 前缀）
 * 3. 使用颜色生成算法生成标签颜色
 * 4. 支持 dry-run 模式预览
 * 5. 跳过已存在的标签
 * 
 * 用法:
 *   node scripts/migrate-tags-to-github.cjs [--dry-run]
 * 
 * 环境变量:
 *   GITHUB_TOKEN - GitHub Personal Access Token
 *   GITHUB_REPOSITORY - 仓库名称 (owner/repo)
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { tagNameToLabel } = require('./lib/label-utils.cjs');

// 颜色生成算法（与 parse-and-merge-issue.cjs 保持一致）
function generateTagColor(index) {
    const goldenAngle = 137.5;
    const hue = (index * goldenAngle) % 360;
    const saturation = 45 + (index % 3) * 10;
    const lightnessBase = 88;
    const lightnessStep = 2;
    const maxSteps = 6;
    const lightness = lightnessBase - (index % maxSteps) * lightnessStep;

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
        return `${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    return hslToHex(hue, saturation, lightness);
}

/**
 * 获取仓库的所有 Labels
 */
function getLabels(owner, repo, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: `/repos/${owner}/${repo}/labels?per_page=100`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'GitHub-Labels-Migration'
            }
        };

        const req = https.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`获取 Labels 失败: HTTP ${res.statusCode} - ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

/**
 * 创建 GitHub Label
 */
function createLabel(owner, repo, token, name, color, description) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({ name, color, description });
        
        const options = {
            hostname: 'api.github.com',
            path: `/repos/${owner}/${repo}/labels`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'GitHub-Labels-Migration',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const req = https.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 201) {
                    resolve(JSON.parse(data));
                } else if (res.statusCode === 422) {
                    // Label 已存在
                    resolve({ exists: true, name });
                } else {
                    reject(new Error(`创建 Label "${name}" 失败: HTTP ${res.statusCode} - ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

/**
 * 获取所有标签名称
 */
function getAllTagNames(tagMapping) {
    const tags = [];
    for (const category of Object.values(tagMapping.tags)) {
        tags.push(...category);
    }
    return tags;
}

/**
 * 主函数
 */
async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    
    console.log('\n========== 标签迁移到 GitHub ==========\n');
    
    if (dryRun) {
        console.log('🔍 Dry-run 模式：只预览，不实际创建\n');
    }

    // 读取配置
    const tagMappingPath = path.join(__dirname, '../src/data/tag-mapping.json');
    let tagMapping;
    try {
        tagMapping = JSON.parse(fs.readFileSync(tagMappingPath, 'utf8'));
    } catch (error) {
        console.error('❌ 读取 tag-mapping.json 失败:', error.message);
        process.exit(1);
    }

    // 获取环境变量
    const token = process.env.GITHUB_TOKEN;
    const repository = process.env.GITHUB_REPOSITORY;

    if (!dryRun && (!token || !repository)) {
        console.error('❌ 缺少环境变量:');
        if (!token) console.error('   - GITHUB_TOKEN');
        if (!repository) console.error('   - GITHUB_REPOSITORY');
        console.error('\n使用 --dry-run 可以在没有环境变量的情况下预览');
        process.exit(1);
    }

    const [owner, repo] = repository ? repository.split('/') : ['owner', 'repo'];

    // 获取所有标签
    const tagNames = getAllTagNames(tagMapping);
    console.log(`📋 共有 ${tagNames.length} 个标签需要迁移\n`);

    // 获取现有 Labels
    let existingLabels = [];
    if (!dryRun) {
        try {
            existingLabels = await getLabels(owner, repo, token);
            console.log(`📥 仓库现有 ${existingLabels.length} 个 Labels\n`);
        } catch (error) {
            console.error('❌ 获取现有 Labels 失败:', error.message);
            process.exit(1);
        }
    }

    const existingLabelNames = new Set(existingLabels.map(l => l.name));

    // 统计
    const stats = {
        created: [],
        skipped: [],
        failed: []
    };

    // 创建 Labels
    console.log('🏷️ 开始创建 Labels:\n');
    
    for (let i = 0; i < tagNames.length; i++) {
        const tagName = tagNames[i];
        const labelName = tagNameToLabel(tagName);
        const color = generateTagColor(i);
        const description = `工具分类: ${tagName}`;

        if (existingLabelNames.has(labelName)) {
            console.log(`   ⏭️ 跳过 "${labelName}" (已存在)`);
            stats.skipped.push(labelName);
            continue;
        }

        if (dryRun) {
            console.log(`   📝 将创建 "${labelName}" (颜色: #${color})`);
            stats.created.push(labelName);
        } else {
            try {
                const result = await createLabel(owner, repo, token, labelName, color, description);
                if (result.exists) {
                    console.log(`   ⏭️ 跳过 "${labelName}" (已存在)`);
                    stats.skipped.push(labelName);
                } else {
                    console.log(`   ✅ 创建 "${labelName}" (颜色: #${color})`);
                    stats.created.push(labelName);
                }
            } catch (error) {
                console.log(`   ❌ 失败 "${labelName}": ${error.message}`);
                stats.failed.push({ name: labelName, error: error.message });
            }
            
            // 避免 API 限流
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // 输出统计
    console.log('\n========== 迁移统计 ==========\n');
    console.log(`   ✅ 创建: ${stats.created.length}`);
    console.log(`   ⏭️ 跳过: ${stats.skipped.length}`);
    console.log(`   ❌ 失败: ${stats.failed.length}`);
    
    if (stats.failed.length > 0) {
        console.log('\n失败详情:');
        for (const item of stats.failed) {
            console.log(`   - ${item.name}: ${item.error}`);
        }
    }

    console.log('\n==============================\n');

    if (dryRun) {
        console.log('💡 这是 dry-run 模式，实际运行请移除 --dry-run 参数');
    }

    process.exit(stats.failed.length > 0 ? 1 : 0);
}

// 执行
main().catch(error => {
    console.error('❌ 执行失败:', error);
    process.exit(1);
});
