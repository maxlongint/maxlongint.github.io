import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bookmarksPath = path.join(__dirname, '../src/data/bookmarks.json');
const bookmarksData = JSON.parse(fs.readFileSync(bookmarksPath, 'utf-8'));
const APPRECIATES_DIR = path.join(__dirname, '../public/appreciates');

/**
 * 从 GitHub URL 提取库名称（用于文件命名）
 * 与前端 BookmarkDetail.tsx 中的逻辑保持一致
 */
function getLibraryFileName(url) {
    const match = url.match(/github\.com\/[^\/]+\/([^\/\?#]+)/);
    let fileName = '';
    if (match) {
        fileName = match[1].toLowerCase();
    } else {
        fileName = url.split('/').pop()?.toLowerCase() || '';
    }
    // 将点号替换为横杠
    return fileName.replace(/\./g, '-');
}

console.log('🔍 测试所有库的鉴赏报告文件匹配情况...\n');

const results = {
    matched: [],
    missing: [],
    total: bookmarksData.bookmarks.length
};

bookmarksData.bookmarks.forEach((lib, index) => {
    const fileName = getLibraryFileName(lib.url);
    const filePath = path.join(APPRECIATES_DIR, `${fileName}.md`);
    const exists = fs.existsSync(filePath);
    
    if (exists) {
        results.matched.push({
            index,
            title: lib.title,
            url: lib.url,
            fileName: `${fileName}.md`
        });
    } else {
        results.missing.push({
            index,
            title: lib.title,
            url: lib.url,
            expectedFileName: `${fileName}.md`
        });
    }
});

console.log('📊 测试结果统计:\n');
console.log(`   总库数: ${results.total}`);
console.log(`   ✅ 匹配成功: ${results.matched.length} (${((results.matched.length / results.total) * 100).toFixed(1)}%)`);
console.log(`   ❌ 缺失文件: ${results.missing.length} (${((results.missing.length / results.total) * 100).toFixed(1)}%)`);
console.log('');

if (results.missing.length > 0) {
    console.log(`❌ 缺失鉴赏报告的库 (${results.missing.length}个):\n`);
    results.missing.forEach(item => {
        console.log(`  [${item.index}] ${item.title}`);
        console.log(`      URL: ${item.url}`);
        console.log(`      期望文件: ${item.expectedFileName}`);
        console.log('');
    });
} else {
    console.log('✅ 太棒了！所有库都有鉴赏报告！');
}

if (results.matched.length > 0) {
    console.log(`✅ 匹配成功的库 (前10个):\n`);
    results.matched.slice(0, 10).forEach(item => {
        console.log(`  [${item.index}] ${item.title} → ${item.fileName}`);
    });
    if (results.matched.length > 10) {
        console.log(`  ... 以及其他 ${results.matched.length - 10} 个库`);
    }
    console.log('');
}

// 返回退出码，如果有缺失的文件则返回1
if (results.missing.length > 0) {
    console.log('⚠️  测试失败：有库缺少鉴赏报告');
    process.exit(1);
} else {
    console.log('🎉 测试通过：所有库都能正确显示鉴赏报告！');
    process.exit(0);
}
