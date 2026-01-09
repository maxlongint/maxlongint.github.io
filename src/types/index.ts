export interface Bookmark {
    title: string;
    url: string;
    description: string;
    tags: string[];
    npmUrl?: string;
    addedDate?: string;
}

export interface GitHubRepoInfo {
    stargazers_count: number;
    npm_version: string;
    name: string;
    full_name: string;
    pushed_at?: string;
}

export interface RepoInfo {
    stargazers_count?: number;
    npm_version?: string;
    name?: string;
    full_name?: string;
    pushed_at?: string;
}

export interface GitHubInfo {
    owner: string;
    repo: string;
}

export interface NPMDownloadData {
    date: string;
    downloads: number;
}

export interface BundleSize {
    gzip: string;
    raw: string;
}

export interface TrendingRepo {
    rank: number;
    name: string;
    author: string;
    url: string;
    description: string;
    language: string;
    languageColor: string;
    stars: number;
    forks: number;
    builtBy: Array<{
        username: string;
        avatar: string;
        url: string;
    }>;
}

export interface WeeklyTrending {
    weekStart: string;
    weekEnd: string;
    repos: TrendingRepo[];
}
