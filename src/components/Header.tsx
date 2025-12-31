import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import { useTheme } from '../contexts/ThemeContext';
import { getFavoritesCount } from '../utils/favorites';

interface HeaderProps {
    isFixed?: boolean;
    searchQuery?: string;
    setSearchQuery?: (query: string) => void;
}

export default function Header({ isFixed = false, searchQuery = '', setSearchQuery }: HeaderProps) {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const [favoritesCount, setFavoritesCount] = useState(0);

    // 监听收藏变化
    useEffect(() => {
        setFavoritesCount(getFavoritesCount());

        const handleFavoritesChanged = () => {
            setFavoritesCount(getFavoritesCount());
        };

        window.addEventListener('favorites-changed', handleFavoritesChanged);
        return () => window.removeEventListener('favorites-changed', handleFavoritesChanged);
    }, []);

    return (
        <>
            <header className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between gap-4">
                        {/* Logo and Navigation */}
                        <div className="flex items-center gap-6">
                            <Link
                                to="/"
                                className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-shrink-0"
                            >
                                <img
                                    src="/logo.png"
                                    alt="前端工具库"
                                    className="w-12 h-12 rounded-lg"
                                    loading="lazy"
                                    decoding="async"
                                    width="48"
                                    height="48"
                                />
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">前端工具库</h1>
                            </Link>

                            {/* 导航链接 */}
                            <nav className="hidden md:flex items-center gap-1">
                                <Link
                                    to="/"
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                                        location.pathname === '/'
                                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                        />
                                    </svg>
                                    工具库
                                </Link>
                                <Link
                                    to="/favorites"
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 relative ${
                                        location.pathname === '/favorites'
                                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    我的收藏
                                    {favoritesCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                            {favoritesCount > 9 ? '9+' : favoritesCount}
                                        </span>
                                    )}
                                </Link>
                                <Link
                                    to="/compare"
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                                        location.pathname === '/compare'
                                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                        />
                                    </svg>
                                    框架对比
                                </Link>
                                <Link
                                    to="/trending"
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                                        location.pathname === '/trending'
                                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                    </svg>
                                    每日趋势
                                </Link>
                                <Link
                                    to="/submit"
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                                        location.pathname === '/submit'
                                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                    </svg>
                                    提交收录
                                </Link>
                                <Link
                                    to="/contact"
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                                        location.pathname === '/contact'
                                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                        />
                                    </svg>
                                    留言板
                                </Link>
                            </nav>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            {/* 主题切换按钮 */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                                aria-label="切换主题"
                            >
                                {theme === 'light' ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                        />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                        />
                                    </svg>
                                )}
                            </button>

                            {/* 移动端菜单按钮 */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                                aria-label="菜单"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {mobileMenuOpen ? (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    ) : (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    )}
                                </svg>
                            </button>

                            <a
                                href="https://github.com/maxlongint/maxlongint.github.io"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                                aria-label="访问 GitHub"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* 移动端菜单 */}
                    {mobileMenuOpen && (
                        <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
                            <nav className="px-4 py-3 space-y-1">
                                <Link
                                    to="/"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        location.pathname === '/'
                                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                            />
                                        </svg>
                                        工具库
                                    </span>
                                </Link>
                                <Link
                                    to="/favorites"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        location.pathname === '/favorites'
                                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <span className="flex items-center gap-2 relative">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        我的收藏
                                        {favoritesCount > 0 && (
                                            <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center ml-auto">
                                                {favoritesCount > 9 ? '9+' : favoritesCount}
                                            </span>
                                        )}
                                    </span>
                                </Link>
                                <Link
                                    to="/compare"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        location.pathname === '/compare'
                                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                            />
                                        </svg>
                                        框架对比
                                    </span>
                                </Link>
                                <Link
                                    to="/trending"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        location.pathname === '/trending'
                                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                        </svg>
                                        每日趋势
                                    </span>
                                </Link>
                                <Link
                                    to="/submit"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        location.pathname === '/submit'
                                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                            />
                                        </svg>
                                        提交收录
                                    </span>
                                </Link>
                                <Link
                                    to="/contact"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        location.pathname === '/contact'
                                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                            />
                                        </svg>
                                        留言板
                                    </span>
                                </Link>
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            {/* 滚动时显示的搜索框（Header 下方单独一行） */}
            {isFixed && setSearchQuery && (
                <div className="sticky top-[80px] z-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-end">
                        <div className="w-full max-w-2xl shadow-lg">
                            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} compact={false} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
