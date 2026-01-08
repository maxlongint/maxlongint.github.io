/**
 * 标签同步脚本 - 从 GitHub Labels 同步到本地 bookmarks.json
 * 
 * 功能:
 * 1. 从 GitHub API 获取所有 Labels
 * 2. 过滤出 "分类:" 前缀的标签
 * 3. 比较本地与远程标签差异
 * 4. 更新 bookmarks.json 的 tags 对象
 * 5. 保留 "All" 和 "__meta__" 不变
 * 6. 检测被删除标签的使用情况并警告
 * 
 * 用法:
 *   node scripts/sync-github-labels.cjs [--dry-run]
 * 
 * 环境变量:
 *   GITHUB_TOKEN - GitHub Personal Access Token
 *   GITHUB_REPOSITORY - 仓库名称 (owner/repo)
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 4.2, 4.3, 4.4, 4.5
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { filterCategoryLabels, labelToTagName } = require('./lib/label-utils.cjs');
const { hexToTagConfig } = require('./lib/color-utils.cjs');

/**
 * 获取仓库的所有 Labels
 */
function getLabels(owner, repo, token) {
    return new Promise((resolve, reject) => {
        const allLabels = [];
        
        function fetchPage(page = 1) {
            const options = {
                hostname: 'api.github.com',
                path: `/repos/${owner}/${repo}/labels?per_page=100&page=${page}`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'GitHub-Labels-Sync'
                }
            };

            const req = https.request(options, res => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        const labels = JSON.parse(data);
                        allLabels.push(...labels);
                        
                        // 检查是否有更多页
                        const linkHeader = res.headers.link;
                        if (linkHeader && linkHeader.includes('rel="next"')) {
                            fetchPage(page + 1);
                        } else {
                            resolve(allLabels);
                        }
                    } else {
                        reject(new Error(`获取 Labels 失败: HTTP ${res.statusCode} - ${data}`));
                    }
                });
            });

            req.on('error', reject);
            req.end();
        }
        
        fetchPage();
    });
}

/**
 * 自定义 JSON 格式化（与 parse-and-merge-issue.cjs 保持一致）
 */
function formatBookmarksJson(data) {
    let json = JSON.stringify(data, null, 4);
    
    // 将 tags 数组从多行格式转换为单行格式
    json = json.replace(/"tags":\s*\[\s*([^\]]+?)\s*\]/g, (_match, content) => {
        const tags = content.match(/"[^"]+"/g) || [];
        return `"tags": [${tags.join(', ')}]`;
    });
    
    json = json.replace(/"addedDate":\s+"([^"]+)"/g, '"addedDate": "$1"');
    
    return json;
}

/**
 * 同步标签
 */
function syncTags(bookmarksData, githubLabels) {
    const result = {
        added: [],
        updated: [],
        removed: [],
        unchanged: [],
        warnings: []
    };

    // 过滤出分类标签
    const categoryLabels = filterCategoryLabels(githubLabels);
    
    // 构建 GitHub 标签映射 (tagName -> label)
    const githubTagMap = new Map();
    for (const label of categoryLabels) {
        const tagName = labelToTagName(label.name);
        if (tagName) {
            githubTagMap.set(tagName, label);
        }
    }

    // 获取本地标签（排除 All 和 __meta__）
    const localTags = new Set(
        Object.keys(bookmarksData.tags).filter(k => k !== 'All' && k !== '__meta__')
    );

    // 检查书签使用的标签
    const usedTags = new Set();
    for (const bookmark of bookmarksData.bookmarks) {
        for (const tag of bookmark.tags) {
            usedTags.add(tag);
        }
    }

    // 处理 GitHub 上的标签
    for (const [tagName, label] of githubTagMap) {
        const newConfig = hexToTagConfig(label.color);
        
        if (localTags.has(tagName)) {
            // 检查是否需要更新颜色
            const oldConfig = bookmarksData.tags[tagName];
            const oldColor = oldConfig.color?.replace('#', '').toLowerCase();
            const newColor = label.color.toLowerCase();
            
            if (oldColor !== newColor) {
                bookmarksData.tags[tagName] = newConfig;
                result.updated.push(tagName);
            } else {
                result.unchanged.push(tagName);
            }
            localTags.delete(tagName);
        } else {
            // 新增标签
            bookmarksData.tags[tagName] = newConfig;
            result.added.push(tagName);
        }
    }

    // 处理本地有但 GitHub 没有的标签（删除）
    for (const tagName of localTags) {
        if (usedTags.has(tagName)) {
            result.warnings.push(`标签 "${tagName}" 已从 GitHub 删除，但仍有 ${
                bookmarksData.bookmarks.filter(b => b.tags.includes(tagName)).length
            } 个书签在使用`);
        }
        delete bookmarksData.tags[tagName];
        result.removed.push(tagName);
    }

    // 更新元数据
    const tagCount = Object.keys(bookmarksData.tags).filter(k => k !== 'All' && k !== '__meta__').length;
    bookmarksData.tags.__meta__ = {
        ...bookmarksData.tags.__meta__,
        totalTags: tagCount,
        lastUpdated: new Date().toISOString(),
        syncedFromGitHub: true
    };

    return result;
}

/**
 * 主函数
 */
async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    
    console.log('\n🔄 开始同步 GitHub Labels...\n');
    
    if (dryRun) {
        console.log('🔍 Dry-run 模式：只预览，不实际修改文件\n');
    }

    // 获取环境变量
    const token = process.env.GITHUB_TOKEN;
    const repository = process.env.GITHUB_REPOSITORY;

    if (!token || !repository) {
        console.error('❌ 缺少环境变量:');
        if (!token) console.error('   - GITHUB_TOKEN');
        if (!repository) console.error('   - GITHUB_REPOSITORY');
        process.exit(1);
    }

    const [owner, repo] = repository.split('/');

    // 读取本地 bookmarks.json
    const bookmarksPath = path.join(__dirname, '../src/data/bookmarks.json');
    let bookmarksData;
    try {
        bookmarksData = JSON.parse(fs.readFileSync(bookmarksPath, 'utf8'));
    } catch (error) {
        console.error('❌ 读取 bookmarks.json 失败:', error.message);
        process.exit(1);
    }

    // 获取 GitHub Labels
    let githubLabels;
    try {
        githubLabels = await getLabels(owner, repo, token);
        console.log(`📥 获取到 ${githubLabels.length} 个 Labels`);
    } catch (error) {
        console.error('❌ 获取 GitHub Labels 失败:', error.message);
        process.exit(1);
    }

    // 过滤分类标签
    const categoryLabels = filterCategoryLabels(githubLabels);
    console.log(`📋 过滤出 ${categoryLabels.length} 个分类标签（前缀: 分类:）\n`);

    // 同步标签
    const result = syncTags(bookmarksData, githubLabels);

    // 输出结果
    if (result.added.length > 0) {
        console.log(`✨ 新增标签: ${result.added.join(', ')}`);
    }
    if (result.updated.length > 0) {
        console.log(`🔄 更新标签: ${result.updated.join(', ')}`);
    }
    if (result.removed.length > 0) {
        console.log(`🗑️ 删除标签: ${result.removed.join(', ')}`);
    }
    if (result.warnings.length > 0) {
        console.log('');
        for (const warning of result.warnings) {
            console.log(`⚠️ 警告: ${warning}`);
        }
    }

    console.log(`\n✅ 同步完成: 新增 ${result.added.length}, 更新 ${result.updated.length}, 删除 ${result.removed.length}, 未变化 ${result.unchanged.length}`);

    // 保存文件
    if (!dryRun) {
        const hasChanges = result.added.length > 0 || result.updated.length > 0 || result.removed.length > 0;
        
        if (hasChanges) {
            try {
                const formattedJson = formatBookmarksJson(bookmarksData);
                fs.writeFileSync(bookmarksPath, formattedJson + '\n', 'utf8');
                console.log('\n💾 已保存到 bookmarks.json');
            } catch (error) {
                console.error('\n❌ 保存文件失败:', error.message);
                process.exit(1);
            }
        } else {
            console.log('\n📝 无变更，跳过保存');
        }
    } else {
        console.log('\n💡 这是 dry-run 模式，实际运行请移除 --dry-run 参数');
    }

    // 设置 GitHub Actions 输出
    if (process.env.GITHUB_OUTPUT) {
        const hasChanges = result.added.length > 0 || result.updated.length > 0 || result.removed.length > 0;
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `has_changes=${hasChanges}\n`);
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `added_count=${result.added.length}\n`);
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `updated_count=${result.updated.length}\n`);
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `removed_count=${result.removed.length}\n`);
    }
}

// 导出供测试使用
module.exports = { syncTags, formatBookmarksJson };

// 执行
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 执行失败:', error);
        process.exit(1);
    });
}
