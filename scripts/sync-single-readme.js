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
    // 可能的 README 文件名变体
    const readmeVariants = ['README.md', 'readme.md', 'Readme.md', 'README.MD', 'readme.MD', 'README', 'readme'];

    // 可能的分支名
    const branches = ['main', 'master'];

    // 特殊仓库的 README 路径（针对 monorepo 等情况）
    const specialPaths = {
        'colinhacks/zod': ['packages/zod/README.md'],
        'fabian-hiller/valibot': ['library/README.md'],
        'KaTeX/KaTeX': ['README.md'],
    };

    try {
        const fullName = `${owner}/${repo}`;
        console.log(`\nFetching README for ${fullName}...`);

        // 首先尝试特殊路径
        if (specialPaths[fullName]) {
            console.log(`Using special paths for ${fullName}`);
            for (const branch of branches) {
                for (const specialPath of specialPaths[fullName]) {
                    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${specialPath}`;
                    console.log(`  Trying ${branch}/${specialPath}...`);

                    const headers = {
                        'User-Agent': 'GitHub-Pages-Builder',
                    };
                    if (token) {
                        headers.Authorization = `Bearer ${token}`;
                    }

                    const response = await fetch(url, { headers });
                    console.log(`  Status: ${response.status}`);

                    if (response.ok) {
                        const text = await response.text();
                        console.log(`  Content length: ${text.length} bytes`);
                        console.log(`  First 100 chars: ${text.substring(0, 100).replace(/\n/g, '\\n')}`);

                        if (text && text.length > 100 && !text.includes('<!DOCTYPE html>')) {
                            console.log(`  ✓ Found ${specialPath} in ${branch} branch`);
                            return text;
                        } else {
                            console.log(`  ✗ Content validation failed`);
                        }
                    }
                }
            }
        }

        // 然后尝试根目录的 README
        console.log(`Trying standard README locations...`);
        for (const branch of branches) {
            for (const filename of readmeVariants) {
                const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filename}`;
                console.log(`  Trying ${branch}/${filename}...`);

                const headers = {
                    'User-Agent': 'GitHub-Pages-Builder',
                };
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }

                const response = await fetch(url, { headers });
                console.log(`  Status: ${response.status}`);

                if (response.ok) {
                    const text = await response.text();
                    console.log(`  Content length: ${text.length} bytes`);
                    console.log(`  First 100 chars: ${text.substring(0, 100).replace(/\n/g, '\\n')}`);

                    if (text && text.length > 100 && !text.includes('<!DOCTYPE html>')) {
                        console.log(`  ✓ Found ${filename} in ${branch} branch`);
                        return text;
                    } else {
                        console.log(`  ✗ Content validation failed`);
                    }
                }
            }
        }

        console.error(`\n✗ Failed to fetch README for ${owner}/${repo}: no valid README found`);
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
