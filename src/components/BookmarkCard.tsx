import type { Bookmark } from '../types';
import GitHubStats from './GitHubStats';
import CompatibilityBadges from './CompatibilityBadges';
import { getGitHubRepoInfo, getGitHubInfo } from '../utils/github';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isFavorite, toggleFavorite } from '../utils/favorites';

interface BookmarkCardProps {
    bookmark: Bookmark;
    viewMode: 'list' | 'grid';
    getTagColor: (tag: string) => string | { backgroundColor: string; color: string };
    onShare?: (message: string, type: 'success' | 'error') => void;
    onTagClick?: (tag: string) => void;
}

export default function BookmarkCard({ bookmark, viewMode, getTagColor, onShare, onTagClick }: BookmarkCardProps) {
    const navigate = useNavigate();
    const githubInfo = getGitHubInfo(bookmark.url);
    const [favorited, setFavorited] = useState(false);
    const [, forceUpdate] = useState({});

    // 获取仓库的 GitHub 信息（用于显示 Stars）
    const repoInfo = getGitHubRepoInfo(bookmark.url);

    // 从 npmUrl 中提取 npm 包名，如果没有则从 GitHub URL 提取仓库名
    const getNpmPackageName = () => {
        // 1. 优先使用 npmUrl（支持 scoped packages）
        if (bookmark.npmUrl) {
            const match = bookmark.npmUrl.match(/npmjs\.com\/package\/(@[^/]+\/[^/?]+|[^/?]+)/);
            if (match) {
                return match[1];
            }
        }
        // 2. 回退到 GitHub 仓库名（直接从 URL 提取，不依赖延迟加载的数据）
        if (githubInfo) {
            return githubInfo.repo;
        }
        return null;
    };

    const npmPackageName = getNpmPackageName();

    // 初始化收藏状态
    useEffect(() => {
        setFavorited(isFavorite(bookmark.title));

        // 监听收藏变化事件
        const handleFavoritesChanged = () => {
            setFavorited(isFavorite(bookmark.title));
        };

        window.addEventListener('favorites-changed', handleFavoritesChanged);
        return () => window.removeEventListener('favorites-changed', handleFavoritesChanged);
    }, [bookmark.title]);

    // 监听 GitHub 数据加载完成事件
    useEffect(() => {
        const handleDataLoaded = () => {
            forceUpdate({}); // 强制重新渲染，显示最新的 GitHub 数据
        };

        window.addEventListener('github-data-loaded', handleDataLoaded);
        return () => window.removeEventListener('github-data-loaded', handleDataLoaded);
    }, []);

    // 生成URL友好的路由名称（使用title的小写形式）
    const routeName = bookmark.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // 处理标题点击 - 路由跳转到详情页
    const handleTitleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/${routeName}`);
    };

    // 分享按钮处理
    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();

        const ogImageUrl = `${window.location.origin}/og-images/${routeName}.png`;

        try {
            const response = await fetch(ogImageUrl);

            // 严格检查响应状态和内容类型
            if (!response.ok || response.status !== 200) {
                throw new Error(`图片不存在 (HTTP ${response.status})`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.startsWith('image/')) {
                throw new Error(`返回的不是图片文件 (${contentType})`);
            }

            const blob = await response.blob();

            // 再次验证 blob 类型
            if (!blob.type.startsWith('image/')) {
                throw new Error(`Blob 类型不正确 (${blob.type})`);
            }

            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob,
                }),
            ]);

            onShare?.('分享卡片已复制到剪贴板！\n可以直接粘贴到 QQ、微信等应用分享啦~', 'success');
        } catch (error) {
            console.error('复制失败:', error);
            onShare?.('分享图片不存在或复制失败\n请联系管理员生成分享图片', 'error');
        }
    };

    // 收藏按钮处理
    const handleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newFavorited = toggleFavorite(bookmark.title);
        setFavorited(newFavorited);
    };

    // 判断是否为新收录（7天内）
    const isNew = () => {
        if (!bookmark.addedDate) return false;
        const added = new Date(bookmark.addedDate);
        const now = new Date();
        const diffDays = (now.getTime() - added.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
    };

    return (
        <div className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-300">
            {/* 网格模式或移动端布局 */}
            <div className={viewMode === 'grid' ? 'flex flex-col h-full' : 'md:hidden'}>
                {/* 第一行：图标和 Stars */}
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white overflow-hidden flex-shrink-0">
                        {githubInfo ? (
                            <img
                                src={`https://github.com/${githubInfo.owner}.png?size=48`}
                                alt={`${bookmark.title} icon`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                width="48"
                                height="48"
                                onError={e => {
                                    e.currentTarget.style.display = 'none';
                                    if (e.currentTarget.nextSibling) {
                                        (e.currentTarget.nextSibling as HTMLElement).style.display = 'block';
                                    }
                                }}
                            />
                        ) : null}
                        <span className="text-lg font-bold" style={{ display: githubInfo ? 'none' : 'block' }}>
                            {bookmark.title.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    {/* Stars 数量徽章 */}
                    {repoInfo && repoInfo.stargazers_count > 0 && (
                        <a
                            href={`https://github.com/${repoInfo.full_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="group/github-btn flex items-center bg-[#1e2736] hover:bg-[#2a3548] rounded-full overflow-hidden transition-colors flex-shrink-0"
                            title="点击查看 GitHub 仓库"
                        >
                            <div className="flex items-center gap-1.5 px-3 py-1.5">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                <span className="text-white text-xs font-medium">GitHub</span>
                            </div>
                            <div className="w-px h-5 bg-gray-600"></div>
                            <div className="flex items-center gap-1 px-3 py-1.5">
                                <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-white text-xs font-semibold">
                                    {repoInfo.stargazers_count >= 1000
                                        ? `${Math.round(repoInfo.stargazers_count / 100) / 10}k`
                                        : repoInfo.stargazers_count}
                                </span>
                            </div>
                        </a>
                    )}
                </div>

                {/* 中部内容区 - 使用 mb-auto 自动填充 */}
                <div className="mb-auto">
                    {/* 第二行：标题和 NEW 徽章 */}
                    <div className="flex items-center gap-2 mb-2">
                        <h3
                            onClick={handleTitleClick}
                            className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            {bookmark.title}
                        </h3>
                        {/* NEW 徽章 */}
                        {isNew() && (
                            <div className="flex items-center">
                                <span className="relative flex h-2 w-2 mr-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                                    New
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-4 leading-relaxed">
                        {bookmark.description}
                    </p>
                </div>

                {/* 标签 */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {bookmark.tags.slice(0, 3).map((tag, index) => {
                        const tagColor = getTagColor(tag);
                        const isStyleObject = typeof tagColor === 'object';
                        return (
                            <span
                                key={`${tag}-${index}`}
                                className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${isStyleObject ? '' : tagColor}`}
                                style={isStyleObject ? tagColor : undefined}
                                onClick={e => {
                                    e.stopPropagation();
                                    onTagClick?.(tag);
                                }}
                            >
                                {tag}
                            </span>
                        );
                    })}
                </div>

                {/* 底部操作栏 */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex gap-3 font-mono">
                        <GitHubStats url={bookmark.url} />
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleFavorite}
                            className={`text-gray-400 hover:text-pink-500 transition-colors ${
                                favorited ? 'text-pink-500' : ''
                            }`}
                            title={favorited ? '取消收藏' : '收藏'}
                        >
                            <svg
                                className="w-4 h-4"
                                fill={favorited ? 'currentColor' : 'none'}
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                        </button>
                        <button
                            onClick={() => navigate(`/${routeName}`)}
                            className="text-gray-400 hover:text-blue-500 transition-colors"
                            title="详情"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* PC端列表模式布局 */}
            <div className={viewMode === 'list' ? 'hidden md:flex items-start gap-4' : 'hidden'}>
                {/* Icon */}
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white overflow-hidden flex-shrink-0">
                    {githubInfo ? (
                        <img
                            src={`https://github.com/${githubInfo.owner}.png?size=56`}
                            alt={`${bookmark.title} icon`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            width="56"
                            height="56"
                            onError={e => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextSibling) {
                                    (e.currentTarget.nextSibling as HTMLElement).style.display = 'block';
                                }
                            }}
                        />
                    ) : null}
                    <span className="text-xl font-bold" style={{ display: githubInfo ? 'none' : 'block' }}>
                        {bookmark.title.charAt(0).toUpperCase()}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                                <h3
                                    onClick={handleTitleClick}
                                    className="text-lg font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    {bookmark.title}
                                </h3>
                                {/* NEW 徽章 */}
                                {isNew() && (
                                    <span className="relative inline-flex items-center justify-center px-2 py-0.5 overflow-hidden font-bold text-white rounded-full bg-gradient-to-br from-pink-500 to-orange-400 shadow-md shadow-orange-500/20 text-[10px] uppercase tracking-wider animate-pulse-slow ring-1 ring-white/20">
                                        <span className="mr-0.5">✨</span> New
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
                                {bookmark.description}
                            </p>
                        </div>
                        {/* Stars 数量徽章 */}
                        {repoInfo && repoInfo.stargazers_count > 0 && (
                            <a
                                href={`https://github.com/${repoInfo.full_name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="group/github-btn flex items-center bg-[#1e2736] hover:bg-[#2a3548] rounded-full overflow-hidden transition-colors flex-shrink-0"
                                title="点击查看 GitHub 仓库"
                            >
                                <div className="flex items-center gap-1.5 px-2.5 py-1">
                                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                    </svg>
                                    <span className="text-white text-xs font-medium">GitHub</span>
                                </div>
                                <div className="w-px h-4 bg-gray-600"></div>
                                <div className="flex items-center gap-1 px-2.5 py-1">
                                    <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-white text-xs font-semibold">
                                        {repoInfo.stargazers_count >= 1000
                                            ? `${Math.round(repoInfo.stargazers_count / 100) / 10}k`
                                            : repoInfo.stargazers_count}
                                    </span>
                                </div>
                            </a>
                        )}
                    </div>

                    {/* Tags and Actions Row */}
                    <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex flex-wrap gap-1.5">
                            {bookmark.tags.slice(0, 3).map((tag, index) => {
                                const tagColor = getTagColor(tag);
                                const isStyleObject = typeof tagColor === 'object';
                                return (
                                    <span
                                        key={`${tag}-${index}`}
                                        className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity ${
                                            isStyleObject ? '' : tagColor
                                        }`}
                                        style={isStyleObject ? tagColor : undefined}
                                        onClick={e => {
                                            e.stopPropagation();
                                            onTagClick?.(tag);
                                        }}
                                    >
                                        {tag}
                                    </span>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleFavorite}
                                className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${
                                    favorited
                                        ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'
                                        : 'text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'
                                }`}
                                title={favorited ? '取消收藏' : '添加收藏'}
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill={favorited ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex-shrink-0 p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                                title="分享卡片"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Stats and Compatibility Row */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                        <GitHubStats url={bookmark.url} showOnly="version" />
                        <div className="flex items-center gap-4">
                            <GitHubStats url={bookmark.url} showOnly="other" />
                            {npmPackageName && <CompatibilityBadges packageName={npmPackageName} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
