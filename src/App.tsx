import { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import TagFilter from './components/TagFilter';
import BookmarkList from './components/BookmarkList';
import Footer from './components/Footer';
import Comments from './components/Comments';
import bookmarksData from './data/bookmarks.json';

export interface Bookmark {
    title: string;
    url: string;
    description: string;
    tags: string[];
}

function App() {
    const [selectedTag, setSelectedTag] = useState('全部 (All)');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isHeaderFixed, setIsHeaderFixed] = useState(false);

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

    // 筛选书签
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

        return bookmarks;
    }, [selectedTag, searchQuery]);

    // 监听滚动
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            // 滚动超过 300px 显示回到顶部按钮
            setShowScrollTop(scrollTop > 300);
            // 滚动超过 100px 固定头部
            setIsHeaderFixed(scrollTop > 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 滚动到顶部
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 固定的头部区域 */}
            <div
                className={`transition-all duration-300 ${
                    isHeaderFixed ? 'fixed top-0 left-0 right-0 z-30 bg-white shadow-md' : ''
                }`}
            >
                <Header onOpenComments={() => setIsCommentsOpen(true)} />

                {isHeaderFixed && (
                    <div className="bg-gray-50 border-t border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                        </div>
                    </div>
                )}
            </div>

            {/* 占位空间，防止内容跳动 */}
            {isHeaderFixed && <div className="h-[148px]" />}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 非固定状态下的搜索栏 */}
                {!isHeaderFixed && <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}

                <TagFilter
                    tags={Object.keys(tagStats)}
                    tagStats={tagStats}
                    selectedTag={selectedTag}
                    setSelectedTag={setSelectedTag}
                    getTagColor={(tag: string) =>
                        (bookmarksData.tagColors as Record<string, string>)[tag] || 'bg-gray-100 text-gray-800'
                    }
                />

                <div className="mt-6">
                    <p className="text-gray-600 text-sm mb-4">
                        共找到 <span className="font-semibold text-blue-600">{filteredBookmarks.length}</span> 个工具
                    </p>

                    <BookmarkList
                        bookmarks={filteredBookmarks}
                        getTagColor={(tag: string) =>
                            (bookmarksData.tagColors as Record<string, string>)[tag] || 'bg-gray-100 text-gray-800'
                        }
                    />
                </div>
            </main>

            <Footer />

            <Comments isOpen={isCommentsOpen} onClose={() => setIsCommentsOpen(false)} />

            {/* 回到顶部按钮 */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-40 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110"
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

export default App;
