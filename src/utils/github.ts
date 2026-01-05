import type { GitHubRepoInfo, WeeklyTrending } from '../types';
import githubStatsData from '../data/github-stats.json';
import githubReadmesData from '../data/github-readmes.json';
import trendingData from '../data/trending.json';

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

// 统一加载所有 GitHub 数据(直接从 src/data 导入)
export const loadGitHubData = async () => {
    try {
        // 直接使用导入的数据
        const statsData: Record<string, GitHubRepoInfo> = githubStatsData.repos || {};

        // 将数据保存到全局
        (window as Window & { __GITHUB_STATS__?: Record<string, GitHubRepoInfo> }).__GITHUB_STATS__ = statsData;

        // 保存 readmes 数据
        (window as Window & { __GITHUB_READMES__?: Record<string, string> }).__GITHUB_READMES__ =
            githubReadmesData.readmes || {};

        // 保存 trending 数据
        (window as Window & { __TRENDING_DATA__?: WeeklyTrending }).__TRENDING_DATA__ = trendingData.data;

        // 数据加载完成后触发自定义事件,通知组件重新渲染
        window.dispatchEvent(new Event('github-data-loaded'));
    } catch (error) {
        console.warn('⚠️ Failed to load GitHub data:', error);
    }
};

// 向后兼容的别名
export const loadGitHubStats = loadGitHubData;
