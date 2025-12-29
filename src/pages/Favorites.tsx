import { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import BookmarkList from '../components/BookmarkList';
import Footer from '../components/Footer';
import bookmarksData from '../data/bookmarks.json';
import { getFavorites } from '../utils/favorites';
import type { Bookmark } from '../types';

export default function Favorites() {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // 加载收藏列表
    useEffect(() => {
        setFavorites(getFavorites());

        // 监听收藏变化事件
        const handleFavoritesChanged = () => {
            setFavorites(getFavorites());
        };

        window.addEventListener('favorites-changed', handleFavoritesChanged);
        return () => window.removeEventListener('favorites-changed', handleFavoritesChanged);
    }, []);

    // 显示提示框
    const handleShare = (message: string, type: 'success' | 'error') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // 获取标签颜色
    const getTagColor = (tag: string) => {
        const tagConfig = (
            bookmarksData.tags as Record<string, { className?: string; backgroundColor?: string; textColor?: string }>
        )[tag];
        if (tagConfig && tagConfig.backgroundColor && tagConfig.textColor) {
            return { backgroundColor: tagConfig.backgroundColor, color: tagConfig.textColor };
        }
        return tagConfig?.className || 'bg-gray-100 text-gray-800';
    };

    // 筛选收藏的书签
    const favoriteBookmarks = useMemo(() => {
        return bookmarksData.bookmarks.filter((bookmark: Bookmark) => favorites.includes(bookmark.title));
    }, [favorites]);

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

            <Header />

            {/* Hero Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <h2 className="text-5xl font-bold text-gray-900 dark:text-white">我的收藏</h2>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    {favorites.length > 0
                        ? `你已收藏 ${favorites.length} 个工具，快速访问你喜欢的工具库`
                        : '还没有收藏任何工具，快去首页添加吧！'}
                </p>
            </div>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
                {favoriteBookmarks.length > 0 ? (
                    <BookmarkList
                        bookmarks={favoriteBookmarks}
                        viewMode="list"
                        getTagColor={getTagColor}
                        onShare={handleShare}
                    />
                ) : (
                    <div className="text-center py-12">
                        <svg
                            className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">暂无收藏</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">在工具卡片上点击❤️图标即可添加收藏</p>
                        <a
                            href="/#/"
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            前往首页
                        </a>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
