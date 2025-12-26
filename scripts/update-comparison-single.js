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

// 从命令行参数获取 GitHub URL
const githubUrl = process.argv[2];

if (!githubUrl) {
    console.error('❌ 请提供 GitHub URL');
    console.error('用法: node scripts/update-comparison-single.js <github-url>');
    process.exit(1);
}

// 解析 GitHub URL
const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
if (!match) {
    console.error('❌ 无效的 GitHub URL:', githubUrl);
    process.exit(1);
}

const owner = match[1];
const repo = match[2].replace(/\.git$/, '');
const fullName = `${owner}/${repo}`;

console.log(`\n📊 开始为 ${fullName} 生成对比数据...\n`);

// 读取 bookmarks 数据
const bookmarksPath = path.join(__dirname, '../src/data/bookmarks.json');
const bookmarksData = JSON.parse(fs.readFileSync(bookmarksPath, 'utf8'));

// 查找对应的 bookmark
const bookmark = bookmarksData.bookmarks.find(b => b.url === githubUrl || b.url.includes(fullName));
if (!bookmark) {
    console.error('❌ 在 bookmarks.json 中未找到该库:', githubUrl);
    process.exit(1);
}

const packageName = bookmark.npmPackage || bookmark.title.toLowerCase().replace(/\.js$/i, '').replace(/\s+/g, '-');
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
    if (gzippedSize === 0) return 'Unknown';
    if (gzippedSize < 5000) return 'Excellent';
    if (gzippedSize < 20000) return 'Good';
    if (gzippedSize < 50000) return 'Medium';
    return 'Large';
}

// 计算生态系统评分
function calculateEcosystemScore(stars, downloads) {
    if (stars > 10000 && downloads > 1000000) return 'Rich';
    if (stars > 5000 || downloads > 500000) return 'Growing';
    return 'Emerging';
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
