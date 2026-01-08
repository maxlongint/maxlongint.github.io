import { getGitHubRepoInfo } from '../utils/github';

interface GitHubStatsProps {
    url: string;
    showOnly?: 'version' | 'other';
}

// 格式化更新时间为中文
const formatUpdateTime = (dateStr: string) => {
    // 使用 ISO 8601 标准解析日期
    const date = new Date(dateStr);
    const now = new Date();

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
        return '未知';
    }

    // 计算时差（毫秒）
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;

    const years = Math.floor(diffDays / 365);
    if (years < 10) return `${years}年前`;
    return '很久远';
};

export default function GitHubStats({ url, showOnly }: GitHubStatsProps) {
    const repoInfo = getGitHubRepoInfo(url);

    if (!url.includes('github.com') || !repoInfo) {
        return null;
    }

    // 只显示版本号
    if (showOnly === 'version') {
        if (!repoInfo.npm_version || repoInfo.npm_version === 'N/A') {
            return null;
        }
        return (
            <a
                href={`https://www.npmjs.com/package/${repoInfo.name}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                title="查看 npm 包"
            >
                <span className="text-red-500">📦</span>
                <span className="font-mono">v{repoInfo.npm_version}</span>
            </a>
        );
    }

    // 只显示其他信息（更新时间）
    if (showOnly === 'other') {
        if (!repoInfo.pushed_at) {
            return null;
        }
        return (
            <span className="flex items-center gap-1 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <span>{formatUpdateTime(repoInfo.pushed_at)}</span>
            </span>
        );
    }

    // 默认显示全部
    return (
        <div className="flex items-center gap-3 text-xs text-gray-500">
            {/* Update Time */}
            {repoInfo.pushed_at && (
                <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <span>{formatUpdateTime(repoInfo.pushed_at)}</span>
                </span>
            )}

            {/* npm Version - 普通文字显示 */}
            {repoInfo.npm_version && repoInfo.npm_version !== 'N/A' && (
                <a
                    href={`https://www.npmjs.com/package/${repoInfo.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                    title="查看 npm 包"
                >
                    <span className="text-red-500">📦</span>
                    <span className="font-mono">v{repoInfo.npm_version}</span>
                </a>
            )}
        </div>
    );
}
