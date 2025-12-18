import { Bookmark } from '../App';
import GitHubStats from './GitHubStats';

interface BookmarkCardProps {
    bookmark: Bookmark;
    getTagColor: (tag: string) => string;
}

export default function BookmarkCard({ bookmark, getTagColor }: BookmarkCardProps) {
    const ExternalLinkIcon = () => (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
        </svg>
    );

    return (
        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all">
            <div className="flex items-start gap-3">
                {/* 图标 */}
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg font-bold">{bookmark.title.charAt(0).toUpperCase()}</span>
                </div>

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                    {/* 标题和 GitHub 统计 */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-base font-semibold text-gray-900">{bookmark.title}</h3>
                        <GitHubStats url={bookmark.url} />
                    </div>

                    {/* URL */}
                    <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm inline-flex items-center gap-1 transition-colors mb-2"
                    >
                        <span className="truncate">{bookmark.url.replace(/^https?:\/\//, '')}</span>
                        <ExternalLinkIcon />
                    </a>

                    {/* 描述 */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">{bookmark.description}</p>

                    {/* 标签云 */}
                    <div className="flex flex-wrap gap-1.5">
                        {bookmark.tags.map((tag, index) => (
                            <span
                                key={`${tag}-${index}`}
                                className={`px-2.5 py-0.5 rounded text-xs font-medium ${getTagColor(tag)}`}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
