import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APPRECIATES_DIR = path.join(__dirname, '../public/appreciates');

/**
 * 读取文件的第一行标题
 */
function getFileTitle(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('#')) {
                return trimmed.replace(/^#+\s*/, '').trim();
            }
        }
        return null;
    } catch (error) {
        console.error(`读取文件失败: ${filePath}`, error.message);
        return null;
    }
}

/**
 * 标准化文件名（用于比较）
 * 处理 xxx-js 和 xxx 的情况
 */
function normalizeFileName(fileName) {
    let normalized = fileName.toLowerCase().replace(/\.md$/, '').replace(/-/g, '');

    // 如果以 js 结尾（如 fusejs, mockjs），去掉 js 后缀
    if (normalized.endsWith('js')) {
        normalized = normalized.slice(0, -2);
    }

    return normalized;
}

/**
 * 查找重复的文件
 */
function findDuplicates() {
    const files = fs.readdirSync(APPRECIATES_DIR).filter(f => f.endsWith('.md'));
    const fileGroups = new Map();

    // 按标准化后的名称分组
    for (const file of files) {
        const normalized = normalizeFileName(file);
        if (!fileGroups.has(normalized)) {
            fileGroups.set(normalized, []);
        }
        fileGroups.get(normalized).push(file);
    }

    // 找出有重复的组
    const duplicates = [];
    for (const [normalized, group] of fileGroups.entries()) {
        if (group.length > 1) {
            duplicates.push({
                normalized,
                files: group,
            });
        }
    }

    return duplicates;
}

/**
 * 选择要保留的文件
 */
function selectFileToKeep(files) {
    const fileInfos = files.map(file => {
        const filePath = path.join(APPRECIATES_DIR, file);
        const title = getFileTitle(filePath);
        return { file, title, filePath };
    });

    // 优先保留标题包含"技术尽职调查报告"的文件
    const preferred = fileInfos.find(info => info.title && info.title.includes('技术尽职调查报告'));

    if (preferred) {
        return preferred;
    }

    // 如果都不包含，选择第一个
    return fileInfos[0];
}

/**
 * 主函数
 */
function main() {
    console.log('🔍 开始检查重复的鉴赏报告文件...\n');

    const duplicates = findDuplicates();

    if (duplicates.length === 0) {
        console.log('✅ 没有发现重复的文件！');
        return;
    }

    console.log(`📋 发现 ${duplicates.length} 组重复文件：\n`);

    const toDelete = [];
    const toKeep = [];

    for (const group of duplicates) {
        console.log(`📁 重复组 (${group.normalized}):`);

        const fileToKeep = selectFileToKeep(group.files);
        console.log(`   ✅ 保留: ${fileToKeep.file}`);
        console.log(`      标题: ${fileToKeep.title}`);

        toKeep.push(fileToKeep.file);

        for (const file of group.files) {
            if (file !== fileToKeep.file) {
                const filePath = path.join(APPRECIATES_DIR, file);
                const title = getFileTitle(filePath);
                console.log(`   ❌ 删除: ${file}`);
                console.log(`      标题: ${title}`);
                toDelete.push(file);
            }
        }
        console.log('');
    }

    // 显示汇总
    console.log('━'.repeat(60));
    console.log(`📊 统计:`);
    console.log(`   保留文件: ${toKeep.length}`);
    console.log(`   删除文件: ${toDelete.length}`);
    console.log('');

    // 询问确认
    console.log('⚠️  即将删除以上文件，请确认...');
    console.log('   按 Ctrl+C 取消，或运行脚本时添加 --execute 参数执行删除');

    const args = process.argv.slice(2);
    if (args.includes('--execute')) {
        console.log('\n🗑️  开始删除文件...\n');

        let successCount = 0;
        let failCount = 0;

        for (const file of toDelete) {
            const filePath = path.join(APPRECIATES_DIR, file);
            try {
                fs.unlinkSync(filePath);
                console.log(`✅ 已删除: ${file}`);
                successCount++;
            } catch (error) {
                console.error(`❌ 删除失败: ${file}`, error.message);
                failCount++;
            }
        }

        console.log('\n━'.repeat(60));
        console.log('✨ 删除完成！');
        console.log(`   成功: ${successCount}`);
        console.log(`   失败: ${failCount}`);
    } else {
        console.log('\n💡 提示: 添加 --execute 参数执行删除');
        console.log('   node scripts/remove-duplicate-appreciates.js --execute');
    }
}

main();
