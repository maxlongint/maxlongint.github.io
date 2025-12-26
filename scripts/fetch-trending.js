import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从环境变量获取 Token（Trending API 不需要，但保留以便未来扩展）
const token = process.env.GITHUB_TOKEN;

// 前端相关语言：JavaScript, HTML, CSS
const TRENDING_LANGUAGES = ['javascript', 'html', 'css'];

/**
 * 获取当前日期（用于每日趋势）
 */
function getDailyRange() {
    const now = new Date();

    // 使用本地日期而不是 UTC
    const formatDate = date => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const today = formatDate(now);

    return {
        weekStart: today, // 复用字段名，以保持数据结构一致
        weekEnd: today,
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
 * 保存数据到 src/data 目录
 */
function saveData(trendingData) {
    const outputDir = path.join(__dirname, '../src/data');
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
    const { weekStart, weekEnd } = getDailyRange();
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
 * 使用 GitHub Search API 获取每日热门仓库
 * 策略：搜索最近推送更新且 Stars 数量高的项目
 */
async function fetchGitHubTrending(language) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const since = yesterday.toISOString().split('T')[0];

    const query = `language:${language} pushed:>${since} stars:>50`;
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
        query
    )}&sort=stars&order=desc&per_page=30`;

    const headers = {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/vnd.github.v3+json',
    };

    if (token) {
        headers.Authorization = `token ${token}`;
    }

    return new Promise((resolve, reject) => {
        https
            .get(url, { headers }, res => {
                let data = '';
                res.on('data', chunk => {
                    data += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        const result = JSON.parse(data);
                        const repos = result.items.map((repo, index) => ({
                            rank: index + 1,
                            name: repo.name,
                            author: repo.owner.login,
                            url: repo.html_url,
                            description: repo.description || '暂无描述',
                            language: repo.language || language,
                            languageColor: getLanguageColor(repo.language || language),
                            stars: repo.stargazers_count,
                            forks: repo.forks_count,
                            builtBy: [
                                {
                                    username: repo.owner.login,
                                    avatar: repo.owner.avatar_url,
                                    url: repo.owner.html_url,
                                },
                            ],
                        }));
                        resolve(repos);
                    } else if (res.statusCode === 403) {
                        reject(new Error('API 频率限制，请配置 GITHUB_TOKEN'));
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                    }
                });
            })
            .on('error', reject);
    });
}

/**
 * 抓取 GitHub Trending 数据
 */
async function fetchTrending() {
    try {
        console.log('🚀 开始抓取 GitHub Trending 前端数据...');
        console.log(`🔑 Token available: ${!!token}`);
        console.log(`📚 语言范围: ${TRENDING_LANGUAGES.join(', ')}\n`);

        const allRepos = [];

        // 逐个语言抓取
        for (const language of TRENDING_LANGUAGES) {
            try {
                console.log(`📡 抓取 ${language} trending...`);
                const repos = await fetchGitHubTrending(language);
                console.log(`  ✓ ${language}: ${repos.length} 个仓库`);
                allRepos.push(...repos);
                // 避免 API 限流
                await delay(1000);
            } catch (error) {
                console.warn(`  ✗ ${language} 抓取失败:`, error.message);
            }
        }

        console.log(`\n✅ 总共获取 ${allRepos.length} 个仓库`);

        // 去重（同一个仓库可能在多个语言分类中出现）
        const uniqueRepos = [];
        const seen = new Set();

        for (const repo of allRepos) {
            const key = `${repo.author}/${repo.name}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueRepos.push(repo);
            }
        }

        console.log(`📊 去重后: ${uniqueRepos.length} 个唯一仓库`);

        // 过滤掉非纯前端项目
        const frontendKeywords = [
            'react',
            'vue',
            'angular',
            'svelte',
            'next',
            'nuxt',
            'vite',
            'webpack',
            'ui',
            'component',
            'design',
            'css',
            'tailwind',
            'animation',
            'chart',
            'visualization',
            'three',
            'canvas',
            'webgl',
            'pwa',
            'responsive',
        ];

        const excludeKeywords = [
            'workflow',
            'automation',
            'agent',
            'platform',
            'backend',
            'server',
            'database',
            'deployment',
            'devops',
            'monitoring',
            'observability',
        ];

        const filteredRepos = uniqueRepos.filter(repo => {
            const text = `${repo.name} ${repo.description}`.toLowerCase();

            // 检查是否包含排除关键词
            const hasExcludeKeyword = excludeKeywords.some(keyword => text.includes(keyword));
            if (hasExcludeKeyword) {
                console.log(`  ⊗ 排除: ${repo.author}/${repo.name} (包含非前端关键词)`);
                return false;
            }

            return true;
        });

        console.log(`🎯 过滤后: ${filteredRepos.length} 个前端项目`);

        // 按 Stars 排序并取前 30 个
        const sortedRepos = filteredRepos.sort((a, b) => b.stars - a.stars).slice(0, 30);

        // 转换数据格式
        const { weekStart, weekEnd } = getDailyRange();
        const trendingData = {
            weekStart,
            weekEnd,
            repos: sortedRepos.map((repo, index) => ({
                ...repo,
                rank: index + 1,
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
