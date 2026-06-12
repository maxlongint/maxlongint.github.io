// 更新单个库的兼容性数据
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(__dirname, '../src/data/compatibility-data.json');
const GITHUB_STATS_PATH = path.join(__dirname, '../src/data/github-stats.json');
const BOOKMARKS_PATH = path.join(__dirname, '../src/data/bookmarks.json');

// 从 npm API 获取包的兼容性信息
// 参数可以是包名或完整的 npm URL
async function fetchCompatibility(packageNameOrUrl) {
    try {
        let packageName = packageNameOrUrl;

        // 如果是完整的 npm URL，提取包名（支持 scoped packages）
        if (packageNameOrUrl.includes('npmjs.com')) {
            const match = packageNameOrUrl.match(/npmjs\.com\/package\/(@[^/]+\/[^/?]+|[^/?]+)/);
            if (match) {
                packageName = match[1];
            }
        }

        console.log(`🔍 正在获取 ${packageName} 的兼容性信息...`);

        // 修正：使用正确的 npm registry API 端点
        const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`, {
            headers: {
                'User-Agent': 'GitHub-Pages-Builder',
            },
        });

        if (!response.ok) {
            console.warn(`⚠️  无法获取 ${packageName} 的兼容性信息 (HTTP ${response.status})`);
            return null;
        }

        const data = await response.json();

        // 获取最新版本的信息
        const latestVersion = data['dist-tags']?.latest;
        if (!latestVersion || !data.versions || !data.versions[latestVersion]) {
            console.warn(`⚠️  ${packageName} 没有有效的版本信息`);
            return null;
        }

        const versionData = data.versions[latestVersion];

        // 获取每周下载量
        let weeklyDownloads = null;
        try {
            const downloadsResponse = await fetch(
                `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(packageName)}`
            );
            if (downloadsResponse.ok) {
                const downloadsData = await downloadsResponse.json();
                weeklyDownloads = downloadsData.downloads || null;
            }
        } catch (e) {
            // 忽略下载量获取失败
        }

        const compatibility = {
            node: versionData.engines?.node || null,
            typescript: !!(versionData.types || versionData.typings || versionData.devDependencies?.typescript),
            browsers: versionData.browserslist?.[0] || versionData.browserslist || null,
            license: versionData.license || data.license || null,
            bundleSize: versionData.dist?.unpackedSize || null,
            sideEffects: versionData.sideEffects !== undefined ? versionData.sideEffects : null,
            dependenciesCount: versionData.dependencies ? Object.keys(versionData.dependencies).length : 0,
            weeklyDownloads: weeklyDownloads,
        };

        console.log(`   ✅ 成功获取兼容性信息`);
        if (compatibility.node) console.log(`      Node.js: ${compatibility.node}`);
        console.log(`      TypeScript: ${compatibility.typescript ? '✅ 支持' : '❌ 不支持'}`);
        if (compatibility.browsers) console.log(`      浏览器: ${compatibility.browsers}`);
        if (compatibility.license) console.log(`      许可证: ${compatibility.license}`);
        if (compatibility.bundleSize) console.log(`      包大小: ${formatBytes(compatibility.bundleSize)}`);
        if (compatibility.sideEffects !== null)
            console.log(`      副作用: ${compatibility.sideEffects === false ? '无' : '有'}`);
        console.log(`      依赖数量: ${compatibility.dependenciesCount} 个`);
        if (compatibility.weeklyDownloads)
            console.log(`      周下载量: ${compatibility.weeklyDownloads.toLocaleString()}`);

        return compatibility;
    } catch (error) {
        console.error(`❌ 获取 ${packageName} 兼容性失败:`, error.message);
        return null;
    }
}

// 格式化字节大小
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// 从 GitHub 仓库的 package.json 获取 npm 包名
async function fetchPackageNameFromGitHub(githubUrl) {
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return null;

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, '');

    for (const branch of ['main', 'master']) {
        try {
            const response = await fetch(
                `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/package.json`,
                {
                    headers: {
                        'User-Agent': 'GitHub-Pages-Builder',
                    },
                }
            );

            if (!response.ok) continue;

            const pkg = await response.json();
            if (pkg.name) {
                console.log(`   ℹ️  从 GitHub package.json 获取到包名: ${pkg.name}`);
                return pkg.name;
            }
        } catch {
            // 尝试下一个分支
        }
    }

    return null;
}

// 从 npm URL 提取包名
function extractNpmPackageName(npmUrl) {
    if (!npmUrl) return null;
    // 从 npm URL 提取包名，支持 scoped packages
    // https://www.npmjs.com/package/package-name -> package-name
    // https://www.npmjs.com/package/@scope/package-name -> @scope/package-name
    const match = npmUrl.match(/npmjs\.com\/package\/(@[^/]+\/[^/?]+|[^/?]+)/);
    return match ? match[1] : null;
}

// 从 GitHub URL 获取包名或 npm URL
function getPackageIdentifierFromUrl(githubUrl) {
    // 1. 优先从 bookmarks.json 中获取 npmUrl（完整地址）
    if (fs.existsSync(BOOKMARKS_PATH)) {
        const bookmarksData = JSON.parse(fs.readFileSync(BOOKMARKS_PATH, 'utf-8'));
        const bookmark = bookmarksData.bookmarks.find(b => b.url === githubUrl || b.url.includes(githubUrl));

        if (bookmark && bookmark.npmUrl && bookmark.npmUrl.includes('npmjs.com')) {
            console.log(`   ℹ️  从 bookmarks.json 获取到 npm 地址`);
            return bookmark.npmUrl; // 直接返回完整 URL
        }
    }

    // 2. 尝试从 github-stats.json 获取准确的包名
    if (fs.existsSync(GITHUB_STATS_PATH)) {
        const statsData = JSON.parse(fs.readFileSync(GITHUB_STATS_PATH, 'utf-8'));
        const repos = statsData.repos || {};

        // 标准化 URL
        const normalizedUrl = githubUrl
            .replace(/^https?:\/\//, '')
            .split('?')[0]
            .split('#')[0];

        const repoData = repos[normalizedUrl];
        if (repoData && repoData.name) {
            console.log(`   ℹ️  从 github-stats.json 获取到包名: ${repoData.name}`);
            return repoData.name; // 返回包名
        }
    }

    // 3. 如果找不到，尝试从 URL 提取仓库名（回退方案）
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
        const repoName = match[2].replace(/\.git$/, '');
        console.log(`   ⚠️  从 URL 提取仓库名: ${repoName}（可能不准确）`);
        return repoName; // 返回仓库名
    }

    return null;
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error('❌ 错误: 请提供 GitHub 仓库 URL');
        console.log('用法: node update-compatibility-single.js <github-url>');
        console.log('示例: node update-compatibility-single.js https://github.com/axios/axios');
        process.exit(1);
    }

    const githubUrl = args[0];
    console.log('📊 开始更新单个库的兼容性数据...\n');
    console.log(`🔗 GitHub URL: ${githubUrl}`);

    // 获取包标识符（npm URL 或包名）
    const packageIdentifier = getPackageIdentifierFromUrl(githubUrl);
    if (!packageIdentifier) {
        console.error('❌ 无法从 URL 提取包名');
        process.exit(1);
    }

    // 提取实际的包名（用于显示和存储）
    let packageName = packageIdentifier;
    if (packageIdentifier.includes('npmjs.com')) {
        // 支持 scoped packages: @scope/package-name
        const match = packageIdentifier.match(/npmjs\.com\/package\/(@[^/]+\/[^/?]+|[^/?]+)/);
        packageName = match ? match[1] : packageIdentifier;
    }

    console.log(`📦 包名: ${packageName}\n`);

    // 获取兼容性数据（传入 identifier，可以是 URL 或包名）
    let compatibility = await fetchCompatibility(packageIdentifier);

    // npm 404 时，尝试从 GitHub package.json 获取真实包名（仓库名与 npm 包名可能不一致）
    if (!compatibility) {
        const githubPackageName = await fetchPackageNameFromGitHub(githubUrl);
        if (githubPackageName && githubPackageName !== packageName) {
            packageName = githubPackageName;
            console.log(`📦 修正包名: ${packageName}\n`);
            compatibility = await fetchCompatibility(packageName);
        }
    }

    if (!compatibility) {
        console.error('❌ 获取兼容性数据失败');
        process.exit(1);
    }

    // 读取现有数据
    let compatibilityData = { packages: {} };
    if (fs.existsSync(OUTPUT_PATH)) {
        compatibilityData = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
    }

    // 更新数据
    compatibilityData.packages[packageName] = compatibility;
    compatibilityData.lastUpdated = new Date().toISOString();
    compatibilityData.totalPackages = Object.keys(compatibilityData.packages).length;

    // 保存数据
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(compatibilityData, null, 2), 'utf-8');

    console.log('\n' + '='.repeat(50));
    console.log('✅ 兼容性数据更新成功！');
    console.log(`📦 包名: ${packageName}`);
    console.log(`💾 数据已保存到: ${OUTPUT_PATH}`);
    console.log('='.repeat(50));
}

main().catch(error => {
    console.error('❌ 发生错误:', error);
    process.exit(1);
});
