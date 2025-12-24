import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从环境变量获取 Token
const token = process.env.GITHUB_TOKEN;

if (!token) {
    console.log('⚠️  No GitHub token found, using mock data');
    generateMockData();
    process.exit(0);
}

// GitHub Trending API (使用第三方代理服务)
// 前端相关语言：JavaScript, TypeScript, Vue, HTML, CSS
const TRENDING_LANGUAGES = ['javascript', 'typescript', 'html', 'css'];
const TRENDING_API_BASE = 'https://api.gitterapp.com/repositories';

/**
 * 获取当前周的开始和结束日期
 */
function getWeekRange() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 周一为起始

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // 使用本地日期而不是 UTC
    const formatDate = date => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return {
        weekStart: formatDate(weekStart),
        weekEnd: formatDate(weekEnd),
    };
}

/**
 * 发起 HTTPS GET 请求
 */
function httpsGet(url) {
    return new Promise((resolve, reject) => {
        https
            .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
                let data = '';
                res.on('data', chunk => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(data);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                    }
                });
            })
            .on('error', reject);
    });
}

// 语言颜色映射
function getLanguageColor(lang) {
    const colors = {
        JavaScript: '#f1e05a',
        TypeScript: '#3178c6',
        HTML: '#e34c26',
        CSS: '#563d7c',
        Vue: '#41b883',
        React: '#61dafb',
        Python: '#3572A5',
        Go: '#00ADD8',
        Rust: '#dea584',
        Java: '#b07219',
    };
    return colors[lang] || '#333333';
}

// 延迟函数
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 保存数据到 public 目录（类似 github-stats.json）
 */
function saveData(trendingData) {
    const outputDir = path.join(__dirname, '../public');
    const outputPath = path.join(outputDir, 'trending.json');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputData = {
        updated_at: new Date().toISOString(),
        data: trendingData,
    };

    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');

    console.log(`💾 数据已保存到: ${outputPath}`);
    console.log(`📅 周期: ${trendingData.weekStart} ~ ${trendingData.weekEnd}`);
    console.log(`📊 共收录 ${trendingData.repos.length} 个热门项目`);
    console.log(`⏰ 更新时间: ${outputData.updated_at}`);
}

/**
 * 生成模拟数据
 */
function generateMockData() {
    console.log('📝 生成模拟 Trending 数据...');
    const { weekStart, weekEnd } = getWeekRange();
    const mockData = {
        weekStart,
        weekEnd,
        repos: [
            {
                rank: 1,
                name: 'shadcn-ui',
                author: 'shadcn',
                url: 'https://github.com/shadcn/ui',
                description: 'Beautifully designed components built with Radix UI and Tailwind CSS.',
                language: 'TypeScript',
                languageColor: '#3178c6',
                stars: 85432,
                forks: 4521,
                starsThisWeek: 1234,
                builtBy: [
                    {
                        username: 'shadcn',
                        avatar: 'https://avatars.githubusercontent.com/u/124599?v=4',
                        url: 'https://github.com/shadcn',
                    },
                ],
            },
            {
                rank: 2,
                name: 'react',
                author: 'facebook',
                url: 'https://github.com/facebook/react',
                description: 'The library for web and native user interfaces.',
                language: 'JavaScript',
                languageColor: '#f1e05a',
                stars: 228000,
                forks: 46500,
                starsThisWeek: 892,
                builtBy: [
                    {
                        username: 'gaearon',
                        avatar: 'https://avatars.githubusercontent.com/u/810438?v=4',
                        url: 'https://github.com/gaearon',
                    },
                ],
            },
            {
                rank: 3,
                name: 'vue',
                author: 'vuejs',
                url: 'https://github.com/vuejs/vue',
                description: '🖖 Vue.js is a progressive, incrementally-adoptable JavaScript framework.',
                language: 'TypeScript',
                languageColor: '#3178c6',
                stars: 207000,
                forks: 33700,
                starsThisWeek: 654,
                builtBy: [
                    {
                        username: 'yyx990803',
                        avatar: 'https://avatars.githubusercontent.com/u/499550?v=4',
                        url: 'https://github.com/yyx990803',
                    },
                ],
            },
        ],
    };

    saveData(mockData);
}

/**
 * 抓取多个语言的 Trending 数据并合并
 */
async function fetchMultiLanguageTrending() {
    const allRepos = [];

    for (const language of TRENDING_LANGUAGES) {
        try {
            const url = `${TRENDING_API_BASE}?language=${language}&since=weekly`;
            console.log(`📡 抓取 ${language} trending...`);

            const rawData = await httpsGet(url);
            const repos = JSON.parse(rawData);

            console.log(`  ✓ ${language}: ${repos.length} 个仓库`);
            allRepos.push(...repos);

            // 避免触发 API 限流
            await delay(500);
        } catch (error) {
            console.warn(`  ✗ ${language} 抓取失败:`, error.message);
        }
    }

    return allRepos;
}

/**
 * 抓取 GitHub Trending 数据
 */
async function fetchTrending() {
    try {
        console.log('🚀 开始抓取 GitHub Trending 前端数据...');
        console.log(`🔑 Token available: ${!!token}`);
        console.log(`📚 语言范围: ${TRENDING_LANGUAGES.join(', ')}\n`);

        const repos = await fetchMultiLanguageTrending();

        console.log(`\n✅ 总共获取 ${repos.length} 个仓库`);

        // 去重（同一个仓库可能在多个语言分类中出现）
        const uniqueRepos = [];
        const seen = new Set();

        for (const repo of repos) {
            const key = `${repo.author}/${repo.name}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueRepos.push(repo);
            }
        }

        console.log(`📊 去重后: ${uniqueRepos.length} 个唯一仓库`);

        // 按本周 Stars 排序并取前 25 个
        const sortedRepos = uniqueRepos
            .sort((a, b) => (b.currentPeriodStars || 0) - (a.currentPeriodStars || 0))
            .slice(0, 25);

        // 转换数据格式
        const { weekStart, weekEnd } = getWeekRange();
        const trendingData = {
            weekStart,
            weekEnd,
            repos: sortedRepos.map((repo, index) => ({
                rank: index + 1,
                name: repo.name,
                author: repo.author,
                url: repo.url,
                description: repo.description || 'No description provided',
                language: repo.language || 'Unknown',
                languageColor: getLanguageColor(repo.language),
                stars: repo.stars,
                forks: repo.forks,
                starsThisWeek: repo.currentPeriodStars || 0,
                builtBy: (repo.builtBy || []).map(user => ({
                    username: user.username,
                    avatar: user.avatar,
                    url: user.href,
                })),
            })),
        };

        saveData(trendingData);
        console.log('✨ 抓取完成！');
    } catch (error) {
        console.error('❌ 抓取失败:', error.message);
        console.log('📝 使用模拟数据...');
        generateMockData();
    }
}

// 执行抓取
console.log('Starting GitHub Trending update...\n');
fetchTrending();
