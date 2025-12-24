import { Link, useLocation } from 'react-router-dom';
import SearchBar from './SearchBar';

interface HeaderProps {
    onOpenComments: () => void;
    isFixed?: boolean;
    searchQuery?: string;
    setSearchQuery?: (query: string) => void;
}

export default function Header({ onOpenComments, isFixed = false, searchQuery = '', setSearchQuery }: HeaderProps) {
    const location = useLocation();

    return (
        <header className="bg-gray-50 border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo and Title */}
                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <img src="/logo.png" alt="前端工具库" className="w-12 h-12 rounded-lg" />
                            <h1 className="text-xl font-bold text-gray-900">前端工具库</h1>
                        </Link>

                        {/* 导航链接 */}
                        <nav className="hidden md:flex items-center gap-1">
                            <Link
                                to="/"
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    location.pathname === '/'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                工具库
                            </Link>
                            <Link
                                to="/trending"
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                                    location.pathname === '/trending'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                </svg>
                                每日趋势
                            </Link>
                        </nav>
                    </div>

                    {/* 滚动固定时显示搜索框 - 仅在大屏幕显示 */}
                    {isFixed && setSearchQuery && (
                        <div className="hidden lg:block w-full max-w-2xl mx-8">
                            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} compact={true} />
                        </div>
                    )}

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onOpenComments}
                            className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
                            aria-label="评论"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                />
                            </svg>
                        </button>
                        <a
                            href="https://github.com/maxlongint/maxlongint.github.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
                            aria-label="访问 GitHub"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
}
