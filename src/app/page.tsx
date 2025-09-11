'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import bookmarksData from '@/data/bookmarks.json';

// 性能优化配置
const ITEMS_PER_PAGE = 20; // 每页显示的书签数量
const INTERSECTION_THRESHOLD = 0.1; // IntersectionObserver 触发阈值

interface Bookmark {
    title: string;
    url: string;
    description: string;
    tags: string[];
}

// 优化的懒加载书签卡片组件
const LazyBookmarkCard = ({
    bookmark,
    bookmarkIndex,
    viewMode,
    getTagColor,
}: {
    bookmark: Bookmark;
    bookmarkIndex: number;
    viewMode: 'list' | 'grid';
    getTagColor: (tag: string) => string;
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimated, setIsAnimated] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const skeletonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // 优化动画时间，减少延迟以提升流畅度
                    const delay = Math.min(bookmarkIndex * 20, 100); // 减少延迟到20ms，最大100ms
                    setTimeout(() => {
                        setIsAnimated(true);
                    }, delay);
                    observer.disconnect();
                }
            },
            {
                threshold: INTERSECTION_THRESHOLD,
                rootMargin: '50px', // 提前触发动画
            }
        );

        if (cardRef.current || skeletonRef.current) {
            observer.observe((cardRef.current || skeletonRef.current)!);
        }

        return () => observer.disconnect();
    }, [bookmarkIndex]);

    // 优化的骨架屏
    if (!isVisible) {
        return (
            <div
                ref={skeletonRef}
                className={`bookmark-card bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 transition-all duration-200 ${
                    viewMode === 'grid' ? 'flex flex-col' : ''
                }`}
                style={{ minHeight: '200px' }} // 固定骨架屏高度防止布局移位
            >
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded mb-3 w-3/4 animate-pulse"></div>
                        <div className="h-16 bg-gray-200 rounded mb-4 animate-pulse"></div>
                        <div className="flex gap-2">
                            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={cardRef}
            className={`bookmark-card bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 ${
                viewMode === 'grid' ? 'flex flex-col' : ''
            } ${
                isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            } transform-gpu will-change-transform`}
            style={{
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: isAnimated ? '0ms' : `${Math.min(bookmarkIndex * 15, 100)}ms`, // 进一步减少延迟
            }}
        >
            {/* 网格模式布局 */}
            <div className={viewMode === 'grid' ? 'flex flex-col h-full' : 'block sm:hidden'}>
                {viewMode === 'grid' ? (
                    // 网格模式：标题、URL、说明分别占一行
                    <>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-500 text-lg">🔗</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                {/* 标题单独一行 */}
                                <h3 className="text-lg font-semibold text-gray-900">{bookmark.title}</h3>
                            </div>
                        </div>
                        {/* URL单独一行，占满宽度，可点击跳转 */}
                        <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm break-all mb-3 inline-flex items-center gap-1 transition-colors"
                        >
                            {bookmark.url}
                            <svg
                                className="w-3 h-3 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                            </svg>
                        </a>
                        {/* 说明占满宽度的一行 */}
                        <p className="text-gray-600 leading-relaxed text-sm mb-4 flex-1">{bookmark.description}</p>
                        <div className="flex flex-wrap gap-2">
                            {bookmark.tags.map((tag, index) => (
                                <span
                                    key={`${bookmarkIndex}-${tag}-${index}`}
                                    className={`px-2 py-1 rounded-md text-xs font-medium ${getTagColor(tag)}`}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </>
                ) : (
                    // 移动端列表模式布局：图标和标题占一行，URL占一行，说明占满宽度
                    <>
                        {/* 图标和标题占一行 */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-500 text-lg">🔗</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 flex-1">{bookmark.title}</h3>
                        </div>

                        {/* URL占一行，可点击跳转 */}
                        <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm break-all mb-3 inline-flex items-center gap-1 transition-colors"
                        >
                            {bookmark.url}
                            <svg
                                className="w-3 h-3 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                            </svg>
                        </a>

                        {/* 说明占满宽度 */}
                        <p className="text-gray-600 leading-relaxed text-sm mb-4">{bookmark.description}</p>

                        {/* 标签 */}
                        <div className="flex flex-wrap gap-2">
                            {bookmark.tags.map((tag, index) => (
                                <span
                                    key={`${bookmarkIndex}-${tag}-${index}`}
                                    className={`px-2 py-1 rounded-md text-xs font-medium ${getTagColor(tag)}`}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* PC端布局 */}
            <div className={viewMode === 'grid' ? 'hidden' : 'hidden sm:flex sm:items-start sm:gap-4'}>
                {/* 链接图标 */}
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-500 text-lg">🔗</span>
                </div>

                {/* 内容区域 */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{bookmark.title}</h3>
                    <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm mb-3 break-all inline-flex items-center gap-1 transition-colors"
                    >
                        {bookmark.url}
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                        </svg>
                    </a>
                    <p className="text-gray-600 mb-4 leading-relaxed">{bookmark.description}</p>
                    <div className="flex flex-wrap gap-2">
                        {bookmark.tags.map((tag, index) => (
                            <span
                                key={`${bookmarkIndex}-${tag}-${index}`}
                                className={`px-2 py-1 rounded-md text-xs font-medium ${getTagColor(tag)}`}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Home() {
    const [selectedTag, setSelectedTag] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showFixedSearch, setShowFixedSearch] = useState(false);
    const [isSearching, setIsSearching] = useState(false); // 标记是否正在搜索
    const [isFixedSearchFocused, setIsFixedSearchFocused] = useState(false); // 标记固定搜索框是否有焦点
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [currentPage, setCurrentPage] = useState(1); // 当前页数
    const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE); // 当前可见项目数
    const searchSectionRef = useRef<HTMLDivElement>(null);
    const fixedSearchInputRef = useRef<HTMLInputElement>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const [hasTriggeredFixed, setHasTriggeredFixed] = useState(false); // 标记是否已经触发过固定搜索框

    // JSON-LD 结构化数据
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: '前端利器库',
        description: '精心整理的前端开发工具与资源，让你的开发更高效',
        url: 'https://maxlongint.github.io',
        author: {
            '@type': 'Person',
            name: 'Cyclone77',
        },
        potentialAction: {
            '@type': 'SearchAction',
            target: 'https://maxlongint.github.io?search={search_term_string}',
            'query-input': 'required name=search_term_string',
        },
        mainEntity: {
            '@type': 'ItemList',
            name: '前端开发工具书签',
            numberOfItems: bookmarksData.bookmarks.length,
            itemListElement: bookmarksData.bookmarks.slice(0, 10).map((bookmark, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'WebSite',
                    name: bookmark.title,
                    description: bookmark.description,
                    url: bookmark.url,
                },
            })),
        },
    };

    // 基础的书签数据筛选（用于统计）
    const filteredBookmarks = useMemo(() => {
        let bookmarks = bookmarksData.bookmarks;

        // 根据标签筛选
        if (selectedTag !== 'All') {
            bookmarks = bookmarks.filter(bookmark => bookmark.tags.includes(selectedTag));
        }

        // 根据搜索关键词筛选
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            bookmarks = bookmarks.filter(
                bookmark =>
                    bookmark.title.toLowerCase().includes(query) ||
                    bookmark.description.toLowerCase().includes(query) ||
                    bookmark.url.toLowerCase().includes(query) ||
                    bookmark.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        return bookmarks;
    }, [selectedTag, searchQuery]);

    // 无限滚动加载更多书签
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                const target = entries[0];
                if (target.isIntersecting && visibleItems < filteredBookmarks.length) {
                    setVisibleItems(prev => Math.min(prev + ITEMS_PER_PAGE, filteredBookmarks.length));
                }
            },
            { threshold: INTERSECTION_THRESHOLD }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [visibleItems, filteredBookmarks.length]);

    // 重置可见项目数当筛选条件变化时
    useEffect(() => {
        setVisibleItems(ITEMS_PER_PAGE);
        setCurrentPage(1);
    }, [selectedTag, searchQuery]);

    // 监听滚动事件，控制回到顶部按钮和固定搜索框显示
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            setShowScrollTop(scrollTop > 300);

            // 如果固定搜索框有焦点或正在输入，不执行隐藏逻辑
            if (isFixedSearchFocused || isSearching) {
                return;
            }

            // 检查搜索框区域是否滚出视窗
            if (searchSectionRef.current) {
                const searchSectionRect = searchSectionRef.current.getBoundingClientRect();
                const shouldShowFixed = searchSectionRect.bottom < -50;

                // 如果应该显示固定搜索框，标记为已触发
                if (shouldShowFixed) {
                    setHasTriggeredFixed(true);
                }

                // 只有在用户滚回到很顶部时才隐藏固定搜索框
                if (scrollTop < 100) {
                    setShowFixedSearch(false);
                    setHasTriggeredFixed(false);
                } else if (hasTriggeredFixed || shouldShowFixed) {
                    // 一旦触发过固定搜索框，或者当前应该显示，就保持显示状态
                    setShowFixedSearch(true);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasTriggeredFixed, isFixedSearchFocused, isSearching]);

    // 回到顶部函数
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    // 优化的书签数据筛选和分页
    const { displayedBookmarks, hasMore } = useMemo(() => {
        return {
            displayedBookmarks: filteredBookmarks.slice(0, visibleItems),
            hasMore: visibleItems < filteredBookmarks.length,
        };
    }, [filteredBookmarks, visibleItems]);

    // 统计信息
    const stats = useMemo(() => {
        const allBookmarks = bookmarksData.bookmarks;
        const tagCounts = new Map();

        allBookmarks.forEach(bookmark => {
            bookmark.tags.forEach(tag => {
                tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            });
        });

        return {
            total: allBookmarks.length,
            tags: tagCounts.size,
        };
    }, []);

    const getTagColor = (tag: string) => {
        const colors = {
            Tech: 'bg-blue-100 text-blue-800',
            Development: 'bg-green-100 text-green-800',
            AI: 'bg-purple-100 text-purple-800',
            Travel: 'bg-yellow-100 text-yellow-800',
            Food: 'bg-red-100 text-red-800',
            Health: 'bg-teal-100 text-teal-800',
            Finance: 'bg-indigo-100 text-indigo-800',
        };
        return colors[tag as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    // 清除搜索和筛选
    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedTag('All');
        setIsSearching(false);
        setIsFixedSearchFocused(false);
    }, []);

    // 处理搜索输入
    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchQuery(value);
            const isCurrentlySearching = value.trim().length > 0;
            setIsSearching(isCurrentlySearching);

            // 如果正在使用固定搜索框且有内容，确保固定搜索框保持显示
            if (isCurrentlySearching && showFixedSearch) {
                setHasTriggeredFixed(true);
            }
        },
        [showFixedSearch]
    );

    // 处理固定搜索框的输入和焦点保持
    const handleFixedSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            handleSearchChange(value);

            // 在输入过程中强制保持固定搜索框显示
            setHasTriggeredFixed(true);
            setShowFixedSearch(true);

            // 保持焦点在固定搜索框上
            setTimeout(() => {
                if (fixedSearchInputRef.current) {
                    fixedSearchInputRef.current.focus();
                }
            }, 0);
        },
        [handleSearchChange]
    );

    // 处理固定搜索框的焦点事件
    const handleFixedSearchFocus = useCallback(() => {
        setIsFixedSearchFocused(true);
        setHasTriggeredFixed(true);
        setShowFixedSearch(true);
    }, []);

    const handleFixedSearchBlur = useCallback(() => {
        // 延迟设置以防止快速焦点切换时的闪烁
        setTimeout(() => {
            setIsFixedSearchFocused(false);
        }, 100);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* JSON-LD 结构化数据 */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* 头部 */}
                <header className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-lg">🔗</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">前端利器库</h1>
                        </div>

                        {/* GitHub 仓库链接 */}
                        {/* <a
                            href="https://github.com/maxlongint/maxlongint.github.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors duration-200 self-start sm:self-auto"
                            title="查看项目源代码"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    fillRule="evenodd"
                                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span className="hidden sm:inline">GitHub</span>
                        </a> */}
                    </div>
                </header>

                {/* 搜索框和视图模式 */}
                <div
                    ref={searchSectionRef}
                    className={`flex flex-col sm:flex-row sm:items-center gap-4 mb-6 ${
                        showFixedSearch ? 'sm:justify-start' : 'sm:justify-between'
                    }`}
                >
                    {/* 视图模式切换 */}
                    <div className="flex items-center gap-2">
                        {showFixedSearch && (
                            <div className="flex items-center gap-1 mr-2 px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                使用顶部搜索
                            </div>
                        )}
                        <span className="text-sm text-gray-600">视图模式:</span>
                        <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-2 text-sm font-medium transition-all duration-200 relative ${
                                    viewMode === 'list'
                                        ? 'bg-blue-500 text-white shadow-sm'
                                        : 'bg-transparent text-gray-700 hover:bg-white hover:text-gray-900'
                                }`}
                            >
                                列表
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-4 py-2 text-sm font-medium transition-all duration-200 relative ${
                                    viewMode === 'grid'
                                        ? 'bg-blue-500 text-white shadow-sm'
                                        : 'bg-transparent text-gray-700 hover:bg-white hover:text-gray-900'
                                }`}
                            >
                                网格
                            </button>
                        </div>
                    </div>

                    {/* 搜索框 - 只在固定搜索框未显示时显示 */}
                    {!showFixedSearch && (
                        <div className="relative w-full max-w-md sm:max-w-lg">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                    className="w-5 h-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="搜索书签标题、描述、URL或标签..."
                                value={searchQuery}
                                onChange={e => handleSearchChange(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setIsSearching(false);
                                        setIsFixedSearchFocused(false);
                                    }}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] justify-center"
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
                            )}
                        </div>
                    )}
                </div>

                <div className="mb-6 sm:mb-8">
                    <div className="mb-4">
                        <div className="mb-3">
                            <span className="text-gray-600 font-medium text-sm sm:text-base">标签过滤:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {bookmarksData.tags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag)}
                                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-[40px] ${
                                        selectedTag === tag
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 搜索和筛选状态提示 */}
                    {(searchQuery || selectedTag !== 'All') && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                            <span>
                                显示 {displayedBookmarks.length} / {filteredBookmarks.length} 个结果
                                {searchQuery && <span className="font-medium"> 包含 &quot;{searchQuery}&quot;</span>}
                                {selectedTag !== 'All' && <span className="font-medium"> 标签: {selectedTag}</span>}
                            </span>
                            <button
                                onClick={clearFilters}
                                className="sm:ml-2 text-blue-500 hover:text-blue-700 font-medium underline self-start min-h-[44px] flex items-center"
                            >
                                清除筛选
                            </button>
                        </div>
                    )}
                </div>

                {/* 书签列表 */}
                <div
                    className={
                        viewMode === 'grid' ? 'masonry-container columns-1 sm:columns-2 lg:columns-3' : 'space-y-4'
                    }
                >
                    {displayedBookmarks.map((bookmark: Bookmark, bookmarkIndex) => (
                        <div
                            key={`${bookmark.title}-${bookmarkIndex}`}
                            className={viewMode === 'grid' ? 'masonry-item' : ''}
                        >
                            <LazyBookmarkCard
                                bookmark={bookmark}
                                bookmarkIndex={bookmarkIndex}
                                viewMode={viewMode}
                                getTagColor={getTagColor}
                            />
                        </div>
                    ))}
                </div>

                {/* 加载更多触发器 */}
                {hasMore && (
                    <div ref={loadMoreRef} className="flex justify-center items-center py-8">
                        <div className="flex items-center gap-2 text-gray-500">
                            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            <span>加载更多...</span>
                        </div>
                    </div>
                )}

                {/* 空状态 */}
                {displayedBookmarks.length === 0 && filteredBookmarks.length === 0 && (
                    <div className="text-center py-8 sm:py-12 px-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-gray-400 text-2xl">🔍</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchQuery ? '没有找到匹配的书签' : '没有找到相关书签'}
                        </h3>
                        <p className="text-gray-500 mb-4 text-sm sm:text-base">
                            {searchQuery ? `没有书签包含 &quot;${searchQuery}&quot;` : '尝试选择其他标签或查看所有书签'}
                        </p>
                        {(searchQuery || selectedTag !== 'All') && (
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center justify-center px-4 py-3 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 min-h-[44px]"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                重置筛选
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* 页脚 */}
            <footer className="mt-12 sm:mt-16 py-6 sm:py-8 border-t border-gray-200">
                <div className="text-center px-4">
                    <p className="text-gray-500 text-sm">
                        Created by <span className="font-medium text-gray-700">Cyclone77</span>
                    </p>
                </div>
            </footer>

            {/* 固定搜索框 */}
            {showFixedSearch && (
                <div className="fixed top-0 left-0 right-0 z-40 fixed-search-bar transition-all duration-300">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center justify-between gap-4">
                            {/* Logo 和标题 */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-sm">🔗</span>
                                </div>
                                <h1 className="text-lg font-bold text-gray-900 hidden sm:block">前端利器库</h1>
                            </div>

                            {/* 固定搜索框 */}
                            <div className="relative flex-1 max-w-md sm:max-w-lg">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg
                                        className="w-4 h-4 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>
                                <input
                                    ref={fixedSearchInputRef}
                                    type="text"
                                    placeholder="搜索书签..."
                                    value={searchQuery}
                                    onChange={handleFixedSearchChange}
                                    onFocus={handleFixedSearchFocus}
                                    onBlur={handleFixedSearchBlur}
                                    className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setIsSearching(false);
                                            setIsFixedSearchFocused(false);
                                            // 保持焦点在固定搜索框上
                                            setTimeout(() => {
                                                if (fixedSearchInputRef.current) {
                                                    fixedSearchInputRef.current.focus();
                                                }
                                            }, 0);
                                        }}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 min-w-[40px] min-h-[40px] justify-center"
                                        aria-label="清除搜索"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* 回到顶部按钮（小尺寸） */}
                            <button
                                onClick={scrollToTop}
                                className="flex-shrink-0 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
                                title="回到顶部"
                                aria-label="回到顶部"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 回到顶部按钮 */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
                    title="回到顶部"
                    aria-label="回到顶部"
                >
                    <svg
                        className="w-6 h-6 transform group-hover:-translate-y-0.5 transition-transform duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
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
