import { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import TagFilter from '../components/TagFilter';
import BookmarkList from '../components/BookmarkList';
import Footer from '../components/Footer';
import ClarityProvider from '../components/ClarityProvider';
import bookmarksData from '../data/bookmarks.json';
import { getGitHubRepoInfo } from '../utils/github';

function Home() {
    const [selectedTag, setSelectedTag] = useState('全部 (All)');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOpen, setSortOpen] = useState(false);
    const [selectedSort, setSelectedSort] = useState('默认');
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isSearchFixed, setIsSearchFixed] = useState(false);

    // 从 localStorage 读取视图模式，默认为 list
    const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => {
        try {
            const saved = localStorage.getItem('viewMode');
            return saved === 'list' || saved === 'grid' ? saved : 'list';
        } catch {
            return 'list';
        }
    });

    // 当视图模式变化时，保存到 localStorage
    useEffect(() => {
        try {
            localStorage.setItem('viewMode', viewMode);
        } catch (error) {
            console.error('Failed to save viewMode to localStorage:', error);
        }
    }, [viewMode]);

    // 浏览器空闲时预加载 Giscus 脚本
    useEffect(() => {
        const preloadGiscus = () => {
            // 检查是否已经加载过
            if (document.querySelector('script[src="https://giscus.app/client.js"]')) {
                return;
            }

            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = 'https://giscus.app/client.js';
            link.as = 'script';
            document.head.appendChild(link);

            console.log('✅ Giscus script preloaded');
        };

        // 使用 requestIdleCallback 在浏览器空闲时执行
        if ('requestIdleCallback' in window) {
            requestIdleCallback(preloadGiscus, { timeout: 2000 });
        } else {
            // 降级方案：延迟 2 秒执行
            setTimeout(preloadGiscus, 2000);
        }
    }, []);

    // 监听滚动
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setShowScrollTop(scrollY > 300);
            // 当滚动超过400px时，固定搜索框到Header
            setIsSearchFixed(scrollY > 400);
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

    // 筛选和排序书签
    const filteredBookmarks = useMemo(() => {
        let bookmarks = bookmarksData.bookmarks;

        // 根据标签筛选
        if (selectedTag !== '全部 (All)') {
            bookmarks = bookmarks.filter(bookmark => bookmark.tags.includes(selectedTag));
        }

        // 根据搜索关键词筛选
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            bookmarks = bookmarks.filter(bookmark => {
                const cleanUrl = bookmark.url.replace(/^https?:\/\//, '').toLowerCase();
                return (
                    bookmark.title.toLowerCase().includes(query) ||
                    bookmark.description.toLowerCase().includes(query) ||
                    cleanUrl.includes(query) ||
                    bookmark.tags.some(tag => tag.toLowerCase().includes(query))
                );
            });
        }

        // 排序
        const sortedBookmarks = [...bookmarks].sort((a, b) => {
            if (selectedSort === '默认') {
                // 保持原始顺序
                return 0;
            } else if (selectedSort === '名称') {
                // 按名称字母顺序
                return a.title.localeCompare(b.title, 'zh-CN');
            } else if (selectedSort === 'Stars') {
                // 按Stars数量降序
                const starsA = getGitHubRepoInfo(a.url)?.stargazers_count || 0;
                const starsB = getGitHubRepoInfo(b.url)?.stargazers_count || 0;
                return starsB - starsA;
            } else if (selectedSort === '更新日期') {
                // 按更新日期降序（最近的在前）
                const dateA = getGitHubRepoInfo(a.url)?.pushed_at || '';
                const dateB = getGitHubRepoInfo(b.url)?.pushed_at || '';
                return dateB.localeCompare(dateA);
            }
            return 0;
        });

        return sortedBookmarks;
    }, [selectedTag, searchQuery, selectedSort]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Microsoft Clarity - 直接配置 Project ID */}
            <ClarityProvider projectId="t7y8qtm5hl" enabled={true} />

            <Header isFixed={isSearchFixed} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            {/* Hero Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h2 className="text-5xl font-bold text-gray-900 mb-4">找到完美的前端工具。</h2>
                <p className="text-lg text-gray-600 mb-8">
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
                    setSelectedTag={setSelectedTag}
                    getTagColor={(tag: string) => {
                        const tagConfig = (
                            bookmarksData.tags as Record<
                                string,
                                { className?: string; backgroundColor?: string; textColor?: string }
                            >
                        )[tag];
                        if (tagConfig && tagConfig.backgroundColor && tagConfig.textColor) {
                            // 使用新的内联样式格式
                            return { backgroundColor: tagConfig.backgroundColor, color: tagConfig.textColor };
                        }
                        // 降级到 className（为 "All" 标签保留）
                        return tagConfig?.className || 'bg-gray-100 text-gray-800';
                    }}
                />

                <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-gray-600 text-sm">
                            找到 <span className="font-semibold text-gray-900">{filteredBookmarks.length}</span> 个工具
                        </p>
                        <div className="flex items-center gap-4">
                            {/* 视图模式切换 */}
                            <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-2 transition-colors focus:outline-none ${
                                        viewMode === 'list'
                                            ? 'bg-gray-200 text-gray-900'
                                            : 'text-gray-600 hover:bg-gray-100'
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
                                            ? 'bg-gray-200 text-gray-900'
                                            : 'text-gray-600 hover:bg-gray-100'
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
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
                                    <div className="absolute top-full mt-2 right-0 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                        <div className="p-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedSort('默认');
                                                    setSortOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                            >
                                                默认
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedSort('名称');
                                                    setSortOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                            >
                                                名称
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedSort('Stars');
                                                    setSortOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                            >
                                                Stars
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedSort('更新日期');
                                                    setSortOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
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
                        getTagColor={(tag: string) => {
                            const tagConfig = (
                                bookmarksData.tags as Record<
                                    string,
                                    { className?: string; backgroundColor?: string; textColor?: string }
                                >
                            )[tag];
                            if (tagConfig && tagConfig.backgroundColor && tagConfig.textColor) {
                                // 使用新的内联样式格式
                                return { backgroundColor: tagConfig.backgroundColor, color: tagConfig.textColor };
                            }
                            // 降级到 className（为 "All" 标签保留）
                            return tagConfig?.className || 'bg-gray-100 text-gray-800';
                        }}
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
