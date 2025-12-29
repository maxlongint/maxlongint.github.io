// 更新单个库的兼容性数据
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(__dirname, '../src/data/compatibility-data.json');
const GITHUB_STATS_PATH = path.join(__dirname, '../src/data/github-stats.json');

// 从 npm API 获取包的兼容性信息
async function fetchCompatibility(packageName) {
    try {
        console.log(`🔍 正在获取 ${packageName} 的兼容性信息...`);

        const response = await fetch(`https://registry.npmjs.org/${packageName}/latest`);
        if (!response.ok) {
            console.warn(`⚠️  无法获取 ${packageName} 的兼容性信息 (HTTP ${response.status})`);
            return null;
        }

        const data = await response.json();

        const compatibility = {
            node: data.engines?.node || null,
            react: data.peerDependencies?.react || data.dependencies?.react || null,
            vue: data.peerDependencies?.vue || data.dependencies?.vue || null,
            typescript: !!(data.types || data.typings || data.devDependencies?.typescript),
            browsers: data.browserslist?.[0] || data.browserslist || null,
        };

        console.log(`   ✅ 成功获取兼容性信息`);
        if (compatibility.node) console.log(`      Node.js: ${compatibility.node}`);
        if (compatibility.react) console.log(`      React: ${compatibility.react}`);
        if (compatibility.vue) console.log(`      Vue: ${compatibility.vue}`);
        console.log(`      TypeScript: ${compatibility.typescript ? '✅ 支持' : '❌ 不支持'}`);
        if (compatibility.browsers) console.log(`      浏览器: ${compatibility.browsers}`);

        return compatibility;
    } catch (error) {
        console.error(`❌ 获取 ${packageName} 兼容性失败:`, error.message);
        return null;
    }
}

// 从 GitHub URL 获取包名
function getPackageNameFromUrl(githubUrl) {
    // 先尝试从 github-stats.json 获取准确的包名
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
            return repoData.name;
        }
    }

    // 如果找不到，尝试从 URL 提取仓库名
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
        return match[2].replace(/\.git$/, '');
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

    // 获取包名
    const packageName = getPackageNameFromUrl(githubUrl);
    if (!packageName) {
        console.error('❌ 无法从 URL 提取包名');
        process.exit(1);
    }

    console.log(`📦 包名: ${packageName}\n`);

    // 获取兼容性数据
    const compatibility = await fetchCompatibility(packageName);

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
