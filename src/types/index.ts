export interface Bookmark {
    title: string;
    url: string;
    description: string;
    tags: string[];
}

export interface GitHubRepoInfo {
    stargazers_count: number;
    npm_version: string;
    name: string;
    full_name: string;
    pushed_at?: string;
}

export interface NPMDownloadData {
    date: string;
    downloads: number;
}

export interface BundleSize {
    gzip: string;
    raw: string;
}
