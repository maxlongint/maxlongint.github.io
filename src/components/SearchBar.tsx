import { useState, useEffect } from 'react';

interface SearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    compact?: boolean;
}

export default function SearchBar({ searchQuery, setSearchQuery, compact = false }: SearchBarProps) {
    const [inputValue, setInputValue] = useState(searchQuery);

    // 同步外部 searchQuery 的变化（比如清除搜索时）
    useEffect(() => {
        setInputValue(searchQuery);
    }, [searchQuery]);

    // 处理输入变化 - 只在删除到空时触发搜索
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        // 只在删除到空时自动触发搜索
        if (value === '' && inputValue !== '') {
            setSearchQuery('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            // 按回车时搜索
            console.log('回车键被按下，搜索关键词:', inputValue);
            setSearchQuery(inputValue);
        }
    };

    const handleClear = () => {
        setInputValue('');
        setSearchQuery('');
    };

    return (
        <div className={compact ? 'relative w-full max-w-3xl shadow-md ' : 'relative max-w-2xl mx-auto'}>
            <div className="relative bg-gray-50 dark:bg-gray-900 p-4">
                <div className="relative">
                    <svg
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
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
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="搜索库、框架或插件..."
                        className={`w-full pl-12 pr-16 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent text-sm bg-white dark:bg-gray-800 dark:text-white ${
                            compact ? 'py-2' : 'py-3.5'
                        }`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {inputValue && (
                            <button
                                onClick={handleClear}
                                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                aria-label="清除搜索"
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
                        {!inputValue && (
                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                                ⌘ K
                            </kbd>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
