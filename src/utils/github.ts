import type { GitHubRepoInfo, WeeklyTrending, PresetRepoInfo } from '../types';

// 提取 GitHub 仓库信息
export const getGitHubInfo = (url: string) => {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
        return {
            owner: match[1],
            repo: match[2].replace(/\.git$/, ''),
        };
    }
    return null;
};

// 获取GitHub仓库信息的工具函数
export const getGitHubRepoInfo = (url: string): GitHubRepoInfo | null => {
    if (!url.includes('github.com')) return null;

    const urlKey = url
        .replace(/^https?:\/\//, '')
        .split('?')[0]
        .split('#')[0];

    // 从运行时加载的数据获取
    const runtimeData = (window as Window & { __GITHUB_STATS__?: Record<string, GitHubRepoInfo> }).__GITHUB_STATS__;
    if (runtimeData && runtimeData[urlKey]) {
        return runtimeData[urlKey];
    }

    return null;
};

// 获取 GitHub README 内容（从预构建数据）
export const getGitHubReadme = async (owner: string, repo: string): Promise<string | null> => {
    try {
        // 优先从运行时加载的 README 数据获取
        const runtimeData = (window as Window & { __GITHUB_READMES__?: Record<string, string> }).__GITHUB_READMES__;
        const readmeKey = `${owner}/${repo}`;

        if (runtimeData && runtimeData[readmeKey]) {
            return runtimeData[readmeKey];
        }

        return null;
    } catch (error) {
        console.warn('Failed to get README:', error);
        return null;
    }
};

// 获取 Trending 数据
export const getTrendingData = (): WeeklyTrending | null => {
    try {
        const runtimeData = (window as Window & { __TRENDING_DATA__?: WeeklyTrending }).__TRENDING_DATA__;
        return runtimeData || null;
    } catch (error) {
        console.warn('Failed to get Trending data:', error);
        return null;
    }
};

// 统一加载所有 GitHub 预构建数据（preset + stats + readmes + trending）
export const loadGitHubData = async () => {
    try {
        // 使用基础路径，从 public 目录加载运行时数据
        const basePath = import.meta.env.BASE_URL || '/';

        // 并行加载 preset、stats、readmes 和 trending 数据
        const [presetResponse, statsResponse, readmesResponse, trendingResponse] = await Promise.all([
            import('../data/github-stats-preset.json'),
            fetch(`${basePath}github-stats.json`).catch(() => null),
            fetch(`${basePath}github-readmes.json`).catch(() => null),
            fetch(`${basePath}trending.json`).catch(() => null),
        ]);

        // 初始化 statsData，先加载预设数据作为基础
        let statsData: Record<string, GitHubRepoInfo> = {};

        // 首先加载预设数据作为基础，转换格式
        if (presetResponse && presetResponse.repos) {
            const presetRepos = presetResponse.repos as Record<string, PresetRepoInfo>;
            Object.entries(presetRepos).forEach(([key, preset]) => {
                // 从 URL中提取 owner 和 repo 名称
                const parts = key.split('/');
                const name = parts[parts.length - 1];

                statsData[key] = {
                    stargazers_count: preset.stars,
                    npm_version: '',
                    name: name,
                    full_name: key.replace('github.com/', ''),
                    pushed_at: preset.updated_at,
                };
            });
            console.log('Loaded GitHub preset stats');
        }

        // 然后加载完整的 stats 数据（如果可用，会覆盖预设数据）
        if (statsResponse && statsResponse.ok) {
            const fullStatsData = await statsResponse.json();
            statsData = { ...statsData, ...fullStatsData.repos };
            console.log('Loaded GitHub stats from public data');
        } else {
            console.log('Using preset GitHub stats data');
        }

        // 将合并后的数据保存到全局
        (window as Window & { __GITHUB_STATS__?: Record<string, GitHubRepoInfo> }).__GITHUB_STATS__ = statsData;

        // 处理 readmes 数据
        if (readmesResponse && readmesResponse.ok) {
            const readmesData = await readmesResponse.json();
            (window as Window & { __GITHUB_READMES__?: Record<string, string> }).__GITHUB_READMES__ =
                readmesData.readmes;
        }

        // 处理 trending 数据
        if (trendingResponse && trendingResponse.ok) {
            const trendingData = await trendingResponse.json();
            (window as Window & { __TRENDING_DATA__?: WeeklyTrending }).__TRENDING_DATA__ = trendingData.data;
        }
    } catch (error) {
        console.warn('Failed to load GitHub data:', error);
    }
};

// 向后兼容的别名
export const loadGitHubStats = loadGitHubData;
