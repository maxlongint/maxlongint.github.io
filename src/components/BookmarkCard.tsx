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
}

export default function BookmarkCard({ bookmark, viewMode, getTagColor, onShare }: BookmarkCardProps) {
    const navigate = useNavigate();
    const githubInfo = getGitHubInfo(bookmark.url);
    const [favorited, setFavorited] = useState(false);

    // 获取仓库的 GitHub 信息（用于显示 Stars）
    const repoInfo = getGitHubRepoInfo(bookmark.url);

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
            const blob = await response.blob();

            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob,
                }),
            ]);

            onShare?.('分享卡片已复制到剪贴板！\n可以直接粘贴到 QQ、微信等应用分享啦~', 'success');
        } catch (error) {
            console.error('复制失败:', error);
            onShare?.('自动复制失败，已为您打开图片\n请手动右键保存后分享', 'error');
            window.open(ogImageUrl, '_blank');
        }
    };

    // 收藏按钮处理
    const handleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newFavorited = toggleFavorite(bookmark.title);
        setFavorited(newFavorited);
    };

    return (
        <div className="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300">
            {/* 网格模式或移动端布局 */}
            <div className={viewMode === 'grid' ? 'block' : 'md:hidden'}>
                {/* 第一行：图标、标题和版本号 */}
                <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white overflow-hidden flex-shrink-0">
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
                        <span className="text-xl font-bold" style={{ display: githubInfo ? 'none' : 'block' }}>
                            {bookmark.title.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3
                            onClick={handleTitleClick}
                            className="text-base font-bold text-gray-900 dark:text-white mb-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            {bookmark.title}
                        </h3>
                        {/* Stars 数量徽章 */}
                        {repoInfo && repoInfo.stargazers_count > 0 && (
                            <a
                                href={`https://github.com/${repoInfo.full_name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="inline-block hover:opacity-80 transition-opacity"
                                title="点击查看 GitHub 仓库"
                            >
                                <img
                                    src={`https://img.shields.io/github/stars/${repoInfo.full_name}?style=flat-square&logo=github&label=stars&color=yellow`}
                                    alt={`GitHub stars ${repoInfo.stargazers_count}`}
                                    className="h-5"
                                />
                            </a>
                        )}
                    </div>
                </div>

                {/* 第二行：描述 */}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 leading-relaxed">{bookmark.description}</p>

                {/* 第三行：标签和操作按钮 */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <div className="flex flex-wrap gap-1.5 flex-1">
                        {bookmark.tags.slice(0, 3).map((tag, index) => {
                            const tagColor = getTagColor(tag);
                            const isStyleObject = typeof tagColor === 'object';
                            return (
                                <span
                                    key={`${tag}-${index}`}
                                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                        isStyleObject ? '' : tagColor
                                    }`}
                                    style={isStyleObject ? tagColor : undefined}
                                >
                                    {tag}
                                </span>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-1">
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

                {/* 第四行：统计信息 */}
                <div className="mb-2">
                    <GitHubStats url={bookmark.url} />
                </div>

                {/* 第五行：兼容性信息（移动端单独一行） */}
                {repoInfo?.name && <CompatibilityBadges packageName={repoInfo.name} />}
            </div>

            {/* PC端列表模式布局 */}
            <div className={viewMode === 'list' ? 'hidden md:flex items-start gap-4' : 'hidden'}>
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white overflow-hidden flex-shrink-0">
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
                    <span className="text-xl font-bold" style={{ display: githubInfo ? 'none' : 'block' }}>
                        {bookmark.title.charAt(0).toUpperCase()}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                            <h3
                                onClick={handleTitleClick}
                                className="text-base font-bold text-gray-900 dark:text-white mb-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                {bookmark.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{bookmark.description}</p>
                        </div>
                        {/* Stars 数量徽章 */}
                        {repoInfo && repoInfo.stargazers_count > 0 && (
                            <a
                                href={`https://github.com/${repoInfo.full_name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="hover:opacity-80 transition-opacity flex-shrink-0"
                                title="点击查看 GitHub 仓库"
                            >
                                <img
                                    src={`https://img.shields.io/github/stars/${repoInfo.full_name}?style=flat-square&logo=github&label=stars&color=yellow`}
                                    alt={`GitHub stars ${repoInfo.stargazers_count}`}
                                    className="h-5"
                                />
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
                                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                            isStyleObject ? '' : tagColor
                                        }`}
                                        style={isStyleObject ? tagColor : undefined}
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
                    <div className="flex items-start justify-between gap-2">
                        <GitHubStats url={bookmark.url} />
                        {repoInfo?.name && <CompatibilityBadges packageName={repoInfo.name} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
