import { useState, useEffect, useRef } from 'react';
import type { Bookmark } from '../types';
import BookmarkCard from './BookmarkCard';

interface BookmarkListProps {
    bookmarks: Bookmark[];
    viewMode: 'list' | 'grid';
    getTagColor: (tag: string) => string | { backgroundColor: string; color: string };
    onShare?: (message: string, type: 'success' | 'error') => void;
    onTagClick?: (tag: string) => void;
}

export default function BookmarkList({ bookmarks, viewMode, getTagColor, onShare, onTagClick }: BookmarkListProps) {
    const [columns, setColumns] = useState<Bookmark[][]>([[], [], []]);
    const containerRef = useRef<HTMLDivElement>(null);

    // 根据屏幕宽度确定列数
    const getColumnCount = () => {
        const width = window.innerWidth;
        if (width >= 1024) return 3; // 桌面
        if (width >= 768) return 2; // 平板
        return 1; // 移动端
    };

    // 按照横向顺序分配到各列（简化版本：轮流分配）
    useEffect(() => {
        if (viewMode !== 'grid') return;

        const columnCount = getColumnCount();
        const newColumns: Bookmark[][] = Array.from({ length: columnCount }, () => []);

        // 按照横向顺序分配：第1个到第1列，第2个到第2列，第3个到第3列，第4个回到第1列
        bookmarks.forEach((bookmark, index) => {
            const columnIndex = index % columnCount;
            newColumns[columnIndex].push(bookmark);
        });

        setColumns(newColumns);
    }, [bookmarks, viewMode]);

    // 监听窗口大小变化 - 使用节流优化性能
    useEffect(() => {
        if (viewMode !== 'grid') return;

        let ticking = false;

        const handleResize = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const columnCount = getColumnCount();
                    const newColumns: Bookmark[][] = Array.from({ length: columnCount }, () => []);
                    bookmarks.forEach((bookmark, index) => {
                        const columnIndex = index % columnCount;
                        newColumns[columnIndex].push(bookmark);
                    });
                    setColumns(newColumns);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [bookmarks, viewMode]);
    if (bookmarks.length === 0) {
        return (
            <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <p className="mt-4 text-gray-500">没有找到匹配的书签</p>
            </div>
        );
    }

    return (
        <div ref={containerRef}>
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                    {columns.map((column, columnIndex) => (
                        <div key={columnIndex} className="flex flex-col gap-4">
                            {column.map((bookmark, index) => (
                                <BookmarkCard
                                    key={`${bookmark.url}-${index}`}
                                    bookmark={bookmark}
                                    viewMode={viewMode}
                                    getTagColor={getTagColor}
                                    onShare={onShare}
                                    onTagClick={onTagClick}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {bookmarks.map((bookmark, index) => (
                        <BookmarkCard
                            key={`${bookmark.url}-${index}`}
                            bookmark={bookmark}
                            viewMode={viewMode}
                            getTagColor={getTagColor}
                            onShare={onShare}
                            onTagClick={onTagClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
