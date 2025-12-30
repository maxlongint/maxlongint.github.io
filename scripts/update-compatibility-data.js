// 批量更新所有库的兼容性数据
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOOKMARKS_PATH = path.join(__dirname, '../src/data/bookmarks.json');
const OUTPUT_PATH = path.join(__dirname, '../src/data/compatibility-data.json');

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

        return {
            node: versionData.engines?.node || null,
            typescript: !!(versionData.types || versionData.typings || versionData.devDependencies?.typescript),
            browsers: versionData.browserslist?.[0] || versionData.browserslist || null,
            license: versionData.license || data.license || null,
            bundleSize: versionData.dist?.unpackedSize || null,
            sideEffects: versionData.sideEffects !== undefined ? versionData.sideEffects : null,
            dependenciesCount: versionData.dependencies ? Object.keys(versionData.dependencies).length : 0,
            weeklyDownloads: weeklyDownloads,
        };
    } catch (error) {
        console.error(`❌ 获取 ${packageName} 兼容性失败:`, error.message);
        return null;
    }
}

// 延迟函数，避免请求过快
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('📊 开始批量更新兼容性数据...\n');

    // 读取 bookmarks.json
    const bookmarksData = JSON.parse(fs.readFileSync(BOOKMARKS_PATH, 'utf-8'));
    const bookmarks = bookmarksData.bookmarks;

    // 读取现有的兼容性数据（如果存在）
    let compatibilityData = {};
    if (fs.existsSync(OUTPUT_PATH)) {
        const existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
        compatibilityData = existing.packages || {};
    }

    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (let i = 0; i < bookmarks.length; i++) {
        const bookmark = bookmarks[i];
        // 优先使用 npmUrl（完整地址），其次从 GitHub URL 提取仓库名
        const packageIdentifier = bookmark.npmUrl || extractPackageName(bookmark.url);

        if (!packageIdentifier) {
            console.log(`⏭️  [${i + 1}/${bookmarks.length}] ${bookmark.title} - 跳过（非 npm 包）`);
            skipCount++;
            continue;
        }

        // 从 identifier 中提取实际的包名（用于存储）
        let packageName = packageIdentifier;
        if (packageIdentifier.includes('npmjs.com')) {
            // 支持 scoped packages: @scope/package-name
            const match = packageIdentifier.match(/npmjs\.com\/package\/(@[^/]+\/[^/?]+|[^/?]+)/);
            packageName = match ? match[1] : packageIdentifier;
        }

        console.log(`🔍 [${i + 1}/${bookmarks.length}] 正在获取 ${packageName} 的兼容性信息...`);

        const compatibility = await fetchCompatibility(packageIdentifier);

        if (compatibility) {
            compatibilityData[packageName] = compatibility;
            successCount++;
            console.log(`   ✅ 成功`);
        } else {
            failCount++;
        }

        // 延迟 500ms，避免请求过快
        if (i < bookmarks.length - 1) {
            await delay(500);
        }
    }

    // 保存数据
    const output = {
        packages: compatibilityData,
        lastUpdated: new Date().toISOString(),
        totalPackages: Object.keys(compatibilityData).length,
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');

    console.log('\n' + '='.repeat(50));
    console.log('✅ 兼容性数据更新完成！');
    console.log(`📦 总计: ${bookmarks.length} 个工具`);
    console.log(`✅ 成功: ${successCount} 个`);
    console.log(`⏭️  跳过: ${skipCount} 个`);
    console.log(`❌ 失败: ${failCount} 个`);
    console.log(`💾 数据已保存到: ${OUTPUT_PATH}`);
    console.log('='.repeat(50));
}

// 从 GitHub URL 提取包名（回退方案）
function extractPackageName(url) {
    // 尝试从 URL 中提取仓库名作为包名
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
        const repoName = match[2].replace(/\.git$/, '');
        return repoName;
    }
    return null;
}

main().catch(error => {
    console.error('❌ 发生错误:', error);
    process.exit(1);
});
