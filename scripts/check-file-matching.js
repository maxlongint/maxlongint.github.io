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
 */
function getLibraryFileName(url) {
    const match = url.match(/github\.com\/[^\/]+\/([^\/\?#]+)/);
    let fileName = '';
    if (match) {
        fileName = match[1].toLowerCase();
    } else {
        fileName = url.split('/').pop().toLowerCase();
    }
    // 将点号替换为横杠
    return fileName.replace(/\./g, '-');
}

console.log('🔍 检查文件名匹配情况...\n');

const existingFiles = fs.readdirSync(APPRECIATES_DIR).filter(f => f.endsWith('.md'));
const expectedFiles = new Map();
const missingFiles = [];
const extraFiles = new Set([...existingFiles]);

// 检查每个库的期望文件名
bookmarksData.bookmarks.forEach((lib, index) => {
    const expectedFileName = getLibraryFileName(lib.url) + '.md';
    const filePath = path.join(APPRECIATES_DIR, expectedFileName);
    const exists = fs.existsSync(filePath);
    
    expectedFiles.set(expectedFileName, {
        index,
        title: lib.title,
        url: lib.url,
        exists
    });
    
    if (!exists) {
        missingFiles.push({
            index,
            title: lib.title,
            url: lib.url,
            expectedFileName
        });
    } else {
        extraFiles.delete(expectedFileName);
    }
});

console.log(`📊 统计信息:`);
console.log(`   总库数: ${bookmarksData.bookmarks.length}`);
console.log(`   现有文件: ${existingFiles.length}`);
console.log(`   匹配文件: ${bookmarksData.bookmarks.length - missingFiles.length}`);
console.log(`   缺失文件: ${missingFiles.length}`);
console.log(`   多余文件: ${extraFiles.size}`);
console.log('');

if (missingFiles.length > 0) {
    console.log(`❌ 缺失的文件 (${missingFiles.length}个):\n`);
    missingFiles.forEach(item => {
        console.log(`  [${item.index}] ${item.title}`);
        console.log(`      URL: ${item.url}`);
        console.log(`      期望: ${item.expectedFileName}`);
        console.log('');
    });
}

if (extraFiles.size > 0) {
    console.log(`⚠️  多余的文件 (${extraFiles.size}个):\n`);
    extraFiles.forEach(file => {
        console.log(`  - ${file}`);
    });
    console.log('');
}

if (missingFiles.length === 0 && extraFiles.size === 0) {
    console.log('✅ 所有文件名都匹配！');
}
