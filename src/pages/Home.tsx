import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Fuse from 'fuse.js';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import TagFilter from '../components/TagFilter';
import BookmarkList from '../components/BookmarkList';
import Footer from '../components/Footer';
import bookmarksData from '../data/bookmarks.json';
import { getGitHubRepoInfo } from '../utils/github';

function Home() {
    const [searchParams, setSearchParams] = useSearchParams();

    // 从 URL 参数读取初始标签，如果没有则默认为 '全部 (All)'
    const initialTag = searchParams.get('tag') || '全部 (All)';
    const [selectedTag, setSelectedTag] = useState(initialTag);

    const [searchQuery, setSearchQuery] = useState('');
    const [sortOpen, setSortOpen] = useState(false);
    const [selectedSort, setSelectedSort] = useState('默认');
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isSearchFixed, setIsSearchFixed] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // 从 localStorage 读取视图模式，默认为 list
    const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
        try {
            const saved = localStorage.getItem('viewMode');
            return saved === 'list' || saved === 'grid' ? saved : 'list';
        } catch {
            return 'list';
        }
    });

    // 显示提示框
    const handleShare = (message: string, type: 'success' | 'error') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // 当视图模式变化时，保存到 localStorage
    useEffect(() => {
        try {
            localStorage.setItem('viewMode', viewMode);
        } catch (error) {
            console.error('Failed to save viewMode to localStorage:', error);
        }
    }, [viewMode]);

    // 监听 URL 参数变化，同步到状态
    useEffect(() => {
        const tagFromUrl = searchParams.get('tag');
        if (tagFromUrl && tagFromUrl !== selectedTag) {
            setSelectedTag(tagFromUrl);
        }
    }, [searchParams, selectedTag]);

    // 包装 setSelectedTag 函数，同时更新 URL 参数
    const handleTagChange = useCallback(
        (tag: string) => {
            setSelectedTag(tag);

            // 更新 URL 参数
            if (tag === '全部 (All)') {
                // 如果是全部，移除 tag 参数
                searchParams.delete('tag');
            } else {
                // 否则设置 tag 参数
                searchParams.set('tag', tag);
            }
            setSearchParams(searchParams, { replace: true });
        },
        [searchParams, setSearchParams]
    );

    // 监听滚动 - 使用节流优化性能
    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    setShowScrollTop(scrollY > 300);
                    // 当滚动超过400px时，固定搜索框到Header
                    setIsSearchFixed(scrollY > 400);
                    ticking = false;
                });
                ticking = true;
            }
        };

        // 初始化时检查当前滚动位置
        handleScroll();

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 点击空白处关闭下拉框
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // 如果点击的不是排序按钮或下拉菜单内部，就关闭
            if (sortOpen && !target.closest('.sort-dropdown')) {
                setSortOpen(false);
            }
        };

        if (sortOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [sortOpen]);

    // 滚动到顶部
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 缓存 getTagColor 函数
    const getTagColor = useCallback((tag: string) => {
        const tagConfig = (
            bookmarksData.tags as Record<string, { className?: string; backgroundColor?: string; textColor?: string }>
        )[tag];
        if (tagConfig && tagConfig.backgroundColor && tagConfig.textColor) {
            // 使用新的内联样式格式
            return { backgroundColor: tagConfig.backgroundColor, color: tagConfig.textColor };
        }
        // 降级到 className（为 "All" 标签保留）
        return tagConfig?.className || 'bg-gray-100 text-gray-800';
    }, []);

    // 获取所有标签及其数量
    const tagStats = useMemo(() => {
        const stats: Record<string, number> = { '全部 (All)': bookmarksData.bookmarks.length };

        bookmarksData.bookmarks.forEach(bookmark => {
            bookmark.tags.forEach(tag => {
                stats[tag] = (stats[tag] || 0) + 1;
            });
        });

        return stats;
    }, []);

    // 配置 Fuse.js 搜索选项
    const fuseOptions = useMemo(
        () => ({
            keys: [
                { name: 'title', weight: 0.4 }, // 标题权重最高
                { name: 'tags', weight: 0.3 }, // 标签权重次之
                { name: 'url', weight: 0.15 }, // URL权重较低
                { name: 'description', weight: 0.15 }, // 描述权重较低
            ],
            threshold: 0.4, // 模糊匹配阈值（0-1，越小越严格）
            includeScore: true, // 包含匹配分数
            minMatchCharLength: 2, // 最小匹配字符长度
            ignoreLocation: true, // 忽略匹配位置，提升长文本搜索效果
        }),
        []
    );

    // 筛选和排序书签 - 使用 Fuse.js 优化搜索
    const filteredBookmarks = useMemo(() => {
        let bookmarks = bookmarksData.bookmarks;

        // 根据标签筛选
        if (selectedTag !== '全部 (All)') {
            bookmarks = bookmarks.filter(bookmark => bookmark.tags.includes(selectedTag));
        }

        // 根据搜索关键词筛选 - 使用 Fuse.js
        if (searchQuery.trim()) {
            const fuse = new Fuse(bookmarks, fuseOptions);
            const results = fuse.search(searchQuery.trim());
            bookmarks = results.map(result => result.item);
        }

        // 排序 - 提前缓存 repoInfo 避免重复查询
        if (selectedSort === '默认') {
            return bookmarks;
        }

        // 先缓存所有需要的 repoInfo
        const bookmarksWithInfo = bookmarks.map(bookmark => ({
            bookmark,
            repoInfo: getGitHubRepoInfo(bookmark.url),
        }));

        const sortedBookmarks = [...bookmarksWithInfo].sort((a, b) => {
            if (selectedSort === '名称') {
                return a.bookmark.title.localeCompare(b.bookmark.title, 'zh-CN');
            } else if (selectedSort === 'Stars') {
                const starsA = a.repoInfo?.stargazers_count || 0;
                const starsB = b.repoInfo?.stargazers_count || 0;
                return starsB - starsA;
            } else if (selectedSort === '更新日期') {
                const dateA = a.repoInfo?.pushed_at || '';
                const dateB = b.repoInfo?.pushed_at || '';
                return dateB.localeCompare(dateA);
            }
            return 0;
        });

        return sortedBookmarks.map(item => item.bookmark);
    }, [selectedTag, searchQuery, selectedSort, fuseOptions]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Toast 提示框 */}
            {showToast && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowToast(false)} />
                    <div
                        className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full transform transition-all ${
                            showToast ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                        }`}
                    >
                        <div className="flex items-start gap-4">
                            <div
                                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                                    toastType === 'success'
                                        ? 'bg-green-100 dark:bg-green-900/30'
                                        : 'bg-red-100 dark:bg-red-900/30'
                                }`}
                            >
                                {toastType === 'success' ? (
                                    <svg
                                        className="w-6 h-6 text-green-600 dark:text-green-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        className="w-6 h-6 text-red-600 dark:text-red-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3
                                    className={`text-lg font-semibold mb-1 ${
                                        toastType === 'success'
                                            ? 'text-green-900 dark:text-green-300'
                                            : 'text-red-900 dark:text-red-300'
                                    }`}
                                >
                                    {toastType === 'success' ? '复制成功！' : '复制失败'}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{toastMessage}</p>
                            </div>
                            <button
                                onClick={() => setShowToast(false)}
                                className="flex-shrink-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Header isFixed={isSearchFixed} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            {/* Hero Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">找到完美的前端工具。</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    浏览精选的库、框架和插件集合，
                    <br />
                    让您的开发流程更加高效。
                </p>
                <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
                <TagFilter
                    tags={Object.keys(tagStats)}
                    tagStats={tagStats}
                    selectedTag={selectedTag}
                    setSelectedTag={handleTagChange}
                    getTagColor={getTagColor}
                />

                <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            找到{' '}
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {filteredBookmarks.length}
                            </span>{' '}
                            个工具
                        </p>
                        <div className="flex items-center gap-4">
                            {/* 视图模式切换 */}
                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-2 transition-colors focus:outline-none ${
                                        viewMode === 'list'
                                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                    title="列表模式"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-3 py-2 transition-colors focus:outline-none ${
                                        viewMode === 'grid'
                                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                    title="网格模式"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="relative sort-dropdown">
                                <button
                                    onClick={() => setSortOpen(!sortOpen)}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    排序: {selectedSort}
                                    <svg
                                        className={`w-4 h-4 transition-transform ${sortOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>
                                {sortOpen && (
                                    <div className="absolute top-full mt-2 right-0 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                                        <div className="p-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedSort('默认');
                                                    setSortOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                            >
                                                默认
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedSort('名称');
                                                    setSortOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                            >
                                                名称
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedSort('Stars');
                                                    setSortOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                            >
                                                Stars
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedSort('更新日期');
                                                    setSortOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                            >
                                                更新日期
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <BookmarkList
                        bookmarks={filteredBookmarks}
                        viewMode={viewMode}
                        getTagColor={getTagColor}
                        onShare={handleShare}
                    />
                </div>
            </main>

            <Footer />

            {/* 回到顶部按钮 */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110"
                    aria-label="回到顶部"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                    </svg>
                </button>
            )}
        </div>
    );
}

export default Home;
