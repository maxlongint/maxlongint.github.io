import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import bookmarksData from '../data/bookmarks.json';
import { getGitHubRepoInfo } from './GitHubStats';

interface BookmarkDetailProps {}

interface NPMDownloadData {
    date: string;
    downloads: number;
}

interface BundleSize {
    gzip: string;
    raw: string;
}

export default function BookmarkDetail({}: BookmarkDetailProps) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [readme, setReadme] = useState<string>('');
    const [npmDownloads, setNpmDownloads] = useState<NPMDownloadData[]>([]);
    const [bundleSize, setBundleSize] = useState<BundleSize | null>(null);
    const [loading, setLoading] = useState(true);
    const [readmeLoaded, setReadmeLoaded] = useState(false);
    const [readmeError, setReadmeError] = useState(false);

    // 根据路由名称查找书签
    const bookmark = bookmarksData.bookmarks.find(b => {
        const routeName = b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return routeName === id;
    });
    const repoInfo = bookmark ? getGitHubRepoInfo(bookmark.url) : null;

    // 提取GitHub仓库信息
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

    const githubInfo = bookmark ? getGitHubInfo(bookmark.url) : null;

    useEffect(() => {
        if (!bookmark || !githubInfo) {
            navigate('/');
            return;
        }

        // 防止重复加载
        if (readmeLoaded) {
            return;
        }

        const fetchData = async () => {
            setLoading(true);

            // 生成缓存key
            const readmeCacheKey = `readme_${githubInfo.owner}_${githubInfo.repo}`;
            const npmCacheKey = `npm_${repoInfo?.name}`;
            const bundleCacheKey = `bundle_${repoInfo?.name}`;

            // 缓存有效期：7天（README、NPM、Bundle Size）
            const CACHE_EXPIRY_7_DAYS = 7 * 24 * 60 * 60 * 1000;

            try {
                // === 1. 获取README内容（优先使用预构建数据，然后缓存，最后降级） ===
                const cachedReadme = localStorage.getItem(readmeCacheKey);
                let shouldFetchReadme = true;

                // 1.1 检查localStorage缓存
                if (cachedReadme) {
                    try {
                        const cacheData = JSON.parse(cachedReadme);
                        const isExpired = Date.now() - cacheData.timestamp > CACHE_EXPIRY_7_DAYS;
                        if (!isExpired) {
                            const htmlContent = await marked(cacheData.content);
                            setReadme(htmlContent);
                            setReadmeLoaded(true);
                            setReadmeError(false);
                            setLoading(false);
                            shouldFetchReadme = false;
                        }
                    } catch (e) {
                        console.warn('Failed to parse README cache:', e);
                    }
                }

                // 1.2 尝试从预构建的github-readmes.json获取
                if (shouldFetchReadme) {
                    try {
                        const response = await fetch('/github-readmes.json');
                        if (response.ok) {
                            const data = await response.json();
                            const readmeKey = `${githubInfo.owner}/${githubInfo.repo}`;
                            const readmeText = data.readmes?.[readmeKey];

                            console.log('README fetch attempt:', {
                                readmeKey,
                                hasReadme: !!readmeText,
                                readmeLength: readmeText?.length,
                                allKeys: Object.keys(data.readmes || {}),
                            });

                            if (readmeText) {
                                const htmlContent = await marked(readmeText);
                                console.log('Markdown converted to HTML, length:', htmlContent.length);
                                setReadme(htmlContent);
                                setReadmeLoaded(true);
                                setReadmeError(false);
                                // 存入localStorage缓存
                                try {
                                    localStorage.setItem(
                                        readmeCacheKey,
                                        JSON.stringify({
                                            content: readmeText,
                                            timestamp: Date.now(),
                                        })
                                    );
                                } catch (e) {
                                    console.warn('Failed to cache README:', e);
                                }
                                shouldFetchReadme = false;
                            }
                        }
                    } catch (error) {
                        console.warn('Failed to fetch pre-built README data:', error);
                    }
                }

                // 1.3 如果预构建数据也没有，显示降级UI
                if (shouldFetchReadme) {
                    setReadmeError(true);
                    setReadmeLoaded(true);
                }
                setLoading(false);

                // === 2. 获取NPM下载量数据（带缓存） ===
                if (repoInfo?.npm_version && repoInfo.npm_version !== 'N/A') {
                    const cachedNpm = localStorage.getItem(npmCacheKey);
                    let shouldFetchNpm = true;

                    if (cachedNpm) {
                        try {
                            const cacheData = JSON.parse(cachedNpm);
                            const isExpired = Date.now() - cacheData.timestamp > CACHE_EXPIRY_7_DAYS;
                            if (!isExpired) {
                                setNpmDownloads(cacheData.data);
                                shouldFetchNpm = false;
                            }
                        } catch (e) {
                            console.warn('Failed to parse NPM cache:', e);
                        }
                    }

                    if (shouldFetchNpm) {
                        try {
                            const npmResponse = await fetch(
                                `https://api.npmjs.org/downloads/range/last-month/${repoInfo.name}`
                            );
                            if (npmResponse.ok) {
                                const npmData = await npmResponse.json();
                                const formattedData = npmData.downloads.map((item: any) => ({
                                    date: new Date(item.day).toLocaleDateString('zh-CN', {
                                        month: 'short',
                                        day: 'numeric',
                                    }),
                                    downloads: item.downloads,
                                }));
                                setNpmDownloads(formattedData);
                                // 缓存
                                try {
                                    localStorage.setItem(
                                        npmCacheKey,
                                        JSON.stringify({
                                            data: formattedData,
                                            timestamp: Date.now(),
                                        })
                                    );
                                } catch (e) {
                                    console.warn('Failed to cache NPM data:', e);
                                }
                            }
                        } catch (error) {
                            console.error('Failed to fetch NPM downloads:', error);
                        }
                    }
                }

                // === 3. 获取Bundle Size（带缓存） ===
                if (repoInfo?.name && repoInfo.npm_version !== 'N/A') {
                    const cachedBundle = localStorage.getItem(bundleCacheKey);
                    let shouldFetchBundle = true;

                    if (cachedBundle) {
                        try {
                            const cacheData = JSON.parse(cachedBundle);
                            const isExpired = Date.now() - cacheData.timestamp > CACHE_EXPIRY_7_DAYS;
                            if (!isExpired) {
                                setBundleSize(cacheData.data);
                                shouldFetchBundle = false;
                            }
                        } catch (e) {
                            console.warn('Failed to parse Bundle cache:', e);
                        }
                    }

                    if (shouldFetchBundle) {
                        try {
                            const bundleResponse = await fetch(
                                `https://bundlephobia.com/api/size?package=${repoInfo.name}@latest`
                            );
                            if (bundleResponse.ok) {
                                const bundleData = await bundleResponse.json();
                                const sizeData = {
                                    gzip: (bundleData.gzip / 1024).toFixed(2) + ' kB',
                                    raw: (bundleData.size / 1024).toFixed(2) + ' kB',
                                };
                                setBundleSize(sizeData);
                                // 缓存
                                try {
                                    localStorage.setItem(
                                        bundleCacheKey,
                                        JSON.stringify({
                                            data: sizeData,
                                            timestamp: Date.now(),
                                        })
                                    );
                                } catch (e) {
                                    console.warn('Failed to cache Bundle data:', e);
                                }
                            }
                        } catch (error) {
                            console.error('Failed to fetch bundle size:', error);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]); // 只依赖id变化

    if (!bookmark) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 面包屑导航 */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <button
                            onClick={() => navigate('/')}
                            className="hover:text-blue-600 transition-colors flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                            </svg>
                            <span>首页</span>
                        </button>
                        <span>/</span>
                        <span className="text-gray-900 truncate">{bookmark.title}</span>
                    </div>
                </div>
            </div>

            {/* Banner区域 */}
            <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
                    {/* 移动端布局 */}
                    <div className="block lg:hidden space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                                {githubInfo ? (
                                    <img
                                        src={`https://github.com/${githubInfo.owner}.png?size=80`}
                                        alt={`${bookmark.title} icon`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl sm:text-3xl font-bold text-gray-700">
                                        {bookmark.title.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                                    {bookmark.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2">
                                    {repoInfo?.npm_version && repoInfo.npm_version !== 'N/A' && (
                                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                                            v{repoInfo.npm_version}
                                        </span>
                                    )}
                                    {githubInfo && repoInfo && (
                                        <a
                                            href={`https://github.com/${githubInfo.owner}/${githubInfo.repo}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={e => e.stopPropagation()}
                                            className="inline-block"
                                        >
                                            <img
                                                src={`https://img.shields.io/github/stars/${githubInfo.owner}/${githubInfo.repo}?style=social`}
                                                alt="GitHub stars"
                                                className="h-5"
                                            />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                        <p className="text-base text-gray-600 leading-relaxed">{bookmark.description}</p>
                        <div className="flex flex-wrap gap-2">
                            {bookmark.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                                        (bookmarksData.tags as Record<string, { className: string }>)[tag]?.className ||
                                        'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div className="flex flex-col gap-2.5">
                            <a
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full px-5 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg active:shadow-xl flex items-center justify-center gap-2 font-semibold text-sm"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                </svg>
                                <span>访问 GitHub</span>
                            </a>
                            {repoInfo?.npm_version && repoInfo.npm_version !== 'N/A' && (
                                <a
                                    href={`https://www.npmjs.com/package/${repoInfo.name}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full px-5 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg active:shadow-xl flex items-center justify-center gap-2 font-semibold text-sm"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
                                    </svg>
                                    <span>NPM Package</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* PC端布局 */}
                    <div className="hidden lg:flex items-start gap-8">
                        {/* 左侧图标 */}
                        <div className="w-24 h-24 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                            {githubInfo ? (
                                <img
                                    src={`https://github.com/${githubInfo.owner}.png?size=96`}
                                    alt={`${bookmark.title} icon`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-4xl font-bold text-gray-700">
                                    {bookmark.title.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>

                        {/* 中间信息 */}
                        <div className="flex-1">
                            <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">{bookmark.title}</h1>
                            <p className="text-xl text-gray-600 leading-relaxed mb-6 max-w-3xl">
                                {bookmark.description}
                            </p>

                            <div className="flex items-center gap-3 mb-6">
                                {repoInfo?.npm_version && repoInfo.npm_version !== 'N/A' && (
                                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full">
                                        v{repoInfo.npm_version}
                                    </span>
                                )}
                                {githubInfo && repoInfo && (
                                    <a
                                        href={`https://github.com/${githubInfo.owner}/${githubInfo.repo}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={e => e.stopPropagation()}
                                        className="inline-block"
                                    >
                                        <img
                                            src={`https://img.shields.io/github/stars/${githubInfo.owner}/${githubInfo.repo}?style=social`}
                                            alt="GitHub stars"
                                            className="h-6"
                                        />
                                    </a>
                                )}
                                {repoInfo?.pushed_at && (
                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        更新于 {new Date(repoInfo.pushed_at).toLocaleDateString('zh-CN')}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {bookmark.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                            (bookmarksData.tags as Record<string, { className: string }>)[tag]
                                                ?.className || 'bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* 右侧按钮 */}
                        <div className="flex flex-col gap-3 flex-shrink-0">
                            <a
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-semibold"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                </svg>
                                <span>访问 GitHub</span>
                            </a>
                            {repoInfo?.npm_version && repoInfo.npm_version !== 'N/A' && (
                                <a
                                    href={`https://www.npmjs.com/package/${repoInfo.name}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-semibold"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
                                    </svg>
                                    <span>NPM Package</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 主要内容区域 */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* 移动端布局：元数据卡片在上，README在下 */}
                <div className="block lg:hidden space-y-4">
                    {/* 元数据卡片 */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Bundle Size */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <svg
                                        className="w-3.5 h-3.5 text-purple-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xs font-semibold text-gray-700">包体积</h3>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{bundleSize?.gzip || '—'}</div>
                            <p className="text-xs text-gray-500 mt-1">Gzipped</p>
                        </div>

                        {/* Open Issues */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <svg
                                        className="w-3.5 h-3.5 text-amber-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xs font-semibold text-gray-700">Issues</h3>
                            </div>
                            {githubInfo && (
                                <img
                                    src={`https://img.shields.io/github/issues/${githubInfo.owner}/${githubInfo.repo}?style=flat-square&color=orange`}
                                    alt="Open Issues"
                                    className="h-5 mt-1"
                                />
                            )}
                        </div>

                        {/* 最后更新 */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm col-span-2">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                                    <svg
                                        className="w-3.5 h-3.5 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xs font-semibold text-gray-700">最后更新</h3>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <div className="text-xl font-bold text-gray-900">
                                    {repoInfo?.pushed_at
                                        ? new Date(repoInfo.pushed_at).toLocaleDateString('zh-CN', {
                                              month: 'numeric',
                                              day: 'numeric',
                                          })
                                        : '—'}
                                </div>
                                <p className="text-xs text-gray-500">
                                    {repoInfo?.pushed_at
                                        ? new Date(repoInfo.pushed_at).toLocaleDateString('zh-CN', {
                                              year: 'numeric',
                                          })
                                        : ''}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* README */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <svg
                                    className="w-4 h-4 text-gray-700"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                README
                            </h2>
                        </div>
                        <div className="p-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : !readme || readmeError || readme.trim().length === 0 || readme.includes('README.md') ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <svg
                                        className="w-12 h-12 text-gray-300 mb-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    <h3 className="text-base font-semibold text-gray-900 mb-1">README 暂时无法加载</h3>
                                    <p className="text-sm text-gray-500 mb-4 px-4">
                                        数据正在同步中，稍后会自动更新。您也可以直接访问 GitHub 查看完整文档。
                                    </p>
                                    <a
                                        href={`https://github.com/${githubInfo?.owner}/${githubInfo?.repo}#readme`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                        在 GitHub 查看 README
                                    </a>
                                </div>
                            ) : (
                                <div
                                    className="prose prose-sm max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-pre:bg-gray-900 prose-pre:text-gray-100"
                                    dangerouslySetInnerHTML={{ __html: readme }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* PC端布局：保持原样 */}
                <div className="hidden lg:grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* 左侧主要内容 */}
                    <div className="lg:col-span-3">
                        {/* README内容 */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <svg
                                        className="w-5 h-5 text-gray-700"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    README
                                </h2>
                            </div>
                            <div className="p-6">
                                {loading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : !readme ||
                                  readmeError ||
                                  readme.trim().length === 0 ||
                                  readme.includes('README.md') ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <svg
                                            className="w-16 h-16 text-gray-300 mb-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            README 暂时无法加载
                                        </h3>
                                        <p className="text-gray-500 mb-6 max-w-md">
                                            数据正在同步中，稍后会自动更新。您也可以直接访问 GitHub 查看完整文档。
                                        </p>
                                        <a
                                            href={`https://github.com/${githubInfo?.owner}/${githubInfo?.repo}#readme`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                                        >
                                            在 GitHub 查看 README
                                        </a>
                                    </div>
                                ) : (
                                    <div
                                        className="prose prose-sm max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-pre:bg-gray-900 prose-pre:text-gray-100"
                                        dangerouslySetInnerHTML={{ __html: readme }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 右侧元数据卡片 */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Bundle Size */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4 text-purple-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-semibold text-gray-700">包体积</h3>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">{bundleSize?.gzip || '—'}</div>
                            <p className="text-sm text-gray-500">Gzipped</p>
                        </div>

                        {/* 下载量趋势 */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4 text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-semibold text-gray-700">NPM 下载</h3>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 mb-3">
                                {npmDownloads.length > 0
                                    ? npmDownloads[npmDownloads.length - 1].downloads.toLocaleString()
                                    : '45,231'}
                            </div>
                            <div className="h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={
                                            npmDownloads.length > 0
                                                ? npmDownloads
                                                : [
                                                      { date: 'Jan', downloads: 35000 },
                                                      { date: 'Feb', downloads: 38000 },
                                                      { date: 'Mar', downloads: 40000 },
                                                      { date: 'Apr', downloads: 42000 },
                                                      { date: 'May', downloads: 44000 },
                                                      { date: 'Jun', downloads: 45231 },
                                                  ]
                                        }
                                    >
                                        <defs>
                                            <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" hide />
                                        <YAxis hide />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="downloads"
                                            stroke="#3B82F6"
                                            strokeWidth={2}
                                            fill="url(#colorDownloads)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-gray-500 mt-3">过去 30 天</p>
                        </div>

                        {/* Open Issues */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4 text-amber-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-semibold text-gray-700">Issues</h3>
                            </div>
                            {githubInfo && (
                                <div className="space-y-3">
                                    <img
                                        src={`https://img.shields.io/github/issues/${githubInfo.owner}/${githubInfo.repo}?style=flat-square&color=orange`}
                                        alt="Open Issues"
                                        className="h-5"
                                    />
                                    <a
                                        href={`https://github.com/${githubInfo.owner}/${githubInfo.repo}/issues`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:text-blue-700 hover:underline block"
                                    >
                                        查看所有问题 →
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* 最后更新时间 */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-semibold text-gray-700">最后更新</h3>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                                {repoInfo?.pushed_at
                                    ? new Date(repoInfo.pushed_at).toLocaleDateString('zh-CN', {
                                          month: 'numeric',
                                          day: 'numeric',
                                      })
                                    : '—'}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {repoInfo?.pushed_at
                                    ? new Date(repoInfo.pushed_at).toLocaleDateString('zh-CN', {
                                          year: 'numeric',
                                      })
                                    : ''}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
