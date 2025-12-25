import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取bookmarks.json
const bookmarksPath = path.join(__dirname, '../src/data/bookmarks.json');
const bookmarksData = JSON.parse(fs.readFileSync(bookmarksPath, 'utf-8'));

// 从环境变量获取Token
const token = process.env.GITHUB_TOKEN;

if (!token) {
    console.log('No GitHub token found, skipping readmes update');
    process.exit(0);
}

// 提取所有GitHub仓库URL
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

console.log(`Found ${githubRepos.size} GitHub repositories`);

// 获取仓库README的函数
async function fetchReadme(owner, repo) {
    try {
        const fullName = `${owner}/${repo}`;

        // 使用 GitHub API 获取 README
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
        const response = await fetch(apiUrl, {
            headers: {
                Accept: 'application/vnd.github.v3.raw', // 获取原始 Markdown 内容
                Authorization: `Bearer ${token}`,
                'User-Agent': 'GitHub-Pages-Builder',
            },
        });

        if (response.ok) {
            const text = await response.text();
            if (text && text.length > 100) {
                console.log(`  ✓ Successfully fetched README (${text.length} bytes)`);
                return text;
            }
        } else if (response.status === 404) {
            console.warn(`  ✗ README not found`);
        } else {
            console.warn(`  ✗ API request failed: ${response.status} ${response.statusText}`);
        }

        return null;
    } catch (error) {
        console.error(`Error fetching README for ${owner}/${repo}:`, error.message);
        return null;
    }
}

// 延迟函数
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// 批量获取仓库README
async function updateAllReadmes() {
    const readmeData = {};
    let readmeSuccessCount = 0;

    for (const fullName of githubRepos) {
        console.log(`Fetching README for ${fullName}...`);

        const [owner, repo] = fullName.split('/');
        const readme = await fetchReadme(owner, repo);
        if (readme) {
            readmeData[`${owner}/${repo}`] = readme;
            readmeSuccessCount++;
            console.log(`✓ README fetched (${readme.length} bytes)`);
        } else {
            console.log(`✗ README not available`);
        }

        // 等待1秒避免触发速率限制
        await delay(1000);
    }

    console.log(`\nREADME fetched: ${readmeSuccessCount}/${githubRepos.size}`);

    return readmeData;
}

// 保存数据到src/data目录
async function saveToPublic(readmeData) {
    const dataDir = path.join(__dirname, '../src/data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // 保存README数据
    const readmeOutputPath = path.join(dataDir, 'github-readmes.json');
    const readmeOutputData = {
        updated_at: new Date().toISOString(),
        readmes: readmeData,
    };

    fs.writeFileSync(readmeOutputPath, JSON.stringify(readmeOutputData, null, 2), 'utf-8');
    console.log(`\n✓ Saved README data to ${readmeOutputPath}`);
    console.log(`✓ Updated at: ${readmeOutputData.updated_at}`);
}

// 主函数
async function main() {
    console.log('Starting GitHub READMEs update...\n');
    console.log(`GitHub Token available: ${!!token}`);
    console.log(`Total repos to fetch: ${githubRepos.size}\n`);

    const readmeData = await updateAllReadmes();

    // 即使部分失败，只要有数据就保存
    if (Object.keys(readmeData).length > 0) {
        await saveToPublic(readmeData);
        console.log('\n✓ All done!');
        console.log(`Final stats: ${Object.keys(readmeData).length} READMEs`);
    } else {
        console.log('\n✗ No data to update');
        // 不要失败退出，使用预设数据
        console.log('Using preset data from source code');
    }
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
