import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从命令行参数获取仓库名称
const repoFullName = process.argv[2];

if (!repoFullName || !repoFullName.includes('/')) {
    console.error('Usage: node scripts/sync-single-readme.js <owner>/<repo>');
    console.error('Example: node scripts/sync-single-readme.js KaTeX/KaTeX');
    process.exit(1);
}

// 从环境变量获取Token
const token = process.env.GITHUB_TOKEN;

if (!token) {
    console.log('No GitHub token found, will try without authentication');
}

// 获取仓库README的函数
async function fetchReadme(owner, repo) {
    try {
        const fullName = `${owner}/${repo}`;
        console.log(`\nFetching README for ${fullName}...`);

        // 使用 GitHub API 获取 README
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
        console.log(`  Using GitHub API: ${apiUrl}`);

        const headers = {
            Accept: 'application/vnd.github.v3.raw', // 获取原始 Markdown 内容
            'User-Agent': 'GitHub-Pages-Builder',
        };
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(apiUrl, { headers });
        console.log(`  Status: ${response.status}`);

        if (response.ok) {
            const text = await response.text();
            console.log(`  Content length: ${text.length} bytes`);
            console.log(`  First 100 chars: ${text.substring(0, 100).replace(/\n/g, '\\n')}`);

            if (text && text.length > 100) {
                console.log(`  ✓ Successfully fetched README`);
                return text;
            } else {
                console.log(`  ✗ Content too short`);
            }
        } else if (response.status === 404) {
            console.error(`  ✗ README not found`);
        } else {
            console.error(`  ✗ API request failed: ${response.statusText}`);
        }

        return null;
    } catch (error) {
        console.error(`\n✗ Error fetching README for ${owner}/${repo}:`, error.message);
        return null;
    }
}

// 更新 github-readmes.json
async function updateReadmeData(owner, repo, readme) {
    const dataDir = path.join(__dirname, '../src/data');
    const readmeFilePath = path.join(dataDir, 'github-readmes.json');

    let readmeData = {
        updated_at: new Date().toISOString(),
        readmes: {},
    };

    // 读取现有数据
    if (fs.existsSync(readmeFilePath)) {
        const existing = JSON.parse(fs.readFileSync(readmeFilePath, 'utf-8'));
        readmeData.readmes = existing.readmes || {};
    }

    // 更新或添加当前仓库的 README
    const fullName = `${owner}/${repo}`;
    readmeData.readmes[fullName] = readme;
    readmeData.updated_at = new Date().toISOString();

    // 保存
    fs.writeFileSync(readmeFilePath, JSON.stringify(readmeData, null, 2), 'utf-8');
    console.log(`\n✓ Updated README data in ${readmeFilePath}`);
    console.log(`✓ README length: ${readme.length} bytes`);
}

// 主函数
async function main() {
    console.log('Starting single README sync...\n');
    console.log(`Repository: ${repoFullName}`);
    console.log(`GitHub Token available: ${!!token}\n`);

    const [owner, repo] = repoFullName.split('/');
    const readme = await fetchReadme(owner, repo);

    if (readme) {
        await updateReadmeData(owner, repo, readme);
        console.log('\n✓ Sync completed successfully!');
    } else {
        console.error('\n✗ Failed to sync README');
        process.exit(1);
    }
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
