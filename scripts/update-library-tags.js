import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从命令行参数获取库名称和新标签
const libraryName = process.argv[2];
const newTagsArg = process.argv[3];

if (!libraryName || !newTagsArg) {
    console.error('❌ 错误: 请提供库名称和新标签');
    console.error('用法: npm run update-library-tags "库名称" "标签1,标签2,标签3"');
    process.exit(1);
}

// 解析标签（支持逗号分隔或空格分隔）
const newTags = newTagsArg
    .split(/[,，]/)
    .map(tag => tag.trim())
    .filter(tag => tag);

if (newTags.length === 0) {
    console.error('❌ 错误: 请至少提供一个标签');
    process.exit(1);
}

// 读取 bookmarks.json
const bookmarksPath = path.join(__dirname, '../src/data/bookmarks.json');
const data = JSON.parse(fs.readFileSync(bookmarksPath, 'utf-8'));

// 查找库
const library = data.bookmarks.find(
    b => b.title === libraryName || b.title.toLowerCase() === libraryName.toLowerCase()
);

if (!library) {
    console.error(`❌ 错误: 未找到库 "${libraryName}"`);
    console.error('提示: 请确保库名称完全匹配，区分大小写');

    // 提供相似库名建议
    const similar = data.bookmarks.filter(b => b.title.toLowerCase().includes(libraryName.toLowerCase())).slice(0, 5);

    if (similar.length > 0) {
        console.log('\n💡 可能的库名称:');
        similar.forEach(b => console.log(`   - ${b.title}`));
    }

    process.exit(1);
}

// 验证标签是否都在已定义的标签中
const availableTags = Object.keys(data.tags).filter(tag => tag !== 'All' && tag !== '__meta__');
const invalidTags = newTags.filter(tag => !availableTags.includes(tag));

if (invalidTags.length > 0) {
    console.warn(`⚠️  警告: 以下标签不在已定义的标签列表中: ${invalidTags.join(', ')}`);
    console.log('\n📋 可用标签列表:');
    console.log(availableTags.sort().join(', '));
    console.log('\n是否继续使用这些标签？（新标签将被添加到系统中）');
}

// 保存旧标签
const oldTags = [...library.tags];

// 更新标签
library.tags = newTags;

// 写回文件
fs.writeFileSync(bookmarksPath, JSON.stringify(data, null, 4), 'utf-8');

console.log(`\n✅ 成功更新库 "${library.title}" 的标签`);
console.log(`📝 旧标签: ${oldTags.join(', ')}`);
console.log(`🏷️  新标签: ${newTags.join(', ')}`);
console.log(`\n📊 标签变更:`);
const removed = oldTags.filter(tag => !newTags.includes(tag));
const added = newTags.filter(tag => !oldTags.includes(tag));

if (removed.length > 0) {
    console.log(`   ❌ 移除: ${removed.join(', ')}`);
}
if (added.length > 0) {
    console.log(`   ✅ 添加: ${added.join(', ')}`);
}
if (removed.length === 0 && added.length === 0) {
    console.log('   ℹ️  标签顺序已调整');
}
