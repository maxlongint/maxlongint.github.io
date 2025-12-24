import { useState } from 'react';

interface TagFilterProps {
    tags: string[];
    tagStats: Record<string, number>;
    selectedTag: string;
    setSelectedTag: (tag: string) => void;
    getTagColor: (tag: string) => string | { backgroundColor: string; color: string };
}

export default function TagFilter({ tags, tagStats, selectedTag, setSelectedTag, getTagColor }: TagFilterProps) {
    const [showAll, setShowAll] = useState(false);

    // 热门分类：全部 + 包含库最多的5个标签
    const topTags = Object.entries(tagStats)
        .filter(([tag]) => tag !== '全部 (All)') // 排除"全部"
        .sort(([, a], [, b]) => b - a) // 按数量降序排序
        .slice(0, 5) // 取前5个
        .map(([tag]) => tag);

    const mainTags = ['全部 (All)', ...topTags];

    // 其他标签
    const otherTags = tags.filter(tag => !mainTags.includes(tag));

    // 显示的主要标签
    const displayedMainTags = mainTags.filter(tag => tags.includes(tag));

    return (
        <>
            {/* 热门分类 */}
            <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-sm font-medium text-gray-700 mb-3">热门分类</h2>
                <div className="flex flex-wrap gap-2">
                    {displayedMainTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                selectedTag === tag
                                    ? 'bg-black text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {tag} <span className="ml-1 text-xs opacity-75">{tagStats[tag]}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 更多标签 */}
            {otherTags.length > 0 && (
                <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-medium text-gray-700">更多标签</h2>
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            {showAll ? '收起' : '展开全部'}
                            <svg
                                className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {(showAll ? otherTags : otherTags.slice(0, 24)).map(tag => {
                            const tagColor = getTagColor(tag);
                            const isStyleObject = typeof tagColor === 'object';

                            return (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag)}
                                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
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
                                    {tag} <span className="ml-0.5 opacity-75">{tagStats[tag]}</span>
                                </button>
                            );
                        })}
                        {!showAll && otherTags.length > 24 && (
                            <span className="px-2.5 py-1 text-xs text-gray-500">+ {otherTags.length - 24} 个标签</span>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
