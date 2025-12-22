import { Bookmark } from '../App';
import GitHubStats from './GitHubStats';

interface BookmarkCardProps {
    bookmark: Bookmark;
    viewMode: 'list' | 'grid';
    getTagColor: (tag: string) => string;
}

export default function BookmarkCard({ bookmark, viewMode, getTagColor }: BookmarkCardProps) {
    // 提取 GitHub 仓库信息
    const getGitHubInfo = (url: string) => {
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (match) {
            return {
                owner: match[1],
                repo: match[2].replace(/\.git$/, ''),
            };
        }
        return null;
    };

    const githubInfo = getGitHubInfo(bookmark.url);

    return (
        <div className="group relative bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all duration-300">
            {/* 网格模式或移动端布局 */}
            <div className={viewMode === 'grid' ? 'block' : 'md:hidden'}>
                {/* 第一行：图标、标题和版本号 */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white overflow-hidden flex-shrink-0">
                        {githubInfo ? (
                            <img
                                src={`https://github.com/${githubInfo.owner}.png?size=48`}
                                alt={`${bookmark.title} icon`}
                                className="w-full h-full object-cover"
                                onError={e => {
                                    e.currentTarget.style.display = 'none';
                                    if (e.currentTarget.nextSibling) {
                                        (e.currentTarget.nextSibling as HTMLElement).style.display = 'block';
                                    }
                                }}
                            />
                        ) : null}
                        <span className="text-xl font-bold" style={{ display: githubInfo ? 'none' : 'block' }}>
                            {bookmark.title.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 mb-1">{bookmark.title}</h3>
                        <span className="text-xs font-mono text-gray-400">v4.4.1</span>
                    </div>
                </div>

                {/* 第二行：描述 */}
                <p className="text-gray-600 text-sm mb-3 leading-relaxed">{bookmark.description}</p>

                {/* 第三行：标签和统计 */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex flex-wrap gap-1.5 flex-1">
                        {bookmark.tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={`${tag}-${index}`}
                                className={`px-2 py-0.5 rounded text-xs font-semibold ${getTagColor(tag)}`}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                    <div className="flex-shrink-0">
                        <GitHubStats url={bookmark.url} />
                    </div>
                </div>
            </div>

            {/* PC端列表模式布局 */}
            <div className={viewMode === 'list' ? 'hidden md:flex items-center gap-4' : 'hidden'}>
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white overflow-hidden flex-shrink-0">
                    {githubInfo ? (
                        <img
                            src={`https://github.com/${githubInfo.owner}.png?size=48`}
                            alt={`${bookmark.title} icon`}
                            className="w-full h-full object-cover"
                            onError={e => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextSibling) {
                                    (e.currentTarget.nextSibling as HTMLElement).style.display = 'block';
                                }
                            }}
                        />
                    ) : null}
                    <span className="text-xl font-bold" style={{ display: githubInfo ? 'none' : 'block' }}>
                        {bookmark.title.charAt(0).toUpperCase()}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                                {bookmark.title}
                            </h3>
                            <p className="text-gray-600 text-sm">{bookmark.description}</p>
                        </div>
                        <span className="text-xs font-mono font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                            v4.4.1
                        </span>
                    </div>

                    {/* Footer: Tags and Stats */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-1.5">
                            {bookmark.tags.slice(0, 3).map((tag, index) => (
                                <span
                                    key={`${tag}-${index}`}
                                    className={`px-2 py-0.5 rounded text-xs font-semibold ${getTagColor(tag)}`}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div className="flex-shrink-0">
                            <GitHubStats url={bookmark.url} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
