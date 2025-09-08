'use client';

import { useState, useMemo } from 'react';
import bookmarksData from '@/data/bookmarks.json';

interface Bookmark {
    id: string;
    title: string;
    url: string;
    description: string;
    tags: string[];
}

export default function Home() {
    const [selectedTag, setSelectedTag] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

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
    const clearFilters = () => {
        setSearchQuery('');
        setSelectedTag('All');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* 头部 */}
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg">🔗</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">URL Collection</h1>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">My URLs</h2>
                </header>

                {/* 搜索框 */}
                <div className="mb-6 flex justify-end">
                    <div className="relative max-w-md">
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
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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
                </div>

                {/* 标签筛选 */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-gray-600 font-medium">Filter by tag:</span>
                        <div className="flex flex-wrap gap-2">
                            {bookmarksData.tags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
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
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>
                                显示 {filteredBookmarks.length} 个结果
                                {searchQuery && <span className="font-medium"> 包含 "{searchQuery}"</span>}
                                {selectedTag !== 'All' && <span className="font-medium"> 标签: {selectedTag}</span>}
                            </span>
                            <button
                                onClick={clearFilters}
                                className="ml-2 text-blue-500 hover:text-blue-700 font-medium underline"
                            >
                                清除筛选
                            </button>
                        </div>
                    )}
                </div>

                {/* 书签列表 */}
                <div className="space-y-4">
                    {filteredBookmarks.map((bookmark: Bookmark) => (
                        <div
                            key={bookmark.title}
                            className="bookmark-card bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex items-start gap-4">
                                {/* 链接图标 */}
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                    <span className="text-blue-500 text-lg">🔗</span>
                                </div>

                                {/* 内容 */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{bookmark.title}</h3>
                                    <p className="text-blue-600 text-sm mb-3 break-all">{bookmark.url}</p>
                                    <p className="text-gray-600 mb-4 leading-relaxed">{bookmark.description}</p>

                                    {/* 标签 */}
                                    <div className="flex flex-wrap gap-2">
                                        {bookmark.tags.map((tag, index) => (
                                            <span
                                                key={`${bookmark.id}-${tag}-${index}`}
                                                className={`px-2 py-1 rounded-md text-xs font-medium ${getTagColor(
                                                    tag
                                                )}`}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* 访问按钮 */}
                                <div className="flex-shrink-0">
                                    <a
                                        href={bookmark.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200"
                                    >
                                        访问
                                        <svg
                                            className="w-4 h-4 ml-1"
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
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 空状态 */}
                {filteredBookmarks.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-gray-400 text-2xl">🔍</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchQuery ? '没有找到匹配的书签' : '没有找到相关书签'}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {searchQuery ? `没有书签包含 "${searchQuery}"` : '尝试选择其他标签或查看所有书签'}
                        </p>
                        {(searchQuery || selectedTag !== 'All') && (
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200"
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
        </div>
    );
}
