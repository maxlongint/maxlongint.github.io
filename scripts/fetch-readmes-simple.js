// 简化版本：直接从 raw.githubusercontent.com 获取 README（无需 Token）
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bookmarksPath = path.join(__dirname, '../src/data/bookmarks.json');
const bookmarksData = JSON.parse(fs.readFileSync(bookmarksPath, 'utf-8'));

const githubRepos = new Set();
bookmarksData.bookmarks.forEach(bookmark => {
    if (bookmark.url.includes('github.com')) {
        const match = bookmark.url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (match) {
            const [, owner, repo] = match;
            githubRepos.add(`${owner}/${repo.replace(/\.git$/, '')}`);
        }
    }
});

console.log(`Found ${githubRepos.size} GitHub repositories\n`);

async function fetchReadme(owner, repo) {
    try {
        // 先尝试 main 分支
        let url = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;
        let response = await fetch(url);

        // 如果失败，尝试 master 分支
        if (!response.ok) {
            url = `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`;
            response = await fetch(url);
        }

        if (response.ok) {
            const text = await response.text();
            // 确保不是 404 页面
            if (text && !text.includes('404: Not Found') && !text.includes('<!DOCTYPE html>')) {
                return text;
            }
        }

        return null;
    } catch (error) {
        console.error(`Error fetching ${owner}/${repo}:`, error.message);
        return null;
    }
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const readmeData = {};
    let successCount = 0;
    let failCount = 0;

    for (const fullName of githubRepos) {
        const [owner, repo] = fullName.split('/');
        console.log(`Fetching ${fullName}...`);

        const readme = await fetchReadme(owner, repo);
        if (readme) {
            readmeData[fullName] = readme;
            successCount++;
            console.log(`  ✓ README fetched (${readme.length} bytes)`);
        } else {
            failCount++;
            console.log(`  ✗ README not available`);
        }

        // 延迟避免请求过快
        await delay(500);
    }

    console.log(`\n✓ Success: ${successCount}, ✗ Failed: ${failCount}`);

    // 保存到 public 目录
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    const outputPath = path.join(publicDir, 'github-readmes.json');
    const outputData = {
        updated_at: new Date().toISOString(),
        readmes: readmeData,
    };

    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
    console.log(`\n✓ Saved to ${outputPath}`);
    console.log(`✓ Total READMEs: ${Object.keys(readmeData).length}`);
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
