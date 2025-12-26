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
    console.log('No GitHub token found, skipping comparison data update');
    process.exit(0);
}

// 提取所有GitHub仓库
const githubBookmarks = bookmarksData.bookmarks.filter(bookmark => bookmark.url.includes('github.com'));

console.log(`Found ${githubBookmarks.length} GitHub repositories in bookmarks`);

// 延迟函数
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// 获取npm包信息（包体积、周下载量）
async function fetchNpmData(packageName) {
    try {
        // 获取基本信息和周下载量
        const [registryRes, downloadsRes, bundlephobiaRes] = await Promise.all([
            fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`, {
                headers: { 'User-Agent': 'GitHub-Pages-Builder' },
            }),
            fetch(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(packageName)}`, {
                headers: { 'User-Agent': 'GitHub-Pages-Builder' },
            }),
            fetch(`https://bundlephobia.com/api/size?package=${encodeURIComponent(packageName)}`, {
                headers: { 'User-Agent': 'GitHub-Pages-Builder' },
            }),
        ]);

        const npmData = registryRes.ok ? await registryRes.json() : null;
        const downloadsData = downloadsRes.ok ? await downloadsRes.json() : null;
        const bundleData = bundlephobiaRes.ok ? await bundlephobiaRes.json() : null;

        return {
            version: npmData?.['dist-tags']?.latest || 'N/A',
            weeklyDownloads: downloadsData?.downloads || 0,
            bundleSize: bundleData
                ? {
                      minified: bundleData.size || 0,
                      gzipped: bundleData.gzip || 0,
                  }
                : null,
            lastPublish: npmData?.time?.[npmData['dist-tags']?.latest] || null,
        };
    } catch (error) {
        console.error(`Error fetching npm data for ${packageName}:`, error.message);
        return {
            version: 'N/A',
            weeklyDownloads: 0,
            bundleSize: null,
            lastPublish: null,
        };
    }
}

// 获取GitHub仓库信息
async function fetchGitHubData(fullName) {
    try {
        const response = await fetch(`https://api.github.com/repos/${fullName}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github.v3+json',
                'User-Agent': 'GitHub-Pages-Builder',
            },
        });

        if (!response.ok) {
            console.warn(`Failed to fetch ${fullName}: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return {
            stars: data.stargazers_count || 0,
            lastUpdate: data.pushed_at || new Date().toISOString(),
            description: data.description || '',
            topics: data.topics || [],
            language: data.language || 'Unknown',
            size: data.size || 0, // 仓库大小（KB）
            forks: data.forks_count || 0,
            openIssues: data.open_issues_count || 0,
            watchers: data.watchers_count || 0,
        };
    } catch (error) {
        console.error(`Error fetching GitHub data for ${fullName}:`, error.message);
        return null;
    }
}

// 计算生态系统评分
function calculateEcosystemScore(stars, weeklyDownloads) {
    if (stars > 50000 || weeklyDownloads > 10000000) return 'Rich';
    if (stars > 10000 || weeklyDownloads > 1000000) return 'Growing';
    if (stars > 1000 || weeklyDownloads > 100000) return 'Moderate';
    return 'Small';
}

// 计算包体积评级
function calculateBundleSizeRating(gzippedSize) {
    if (!gzippedSize) return 'Unknown';
    if (gzippedSize < 10000) return 'Light';
    if (gzippedSize < 50000) return 'Moderate';
    if (gzippedSize < 100000) return 'Heavy';
    return 'Very Heavy';
}

// 处理单个书签
async function processBookmark(bookmark) {
    const match = bookmark.url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;

    const [, owner, repo] = match;
    const fullName = `${owner}/${repo.replace(/\.git$/, '')}`;
    // 优先使用 bookmark 中的 npmPackage 字段，如果没有则从 title 推断
    const packageName = bookmark.npmPackage || bookmark.title.toLowerCase().replace(/\.js$/i, '').replace(/\s+/g, '-');

    console.log(`Processing ${fullName} (npm: ${packageName})...`);

    const [githubData, npmData] = await Promise.all([fetchGitHubData(fullName), fetchNpmData(packageName)]);

    if (!githubData) return null;

    const dimensions = {
        bundleSize: npmData.bundleSize || { minified: 0, gzipped: 0 },
        bundleSizeRating: calculateBundleSizeRating(npmData.bundleSize?.gzipped),
        weeklyDownloads: npmData.weeklyDownloads,
        stars: githubData.stars,
        lastUpdate: githubData.lastUpdate,
        philosophy: bookmark.description || githubData.description || '',
        ecosystem: calculateEcosystemScore(githubData.stars, npmData.weeklyDownloads),
        npmVersion: npmData.version,
        // 新增维度
        language: githubData.language,
        repoSize: githubData.size,
        forks: githubData.forks,
        openIssues: githubData.openIssues,
        watchers: githubData.watchers,
    };

    return {
        id: bookmark.id,
        name: bookmark.title,
        githubUrl: fullName,
        npmPackage: packageName,
        tags: bookmark.tags || [],
        dimensions,
    };
}

// 主函数
async function main() {
    console.log('Starting comparison data update...\n');
    console.log(`Total GitHub bookmarks to process: ${githubBookmarks.length}\n`);

    const libraries = {};
    let successCount = 0;
    let failCount = 0;

    for (const bookmark of githubBookmarks) {
        const result = await processBookmark(bookmark);

        if (result) {
            libraries[result.id] = result;
            successCount++;
            console.log(
                `✓ ${result.name}: ${result.dimensions.stars} stars, ${result.dimensions.weeklyDownloads} weekly downloads`
            );
        } else {
            failCount++;
            console.log(`✗ ${bookmark.title}: failed`);
        }

        // 等待2秒避免触发速率限制
        await delay(2000);
    }

    console.log(`\nUpdate complete: ${successCount} success, ${failCount} failed`);

    // 保存数据
    const dataDir = path.join(__dirname, '../src/data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const outputPath = path.join(dataDir, 'comparison-data.json');
    const outputData = {
        lastUpdate: new Date().toISOString(),
        libraries,
    };

    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
    console.log(`\n✓ Saved comparison data to ${outputPath}`);
    console.log(`✓ Total libraries: ${Object.keys(libraries).length}`);
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
