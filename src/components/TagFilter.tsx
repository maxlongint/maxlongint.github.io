import { useMemo } from 'react';
import { Bookmark } from '../types';

interface TagFilterProps {
    tags: string[];
    tagStats: Record<string, number>;
    selectedTag: string;
    setSelectedTag: (tag: string) => void;
    getTagColor: (tag: string) => string | { backgroundColor: string; color: string };
    bookmarks: Bookmark[];
}

export default function TagFilter({
    tags,
    tagStats,
    selectedTag,
    setSelectedTag,
    getTagColor,
    bookmarks,
}: TagFilterProps) {
    // 判断是否为新收录（7天内）
    const isNewBookmark = (addedDate?: string) => {
        if (!addedDate) return false;
        const added = new Date(addedDate);
        const now = new Date();
        const diffDays = (now.getTime() - added.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
    };

    // 检查标签是否包含新收录的库
    const tagHasNewBookmarks = useMemo(() => {
        const result: Record<string, boolean> = {};
        tags.forEach(tag => {
            // 排除 "全部 (All)" 标签
            if (tag === '全部 (All)') {
                result[tag] = false;
            } else {
                result[tag] = bookmarks.some(b => b.tags.includes(tag) && isNewBookmark(b.addedDate));
            }
        });
        return result;
    }, [bookmarks, tags]);

    // 热门分类：全部 + 包含库最多的5个标签 - 使用 useMemo 缓存
    const topTags = useMemo(
        () =>
            Object.entries(tagStats)
                .filter(([tag]) => tag !== '全部 (All)') // 排除“全部”
                .sort(([, a], [, b]) => b - a) // 按数量降序排序
                .slice(0, 5) // 取前5个
                .map(([tag]) => tag),
        [tagStats]
    );

    const mainTags = useMemo(() => ['全部 (All)', ...topTags], [topTags]);

    // 其他标签
    const otherTags = useMemo(() => tags.filter(tag => !mainTags.includes(tag)), [tags, mainTags]);

    // 显示的主要标签
    const displayedMainTags = useMemo(() => mainTags.filter(tag => tags.includes(tag)), [mainTags, tags]);

    return (
        <>
            {/* 热门分类 */}
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">热门分类</h2>
                <div className="flex flex-wrap gap-2">
                    {displayedMainTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                                selectedTag === tag
                                    ? 'bg-black dark:bg-white text-white dark:text-black'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            {tag} <span className="text-xs opacity-75">{tagStats[tag]}</span>
                            {tagHasNewBookmarks[tag] && (
                                <span className="ml-0.5 px-1.5 py-0.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[10px] font-bold rounded-md uppercase tracking-wide">
                                    NEW
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* 更多标签 */}
            {otherTags.length > 0 && (
                <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">更多标签</h2>
                    <div className="flex flex-wrap gap-1.5">
                        {otherTags.map(tag => {
                            const tagColor = getTagColor(tag);
                            const isStyleObject = typeof tagColor === 'object';

                            return (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag)}
                                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                                        selectedTag === tag
                                            ? isStyleObject
                                                ? 'ring-2 ring-offset-1 ring-blue-500'
                                                : tagColor + ' ring-2 ring-offset-1 ring-blue-500'
                                            : isStyleObject
                                            ? 'hover:opacity-80'
                                            : tagColor + ' hover:opacity-80'
                                    }`}
                                    style={isStyleObject ? tagColor : undefined}
                                >
                                    {tag} <span className="opacity-75">{tagStats[tag]}</span>
                                    {tagHasNewBookmarks[tag] && (
                                        <span className="ml-0.5 px-1.5 py-[1px] bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[9px] font-bold rounded-md uppercase tracking-wide">
                                            NEW
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}
