import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bookmarksPath = path.join(__dirname, 'src/data/bookmarks.json');
const data = JSON.parse(fs.readFileSync(bookmarksPath, 'utf8'));

// 给所有书签添加默认收录时间
data.bookmarks = data.bookmarks.map(bookmark => ({
    ...bookmark,
    addedDate: bookmark.addedDate || '2025-11-11',
}));

// 保存回文件
fs.writeFileSync(bookmarksPath, JSON.stringify(data, null, 4));
console.log('✅ 已为所有书签添加默认收录时间：2025-11-11');
