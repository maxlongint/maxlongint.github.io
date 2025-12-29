import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取bookmarks.json
const bookmarksPath = path.join(__dirname, '../src/data/bookmarks.json');
const bookmarksData = JSON.parse(fs.readFileSync(bookmarksPath, 'utf-8'));

// 从环境变量获取Token
const token = process.env.GITHUB_TOKEN;

if (!token) {
    console.log('No GitHub token found, skipping stats update');
    process.exit(0);
}

// 提取npm包名的函数
function extractNpmPackageName(npmUrl) {
    if (!npmUrl) return null;
    // 从 npm URL 提取包名：https://www.npmjs.com/package/package-name -> package-name
    const match = npmUrl.match(/npmjs\.com\/package\/([^/?]+)/);
    return match ? match[1] : null;
}

// 提取所有GitHub仓库URL和npm包名的映射
const githubRepos = new Set();
const repoNpmMap = new Map(); // 存储 fullName -> npmPackageName 的映射

bookmarksData.bookmarks.forEach(bookmark => {
    if (bookmark.url.includes('github.com')) {
        const match = bookmark.url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (match) {
            const [, owner, repo] = match;
            const fullName = `${owner}/${repo.replace(/\.git$/, '')}`;
            githubRepos.add(fullName);

            // 如果有npmUrl字段，提取包名
            if (bookmark.npmUrl) {
                const packageName = extractNpmPackageName(bookmark.npmUrl);
                if (packageName) {
                    repoNpmMap.set(fullName, packageName);
                }
            }
        }
    }
});

console.log(`Found ${githubRepos.size} GitHub repositories`);

// 获取npm版本的函数
async function fetchNpmVersion(packageName) {
    try {
        const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`, {
            headers: {
                'User-Agent': 'GitHub-Pages-Builder',
            },
        });

        if (!response.ok) {
            return 'N/A';
        }

        const data = await response.json();
        return data['dist-tags']?.latest || 'N/A';
    } catch (error) {
        console.error(`Error fetching npm version for ${packageName}:`, error.message);
        return 'N/A';
    }
}

// 获取仓库信息的函数
async function fetchRepoInfo(fullName) {
    try {
        const response = await fetch(`https://api.github.com/repos/${fullName}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'GitHub-Pages-Builder',
            },
        });

        if (!response.ok) {
            if (response.status === 403) {
                console.warn(`Rate limit exceeded for ${fullName}`);
                return null;
            }
            console.warn(`Failed to fetch ${fullName}: ${response.status}`);
            return null;
        }

        const data = await response.json();

        // 尝试获取npm版本
        let npmVersion = 'N/A';
        // 优先使用 repoNpmMap 中的包名，其次使用仓库名
        const packageName = repoNpmMap.get(fullName) || data.name;
        npmVersion = await fetchNpmVersion(packageName);

        return {
            stargazers_count: data.stargazers_count || 0,
            npm_version: npmVersion,
            name: data.name,
            full_name: data.full_name,
            pushed_at: data.pushed_at || new Date().toISOString(),
        };
    } catch (error) {
        console.error(`Error fetching ${fullName}:`, error.message);
        return null;
    }
}

// 延迟函数
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// 批量获取仓库信息
async function updateAllRepos() {
    const repoData = {};
    let successCount = 0;
    let failCount = 0;

    for (const fullName of githubRepos) {
        console.log(`Fetching ${fullName}...`);

        const info = await fetchRepoInfo(fullName);

        if (info) {
            const urlKey = `github.com/${fullName}`;
            repoData[urlKey] = info;
            successCount++;
            console.log(`✓ ${fullName}: ${info.stargazers_count} stars`);
        } else {
            failCount++;
            console.log(`✗ ${fullName}: failed`);
        }

        // 等待1.5秒避免触发速率限制（GitHub API 每分钟60次请求）
        await delay(1500);
    }

    console.log(`\nUpdate complete: ${successCount} repos success, ${failCount} failed`);

    return repoData;
}

// 保存数据到src/data目录
async function saveToPublic(repoData) {
    const dataDir = path.join(__dirname, '../src/data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // 保存GitHub Stats
    const statsOutputPath = path.join(dataDir, 'github-stats.json');
    const statsOutputData = {
        updated_at: new Date().toISOString(),
        repos: repoData,
    };

    fs.writeFileSync(statsOutputPath, JSON.stringify(statsOutputData, null, 2), 'utf-8');
    console.log(`\n✓ Saved GitHub stats to ${statsOutputPath}`);
    console.log(`✓ Updated at: ${statsOutputData.updated_at}`);
}

// 主函数
async function main() {
    console.log('Starting GitHub stats update...\n');
    console.log(`GitHub Token available: ${!!token}`);
    console.log(`Total repos to fetch: ${githubRepos.size}\n`);

    const repoData = await updateAllRepos();

    // 即使部分失败，只要有数据就保存
    if (Object.keys(repoData).length > 0) {
        await saveToPublic(repoData);
        console.log('\n✓ All done!');
        console.log(`Final stats: ${Object.keys(repoData).length} repos`);
    } else {
        console.log('\n✗ No data to update');
        // 不要失败退出，使用预设数据
        console.log('Using preset data from source code');
    }
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
