#!/usr/bin/env node

/**
 * 为单个库生成对比数据
 * 用法: node scripts/update-comparison-single.js <github-url>
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从命令行参数获取仓库路径 (owner/repo)
const repoPath = process.argv[2];

if (!repoPath) {
    console.error('❌ 请提供仓库路径 (owner/repo)');
    console.error('用法: node scripts/update-comparison-single.js <owner/repo>');
    console.error('示例: node scripts/update-comparison-single.js tailwindlabs/tailwindcss');
    process.exit(1);
}

// 解析仓库路径，支持 owner/repo 或完整 URL
let owner, repo;
if (repoPath.includes('github.com')) {
    // 支持完整 URL 向后兼容
    const match = repoPath.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
        console.error('❌ 无效的 GitHub URL:', repoPath);
        process.exit(1);
    }
    owner = match[1];
    repo = match[2].replace(/\.git$/, '');
} else {
    // owner/repo 格式
    const parts = repoPath.split('/');
    if (parts.length !== 2) {
        console.error('❌ 无效的仓库路径，格式应为 owner/repo:', repoPath);
        process.exit(1);
    }
    owner = parts[0];
    repo = parts[1].replace(/\.git$/, '');
}

const fullName = `${owner}/${repo}`;

console.log(`\n📊 开始为 ${fullName} 生成对比数据...\n`);

// 读取 bookmarks 数据
const bookmarksPath = path.join(__dirname, '../src/data/bookmarks.json');
const bookmarksData = JSON.parse(fs.readFileSync(bookmarksPath, 'utf8'));

// 查找对应的 bookmark
const bookmark = bookmarksData.bookmarks.find(b => b.url.includes(fullName));
if (!bookmark) {
    console.error('❌ 在 bookmarks.json 中未找到该库:', fullName);
    process.exit(1);
}

const packageName = bookmark.npmPackage || repo;
const id = bookmark.title.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');

console.log(`📦 库名称: ${bookmark.title}`);
console.log(`📦 Package: ${packageName}`);
console.log(`🆔 ID: ${id}`);

// API 请求函数
function fetchData(url, headers = {}) {
    return new Promise((resolve, reject) => {
        https
            .get(url, { headers }, res => {
                let data = '';
                res.on('data', chunk => (data += chunk));
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        try {
                            resolve(JSON.parse(data));
                        } catch (e) {
                            resolve(data);
                        }
                    } else {
                        resolve(null);
                    }
                });
            })
            .on('error', reject);
    });
}

// 获取 GitHub 数据
async function fetchGitHubData(fullName) {
    const url = `https://api.github.com/repos/${fullName}`;
    const headers = {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/vnd.github.v3+json',
    };

    if (process.env.GITHUB_TOKEN) {
        headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const data = await fetchData(url, headers);
    if (!data) return null;

    return {
        stars: data.stargazers_count || 0,
        forks: data.forks_count || 0,
        watchers: data.watchers_count || 0,
        openIssues: data.open_issues_count || 0,
        language: data.language || 'JavaScript',
        size: data.size || 0,
        lastUpdate: data.pushed_at || new Date().toISOString(),
        description: data.description || '',
    };
}

// 获取 npm 数据
async function fetchNpmData(packageName) {
    const registryUrl = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;
    const data = await fetchData(registryUrl);

    if (!data) {
        return { version: 'N/A', weeklyDownloads: 0, bundleSize: { minified: 0, gzipped: 0 } };
    }

    const version = data['dist-tags']?.latest || 'N/A';
    const downloadsUrl = `https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(packageName)}`;
    const downloadsData = await fetchData(downloadsUrl);
    const weeklyDownloads = downloadsData?.downloads || 0;

    // 获取 Bundle Size
    const bundlephobiaUrl = `https://bundlephobia.com/api/size?package=${encodeURIComponent(packageName)}@${version}`;
    const bundleData = await fetchData(bundlephobiaUrl);

    const bundleSize = bundleData
        ? { minified: bundleData.size || 0, gzipped: bundleData.gzip || 0 }
        : { minified: 0, gzipped: 0 };

    return { version, weeklyDownloads, bundleSize };
}

// 计算 Bundle Size 评级
function calculateBundleSizeRating(gzippedSize) {
    if (!gzippedSize) return 'Unknown';
    if (gzippedSize < 10000) return 'Light';
    if (gzippedSize < 50000) return 'Moderate';
    if (gzippedSize < 100000) return 'Heavy';
    return 'Very Heavy';
}

// 计算生态系统评分
function calculateEcosystemScore(stars, weeklyDownloads) {
    if (stars > 50000 || weeklyDownloads > 10000000) return 'Rich';
    if (stars > 10000 || weeklyDownloads > 1000000) return 'Growing';
    if (stars > 1000 || weeklyDownloads > 100000) return 'Moderate';
    return 'Small';
}

// 主函数
async function main() {
    try {
        // 获取数据
        console.log('\n📥 获取 GitHub 数据...');
        const githubData = await fetchGitHubData(fullName);
        if (!githubData) {
            throw new Error('获取 GitHub 数据失败');
        }
        console.log(`  ✓ Stars: ${githubData.stars}`);
        console.log(`  ✓ Language: ${githubData.language}`);
        console.log(`  ✓ Size: ${githubData.size} KB`);

        console.log('\n📥 获取 npm 数据...');
        const npmData = await fetchNpmData(packageName);
        console.log(`  ✓ Version: ${npmData.version}`);
        console.log(`  ✓ Weekly Downloads: ${npmData.weeklyDownloads}`);
        console.log(`  ✓ Bundle Size (gzip): ${npmData.bundleSize.gzipped} bytes`);

        // 构建对比数据
        const dimensions = {
            bundleSize: npmData.bundleSize,
            bundleSizeRating: calculateBundleSizeRating(npmData.bundleSize.gzipped),
            weeklyDownloads: npmData.weeklyDownloads,
            stars: githubData.stars,
            lastUpdate: githubData.lastUpdate,
            philosophy: bookmark.description || githubData.description,
            ecosystem: calculateEcosystemScore(githubData.stars, npmData.weeklyDownloads),
            npmVersion: npmData.version,
            language: githubData.language,
            repoSize: githubData.size,
            forks: githubData.forks,
            openIssues: githubData.openIssues,
            watchers: githubData.watchers,
        };

        const libraryData = {
            id: id,
            name: bookmark.title,
            githubUrl: fullName,
            npmPackage: packageName,
            tags: bookmark.tags || [],
            dimensions: dimensions,
        };

        // 读取现有对比数据
        const comparisonDataPath = path.join(__dirname, '../src/data/comparison-data.json');
        let comparisonData = { updated_at: '', libraries: {} };

        if (fs.existsSync(comparisonDataPath)) {
            comparisonData = JSON.parse(fs.readFileSync(comparisonDataPath, 'utf8'));
        }

        // 添加或更新数据
        comparisonData.libraries[id] = libraryData;
        comparisonData.updated_at = new Date().toISOString();

        // 写入文件
        fs.writeFileSync(comparisonDataPath, JSON.stringify(comparisonData, null, 4) + '\n', 'utf8');

        console.log(`\n✅ 成功生成对比数据并保存到 comparison-data.json`);
        console.log(`   库ID: ${id}`);
        console.log(`   总库数: ${Object.keys(comparisonData.libraries).length}`);
    } catch (error) {
        console.error('\n❌ 生成对比数据失败:', error.message);
        process.exit(1);
    }
}

main();
