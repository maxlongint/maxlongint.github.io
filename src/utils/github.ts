import type { GitHubRepoInfo, WeeklyTrending, PresetRepoInfo } from '../types';
import presetData from '../data/github-stats-preset.json';

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

// 统一加载所有 GitHub 预构建数据(preset + stats + readmes + trending)
export const loadGitHubData = async () => {
    try {
        // 使用基础路径,从 public 目录加载运行时数据
        const basePath = import.meta.env.BASE_URL || '/';

        // 并行加载 stats、readmes 和 trending 数据
        const [statsResponse, readmesResponse, trendingResponse] = await Promise.all([
            fetch(`${basePath}github-stats.json`, { cache: 'no-cache' }).catch(() => null),
            fetch(`${basePath}github-readmes.json`, { cache: 'no-cache' }).catch(() => null),
            fetch(`${basePath}trending.json`, { cache: 'no-cache' }).catch(() => null),
        ]);

        // 初始化 statsData
        let statsData: Record<string, GitHubRepoInfo> = {};

        // 优先加载实时 stats 数据
        if (statsResponse && statsResponse.ok) {
            try {
                const fullStatsData = await statsResponse.json();
                statsData = { ...fullStatsData.repos };
                console.log('✅ Loaded GitHub stats from public data');
            } catch {
                console.log('⚠️ Failed to parse github-stats.json, using preset data');
            }
        }

        // 如果实时数据不可用或解析失败,回退到预设数据
        if (Object.keys(statsData).length === 0 && presetData && presetData.repos) {
            const presetRepos = presetData.repos as Record<string, PresetRepoInfo>;
            Object.entries(presetRepos).forEach(([key, preset]) => {
                // 预设数据的 key 格式是 "owner/repo",需要转换为 "github.com/owner/repo"
                const fullKey = `github.com/${key}`;
                const parts = key.split('/');
                const name = parts[parts.length - 1];

                statsData[fullKey] = {
                    stargazers_count: preset.stars,
                    npm_version: preset.npm_version || '',
                    name: name,
                    full_name: key,
                    pushed_at: preset.updated_at,
                };
            });
            console.log('ℹ️ Using preset GitHub stats data (public data not available)');
        }

        // 将数据保存到全局
        (window as Window & { __GITHUB_STATS__?: Record<string, GitHubRepoInfo> }).__GITHUB_STATS__ = statsData;

        // 处理 readmes 数据
        if (readmesResponse && readmesResponse.ok) {
            try {
                const readmesData = await readmesResponse.json();
                (window as Window & { __GITHUB_READMES__?: Record<string, string> }).__GITHUB_READMES__ =
                    readmesData.readmes;
                console.log('✅ Loaded GitHub readmes from public data');
            } catch {
                console.log('⚠️ Failed to parse github-readmes.json');
            }
        } else {
            console.log('ℹ️ GitHub readmes not available (will be loaded on-demand)');
        }

        // 处理 trending 数据
        if (trendingResponse && trendingResponse.ok) {
            try {
                const trendingData = await trendingResponse.json();
                (window as Window & { __TRENDING_DATA__?: WeeklyTrending }).__TRENDING_DATA__ = trendingData.data;
                console.log('✅ Loaded trending data from public data');
            } catch {
                console.log('⚠️ Failed to parse trending.json');
            }
        } else {
            console.log('ℹ️ Trending data not available (requires GitHub Actions)');
        }

        // 数据加载完成后触发自定义事件,通知组件重新渲染
        window.dispatchEvent(new Event('github-data-loaded'));
    } catch (error) {
        console.warn('⚠️ Failed to load some GitHub data:', error);
    }
};

// 向后兼容的别名
export const loadGitHubStats = loadGitHubData;
