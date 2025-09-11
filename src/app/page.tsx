'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import bookmarksData from '@/data/bookmarks.json';

// GitHub 仓库信息接口
interface GitHubRepoInfo {
    stargazers_count: number;
    npm_version: string;
    name: string;
    full_name: string;
}

// 预设的 GitHub 仓库数据（避免 API 限制问题）
const presetRepoData: Record<string, GitHubRepoInfo> = {
    'github.com/unadlib/mutative': {
        stargazers_count: 2100,
        npm_version: '1.0.11',
        name: 'mutative',
        full_name: 'unadlib/mutative',
    },
    'github.com/fabian-hiller/valibot': {
        stargazers_count: 6200,
        npm_version: '0.42.1',
        name: 'valibot',
        full_name: 'fabian-hiller/valibot',
    },
    'github.com/typestack/class-validator': {
        stargazers_count: 10800,
        npm_version: '0.14.1',
        name: 'class-validator',
        full_name: 'typestack/class-validator',
    },
    'github.com/Mage-Icons/mage-icons': {
        stargazers_count: 850,
        npm_version: '2.1.3',
        name: 'mage-icons',
        full_name: 'Mage-Icons/mage-icons',
    },
    'github.com/iconoir-icons/iconoir': {
        stargazers_count: 3900,
        npm_version: '7.9.0',
        name: 'iconoir',
        full_name: 'iconoir-icons/iconoir',
    },
    'github.com/cure53/DOMPurify': {
        stargazers_count: 13500,
        npm_version: '3.2.0',
        name: 'dompurify',
        full_name: 'cure53/DOMPurify',
    },
    'github.com/zumerlab/snapdom': {
        stargazers_count: 420,
        npm_version: '0.4.2',
        name: 'snapdom',
        full_name: 'zumerlab/snapdom',
    },
    'github.com/juliangarnier/anime': {
        stargazers_count: 49800,
        npm_version: '3.2.1',
        name: 'animejs',
        full_name: 'juliangarnier/anime',
    },
    'github.com/animate-css/animate.css': {
        stargazers_count: 80300,
        npm_version: '4.1.1',
        name: 'animate.css',
        full_name: 'animate-css/animate.css',
    },
    'github.com/inorganik/CountUp.js': {
        stargazers_count: 3800,
        npm_version: '2.8.0',
        name: 'countup.js',
        full_name: 'inorganik/CountUp.js',
    },
    'github.com/SortableJS/Sortable': {
        stargazers_count: 29100,
        npm_version: '1.15.6',
        name: 'sortablejs',
        full_name: 'SortableJS/Sortable',
    },
    'github.com/josdejong/jsoneditor': {
        stargazers_count: 11500,
        npm_version: '10.1.0',
        name: 'jsoneditor',
        full_name: 'josdejong/jsoneditor',
    },
    'github.com/MikeMcl/bignumber.js': {
        stargazers_count: 6600,
        npm_version: '9.1.2',
        name: 'bignumber.js',
        full_name: 'MikeMcl/bignumber.js',
    },
    'github.com/MikeMcl/decimal.js': {
        stargazers_count: 1800,
        npm_version: '10.4.3',
        name: 'decimal.js',
        full_name: 'MikeMcl/decimal.js',
    },
    'github.com/dinerojs/dinero.js': {
        stargazers_count: 6100,
        npm_version: '2.0.0',
        name: 'dinero.js',
        full_name: 'dinerojs/dinero.js',
    },
    'github.com/cnwhy/nzh': {
        stargazers_count: 1100,
        npm_version: '1.0.4',
        name: 'nzh',
        full_name: 'cnwhy/nzh',
    },
    'github.com/adamwdraper/Numeral-js': {
        stargazers_count: 9500,
        npm_version: '2.0.6',
        name: 'numeral',
        full_name: 'adamwdraper/Numeral-js',
    },
    'github.com/katspaugh/wavesurfer.js': {
        stargazers_count: 8600,
        npm_version: '7.8.6',
        name: 'wavesurfer.js',
        full_name: 'katspaugh/wavesurfer.js',
    },
    'github.com/marcuswestin/store.js': {
        stargazers_count: 14000,
        npm_version: '2.0.12',
        name: 'store',
        full_name: 'marcuswestin/store.js',
    },
    'github.com/jaames/iro.js': {
        stargazers_count: 2300,
        npm_version: '5.5.2',
        name: '@irojs/iro-core',
        full_name: 'jaames/iro.js',
    },
    'github.com/simonwep/pickr': {
        stargazers_count: 4200,
        npm_version: '1.9.1',
        name: '@simonwep/pickr',
        full_name: 'simonwep/pickr',
    },
    'github.com/KingSora/OverlayScrollbars': {
        stargazers_count: 3800,
        npm_version: '2.10.1',
        name: 'overlayscrollbars',
        full_name: 'KingSora/OverlayScrollbars',
    },
    'github.com/russellsamora/scrollama': {
        stargazers_count: 3100,
        npm_version: '3.2.0',
        name: 'scrollama',
        full_name: 'russellsamora/scrollama',
    },
    'github.com/szimek/signature_pad': {
        stargazers_count: 3700,
        npm_version: '5.0.4',
        name: 'signature_pad',
        full_name: 'szimek/signature_pad',
    },
    'github.com/hodgef/simple-keyboard': {
        stargazers_count: 2100,
        npm_version: '3.8.9',
        name: 'simple-keyboard',
        full_name: 'hodgef/simple-keyboard',
    },
    'github.com/uuidjs/uuid': {
        stargazers_count: 14500,
        npm_version: '11.0.3',
        name: 'uuid',
        full_name: 'uuidjs/uuid',
    },
    'github.com/atomiks/tippyjs': {
        stargazers_count: 11800,
        npm_version: '6.3.7',
        name: 'tippy.js',
        full_name: 'atomiks/tippyjs',
    },
    'github.com/iamkun/dayjs': {
        stargazers_count: 46800,
        npm_version: '1.11.13',
        name: 'dayjs',
        full_name: 'iamkun/dayjs',
    },
    'github.com/socketio/socket.io': {
        stargazers_count: 61000,
        npm_version: '4.8.1',
        name: 'socket.io',
        full_name: 'socketio/socket.io',
    },
    'github.com/jamiebuilds/tinykeys': {
        stargazers_count: 3500,
        npm_version: '3.0.0',
        name: 'tinykeys',
        full_name: 'jamiebuilds/tinykeys',
    },
    'github.com/zh-lx/pinyin-pro': {
        stargazers_count: 4800,
        npm_version: '3.24.2',
        name: 'pinyin-pro',
        full_name: 'zh-lx/pinyin-pro',
    },
    'github.com/bpmn-io/bpmn-js': {
        stargazers_count: 8700,
        npm_version: '17.11.1',
        name: 'bpmn-js',
        full_name: 'bpmn-io/bpmn-js',
    },
    'github.com/davidshimjs/qrcodejs': {
        stargazers_count: 4500,
        npm_version: 'N/A',
        name: 'qrcode',
        full_name: 'davidshimjs/qrcodejs',
    },
    'github.com/fullcalendar/fullcalendar': {
        stargazers_count: 18300,
        npm_version: '6.1.15',
        name: 'fullcalendar',
        full_name: 'fullcalendar/fullcalendar',
    },
    'github.com/zenorocha/clipboard.js': {
        stargazers_count: 34000,
        npm_version: '2.0.11',
        name: 'clipboard',
        full_name: 'zenorocha/clipboard.js',
    },
    'github.com/fengyuanchen/cropperjs': {
        stargazers_count: 12800,
        npm_version: '2.0.0-rc.2',
        name: 'cropperjs',
        full_name: 'fengyuanchen/cropperjs',
    },
    'github.com/videojs/video.js': {
        stargazers_count: 37800,
        npm_version: '8.12.0',
        name: 'video.js',
        full_name: 'videojs/video.js',
    },
    'github.com/video-dev/hls.js': {
        stargazers_count: 14700,
        npm_version: '1.5.17',
        name: 'hls.js',
        full_name: 'video-dev/hls.js',
    },
    'github.com/sampotts/plyr': {
        stargazers_count: 26200,
        npm_version: '3.7.8',
        name: 'plyr',
        full_name: 'sampotts/plyr',
    },
    'github.com/pqina/filepond': {
        stargazers_count: 15300,
        npm_version: '4.31.1',
        name: 'filepond',
        full_name: 'pqina/filepond',
    },
    'github.com/brix/crypto-js': {
        stargazers_count: 15800,
        npm_version: '4.2.0',
        name: 'crypto-js',
        full_name: 'brix/crypto-js',
    },
    'github.com/usablica/intro.js': {
        stargazers_count: 22600,
        npm_version: '7.2.0',
        name: 'intro.js',
        full_name: 'usablica/intro.js',
    },
    'github.com/axios/axios': {
        stargazers_count: 105000,
        npm_version: '1.7.9',
        name: 'axios',
        full_name: 'axios/axios',
    },
    'github.com/js-cookie/js-cookie': {
        stargazers_count: 21600,
        npm_version: '3.0.5',
        name: 'js-cookie',
        full_name: 'js-cookie/js-cookie',
    },
    'github.com/ConnorAtherton/loaders.css': {
        stargazers_count: 10200,
        npm_version: 'N/A',
        name: 'loaders.css',
        full_name: 'ConnorAtherton/loaders.css',
    },
    'github.com/fengyuanchen/viewerjs': {
        stargazers_count: 7800,
        npm_version: '1.11.6',
        name: 'viewerjs',
        full_name: 'fengyuanchen/viewerjs',
    },
    'github.com/nolimits4web/swiper': {
        stargazers_count: 39700,
        npm_version: '11.1.14',
        name: 'swiper',
        full_name: 'nolimits4web/swiper',
    },
    'github.com/highlightjs/highlight.js': {
        stargazers_count: 23200,
        npm_version: '11.10.0',
        name: 'highlight.js',
        full_name: 'highlightjs/highlight.js',
    },
    'github.com/necolas/normalize.css': {
        stargazers_count: 52200,
        npm_version: '8.0.1',
        name: 'normalize.css',
        full_name: 'necolas/normalize.css',
    },
    'github.com/hakimel/reveal.js': {
        stargazers_count: 67600,
        npm_version: '5.1.0',
        name: 'reveal.js',
        full_name: 'hakimel/reveal.js',
    },
    'github.com/hammerjs/hammer.js': {
        stargazers_count: 24000,
        npm_version: '2.0.8',
        name: 'hammerjs',
        full_name: 'hammerjs/hammer.js',
    },
    'github.com/markedjs/marked': {
        stargazers_count: 32800,
        npm_version: '15.0.2',
        name: 'marked',
        full_name: 'markedjs/marked',
    },
    'github.com/Milkdown/milkdown': {
        stargazers_count: 8800,
        npm_version: '7.5.0',
        name: '@milkdown/core',
        full_name: 'Milkdown/milkdown',
    },
    'github.com/TahaSh/swapy': {
        stargazers_count: 5600,
        npm_version: '0.1.7',
        name: 'swapy',
        full_name: 'TahaSh/swapy',
    },
    'github.com/patrick-steele-idem/morphdom': {
        stargazers_count: 3000,
        npm_version: '2.7.4',
        name: 'morphdom',
        full_name: 'patrick-steele-idem/morphdom',
    },
    'github.com/transloadit/uppy': {
        stargazers_count: 29000,
        npm_version: '4.5.0',
        name: '@uppy/core',
        full_name: 'transloadit/uppy',
    },
};

// 缓存 GitHub 仓库信息
const githubRepoCache = new Map<string, GitHubRepoInfo | null>();

// 获取 GitHub 仓库信息
const fetchGitHubRepoInfo = async (url: string): Promise<GitHubRepoInfo | null> => {
    try {
        // 检查是否为 GitHub 仓库链接
        const githubMatch = url.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!githubMatch) {
            console.log('不是 GitHub 仓库链接:', url);
            return null;
        }

        const [, owner, repo] = githubMatch;
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
        console.log('正在获取 GitHub 仓库信息:', apiUrl);

        // 检查缓存
        if (githubRepoCache.has(apiUrl)) {
            console.log('从缓存获取信息:', apiUrl);
            return githubRepoCache.get(apiUrl) || null;
        }

        const response = await fetch(apiUrl);
        if (!response.ok) {
            console.error('GitHub API 请求失败:', response.status, response.statusText);
            githubRepoCache.set(apiUrl, null);
            return null;
        }

        const data = await response.json();
        console.log('GitHub API 返回数据:', {
            name: data.name,
            stargazers_count: data.stargazers_count,
        });

        const repoInfo: GitHubRepoInfo = {
            stargazers_count: data.stargazers_count,
            npm_version: 'N/A',
            name: data.name,
            full_name: data.full_name,
        };

        // 缓存结果
        githubRepoCache.set(apiUrl, repoInfo);
        return repoInfo;
    } catch (error) {
        console.error('Failed to fetch GitHub repo info:', error);
        return null;
    }
};

// GitHub 统计信息组件
const GitHubStats = ({ url }: { url: string }) => {
    const [repoInfo, setRepoInfo] = useState<GitHubRepoInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const loadRepoInfo = async () => {
            if (!url.includes('github.com')) {
                return;
            }

            console.log('开始加载 GitHub 信息:', url);
            setLoading(true);
            setError(false);

            try {
                // 首先检查预设数据
                const urlKey = url
                    .replace(/^https?:\/\//, '')
                    .split('?')[0]
                    .split('#')[0];
                console.log('查找预设数据键:', urlKey);

                if (presetRepoData[urlKey]) {
                    console.log('使用预设数据:', presetRepoData[urlKey]);
                    setTimeout(() => {
                        setRepoInfo(presetRepoData[urlKey]);
                        setLoading(false);
                    }, 500); // 模拟加载时间
                    return;
                }

                // 如果没有预设数据，尝试使用 API
                const githubMatch = url.match(/github\.com\/([^/]+)\/([^/?]+)/);
                if (!githubMatch) {
                    console.log('URL 格式不匹配:', url);
                    setError(true);
                    setLoading(false);
                    return;
                }

                const [, owner, repo] = githubMatch;
                const cleanRepo = repo.split('?')[0].split('#')[0];
                const apiUrl = `https://api.github.com/repos/${owner}/${cleanRepo}`;

                console.log('API URL:', apiUrl);

                // 检查缓存
                if (githubRepoCache.has(apiUrl)) {
                    const cachedInfo = githubRepoCache.get(apiUrl);
                    console.log('从缓存获取信息:', cachedInfo);
                    if (cachedInfo !== undefined) {
                        setRepoInfo(cachedInfo);
                        setLoading(false);
                        if (!cachedInfo) setError(true);
                        return;
                    }
                }

                const response = await fetch(apiUrl);
                console.log('API 响应状态:', response.status);

                if (!response.ok) {
                    console.error('GitHub API 请求失败:', response.status, response.statusText);
                    githubRepoCache.set(apiUrl, null);
                    setError(true);
                    setLoading(false);
                    return;
                }

                const data = await response.json();
                console.log('GitHub API 返回数据:', {
                    name: data.name,
                    stargazers_count: data.stargazers_count,
                });

                const repoInfo: GitHubRepoInfo = {
                    stargazers_count: data.stargazers_count || 0,
                    npm_version: 'N/A',
                    name: data.name || '',
                    full_name: data.full_name || '',
                };

                githubRepoCache.set(apiUrl, repoInfo);
                setRepoInfo(repoInfo);
                setLoading(false);
            } catch (err) {
                console.error('获取 GitHub 信息失败:', err);
                setError(true);
                setLoading(false);
            }
        };

        loadRepoInfo();
    }, [url]);

    // 不是 GitHub 链接，不显示任何内容
    if (!url.includes('github.com')) {
        return null;
    }

    // 加载状态
    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="animate-spin w-4 h-4 border border-gray-300 border-t-blue-500 rounded-full"></div>
                <span className="text-xs">加载中...</span>
            </div>
        );
    }

    // 加载失败
    if (error) {
        return (
            <div className="flex items-center gap-1 text-xs text-red-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                    />
                </svg>
                <span>API限制</span>
            </div>
        );
    }

    // 没有数据
    if (!repoInfo) {
        return null;
    }

    // 显示统计信息
    return (
        <div className="flex items-center gap-3 text-sm text-gray-600">
            <a
                href={`https://github.com/${repoInfo.full_name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:scale-105 transition-transform duration-200"
            >
                <img
                    src={`https://img.shields.io/github/stars/${repoInfo.full_name}?style=flat&color=yellow&label=stars`}
                    alt={`${repoInfo.full_name} GitHub stars`}
                    className="h-5"
                />
            </a>
            <a
                href={`https://www.npmjs.com/package/${repoInfo.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:scale-105 transition-transform duration-200"
            >
                <img
                    src={`https://img.shields.io/npm/v/${encodeURIComponent(repoInfo.name)}?label=${encodeURIComponent(
                        repoInfo.name
                    )}&color=red`}
                    alt={`${repoInfo.name} npm version`}
                    className="h-5"
                />
            </a>
        </div>
    );
};

// 外链图标组件
const ExternalLinkIcon = ({ className = 'w-4 h-4 flex-shrink-0' }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
    </svg>
);

// 性能优化配置
const ITEMS_PER_PAGE = 20; // 每页显示的书签数量
const INTERSECTION_THRESHOLD = 0.1; // IntersectionObserver 触发阈值

interface Bookmark {
    title: string;
    url: string;
    description: string;
    tags: string[];
}

// 优化的懒加载书签卡片组件
const LazyBookmarkCard = ({
    bookmark,
    bookmarkIndex,
    viewMode,
    getTagColor,
}: {
    bookmark: Bookmark;
    bookmarkIndex: number;
    viewMode: 'list' | 'grid';
    getTagColor: (tag: string) => string;
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimated, setIsAnimated] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const skeletonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // 优化动画时间，减少延迟以提升流畅度
                    const delay = Math.min(bookmarkIndex * 20, 100); // 减少延迟到20ms，最大100ms
                    setTimeout(() => {
                        setIsAnimated(true);
                    }, delay);
                    observer.disconnect();
                }
            },
            {
                threshold: INTERSECTION_THRESHOLD,
                rootMargin: '50px', // 提前触发动画
            }
        );

        if (cardRef.current || skeletonRef.current) {
            observer.observe((cardRef.current || skeletonRef.current)!);
        }

        return () => observer.disconnect();
    }, [bookmarkIndex]);

    // 优化的骨架屏
    if (!isVisible) {
        return (
            <div
                ref={skeletonRef}
                className={`bookmark-card bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 transition-all duration-200 ${
                    viewMode === 'grid' ? 'flex flex-col' : ''
                }`}
                style={{ minHeight: '200px' }} // 固定骨架屏高度防止布局移位
            >
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded mb-3 w-3/4 animate-pulse"></div>
                        <div className="h-16 bg-gray-200 rounded mb-4 animate-pulse"></div>
                        <div className="flex gap-2">
                            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={cardRef}
            className={`bookmark-card bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 ${
                viewMode === 'grid' ? 'flex flex-col' : ''
            } ${
                isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            } transform-gpu will-change-transform`}
            style={{
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: isAnimated ? '0ms' : `${Math.min(bookmarkIndex * 15, 100)}ms`, // 进一步减少延迟
            }}
        >
            {/* 网格模式布局 */}
            <div className={viewMode === 'grid' ? 'flex flex-col h-full' : 'block lg:hidden'}>
                {viewMode === 'grid' ? (
                    // 网格模式：标题、URL、说明分别占一行
                    <>
                        <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-500 text-lg">🔗</span>
                            </div>
                            <div className="flex-1 min-w-0 h-12 flex flex-col justify-between">
                                {/* 桌面端：标题和 GitHub 统计信息在同一行 */}
                                <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-2 h-12">
                                    <h3 className="text-lg font-bold text-gray-900 leading-tight flex-1 truncate">
                                        {bookmark.title}
                                    </h3>
                                    <GitHubStats url={bookmark.url} />
                                </div>
                                {/* 移动端：标题单独一行，GitHub 统计信息单独一行 */}
                                <div className="block lg:hidden h-12 flex flex-col justify-between">
                                    <h3 className="text-lg font-bold text-gray-900 leading-tight truncate">
                                        {bookmark.title}
                                    </h3>
                                    <div className="flex items-center">
                                        <GitHubStats url={bookmark.url} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* URL单独一行，占满宽度，可点击跳转 */}
                        <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm break-all mb-4 mt-1 inline-flex items-center gap-1 transition-colors font-medium"
                        >
                            {bookmark.url.replace(/^https?:\/\//, '')}
                            <ExternalLinkIcon />
                        </a>
                        {/* 说明占满宽度的一行 */}
                        <p className="text-gray-600 leading-relaxed text-base mb-4 flex-1">{bookmark.description}</p>
                        <div className="flex flex-wrap gap-2">
                            {bookmark.tags.map((tag, index) => (
                                <span
                                    key={`${bookmarkIndex}-${tag}-${index}`}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105 ${getTagColor(
                                        tag
                                    )}`}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </>
                ) : (
                    // 移动端列表模式布局：图标和标题占一行，URL占一行，说明占满宽度
                    <>
                        {/* 图标和标题占一行 */}
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100">
                                <span className="text-blue-600 text-xl font-semibold">
                                    {bookmark.title.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0 h-12 flex flex-col justify-between">
                                {/* 桌面端：标题和 GitHub 统计信息在同一行 */}
                                <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-2 h-12">
                                    <h3 className="text-lg font-bold text-gray-900 flex-1 leading-tight truncate">
                                        {bookmark.title}
                                    </h3>
                                    <GitHubStats url={bookmark.url} />
                                </div>
                                {/* 移动端：标题单独一行，GitHub 统计信息单独一行 */}
                                <div className="block lg:hidden h-12 flex flex-col justify-between">
                                    <h3 className="text-lg font-bold text-gray-900 leading-tight truncate">
                                        {bookmark.title}
                                    </h3>
                                    <div className="flex items-center">
                                        <GitHubStats url={bookmark.url} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* URL占一行，可点击跳转 */}
                        <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm break-all mb-4 mt-1 inline-flex items-center gap-1 transition-colors font-medium"
                        >
                            {bookmark.url.replace(/^https?:\/\//, '')}
                            <ExternalLinkIcon />
                        </a>

                        {/* 说明占满宽度 */}
                        <p className="text-gray-600 leading-relaxed text-base mb-4">{bookmark.description}</p>

                        {/* 标签 */}
                        <div className="flex flex-wrap gap-2">
                            {bookmark.tags.map((tag, index) => (
                                <span
                                    key={`${bookmarkIndex}-${tag}-${index}`}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105 ${getTagColor(
                                        tag
                                    )}`}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* PC端布局 */}
            <div className={viewMode === 'grid' ? 'hidden' : 'hidden lg:flex lg:items-start lg:gap-4'}>
                {/* 链接图标 */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100">
                    <span className="text-blue-600 text-xl font-semibold">
                        {bookmark.title.charAt(0).toUpperCase()}
                    </span>
                </div>

                {/* 内容区域 */}
                <div className="flex-1 min-w-0">
                    {/* 标题和 GitHub 统计信息在同一行 */}
                    <div className="flex items-center justify-between gap-4 h-6">
                        <h3 className="text-xl font-bold text-gray-900 leading-tight flex-1 truncate">
                            {bookmark.title}
                        </h3>
                        <GitHubStats url={bookmark.url} />
                    </div>
                    <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm break-all mb-1 inline-flex items-center gap-1 transition-colors font-medium h-6 leading-6"
                    >
                        {bookmark.url.replace(/^https?:\/\//, '')}
                        <ExternalLinkIcon className="w-4 h-4 flex-shrink-0" />
                    </a>
                    <p className="text-gray-600 mb-4 leading-relaxed text-base mt-1">{bookmark.description}</p>
                    <div className="flex flex-wrap gap-2">
                        {bookmark.tags.map((tag, index) => (
                            <span
                                key={`${bookmarkIndex}-${tag}-${index}`}
                                className={`px-2 py-1 rounded-md text-xs font-medium ${getTagColor(tag)}`}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Home() {
    const [selectedTag, setSelectedTag] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [showFixedSearch, setShowFixedSearch] = useState(false);
    const [isSearching, setIsSearching] = useState(false); // 标记是否正在搜索
    const [isFixedSearchFocused, setIsFixedSearchFocused] = useState(false); // 标记固定搜索框是否有焦点
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [currentPage, setCurrentPage] = useState(1); // 当前页数
    const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE); // 当前可见项目数
    const searchSectionRef = useRef<HTMLDivElement>(null);
    const fixedSearchInputRef = useRef<HTMLInputElement>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const [hasTriggeredFixed, setHasTriggeredFixed] = useState(false); // 标记是否已经触发过固定搜索框

    // JSON-LD 结构化数据
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: '前端利器库',
        description: '精心整理的前端开发工具与资源，让你的开发更高效',
        url: 'https://maxlongint.github.io',
        author: {
            '@type': 'Person',
            name: 'Cyclone77',
        },
        potentialAction: {
            '@type': 'SearchAction',
            target: 'https://maxlongint.github.io?search={search_term_string}',
            'query-input': 'required name=search_term_string',
        },
        mainEntity: {
            '@type': 'ItemList',
            name: '前端开发工具书签',
            numberOfItems: bookmarksData.bookmarks.length,
            itemListElement: bookmarksData.bookmarks.slice(0, 10).map((bookmark, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                    '@type': 'WebSite',
                    name: bookmark.title,
                    description: bookmark.description,
                    url: bookmark.url,
                },
            })),
        },
    };

    // 基础的书签数据筛选（用于统计）
    const filteredBookmarks = useMemo(() => {
        let bookmarks = bookmarksData.bookmarks;

        // 根据标签筛选
        if (selectedTag !== 'All') {
            bookmarks = bookmarks.filter(bookmark => bookmark.tags.includes(selectedTag));
        }

        // 根据搜索关键词筛选
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            bookmarks = bookmarks.filter(bookmark => {
                // 对于 URL 搜索，去掉协议前缀进行匹配，避免搜索 http 时返回所有链接
                const cleanUrl = bookmark.url.replace(/^https?:\/\//, '').toLowerCase();

                return (
                    bookmark.title.toLowerCase().includes(query) ||
                    bookmark.description.toLowerCase().includes(query) ||
                    cleanUrl.includes(query) ||
                    bookmark.tags.some(tag => tag.toLowerCase().includes(query))
                );
            });
        }

        return bookmarks;
    }, [selectedTag, searchQuery]);

    // 无限滚动加载更多书签
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                const target = entries[0];
                if (target.isIntersecting && visibleItems < filteredBookmarks.length) {
                    setVisibleItems(prev => Math.min(prev + ITEMS_PER_PAGE, filteredBookmarks.length));
                }
            },
            { threshold: INTERSECTION_THRESHOLD }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [visibleItems, filteredBookmarks.length]);

    // 重置可见项目数当筛选条件变化时
    useEffect(() => {
        setVisibleItems(ITEMS_PER_PAGE);
        setCurrentPage(1);
    }, [selectedTag, searchQuery]);

    // 监听滚动事件，控制回到顶部按钮和固定搜索框显示
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            setShowScrollTop(scrollTop > 300);

            // 如果固定搜索框有焦点或正在输入，不执行隐藏逻辑
            if (isFixedSearchFocused || isSearching) {
                return;
            }

            // 检查搜索框区域是否滚出视窗
            if (searchSectionRef.current) {
                const searchSectionRect = searchSectionRef.current.getBoundingClientRect();
                const shouldShowFixed = searchSectionRect.bottom < -50;

                // 如果应该显示固定搜索框，标记为已触发
                if (shouldShowFixed) {
                    setHasTriggeredFixed(true);
                }

                // 只有在用户滚回到很顶部时才隐藏固定搜索框
                if (scrollTop < 100) {
                    setShowFixedSearch(false);
                    setHasTriggeredFixed(false);
                } else if (hasTriggeredFixed || shouldShowFixed) {
                    // 一旦触发过固定搜索框，或者当前应该显示，就保持显示状态
                    setShowFixedSearch(true);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasTriggeredFixed, isFixedSearchFocused, isSearching]);

    // 回到顶部函数
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    // 优化的书签数据筛选和分页
    const { displayedBookmarks, hasMore } = useMemo(() => {
        return {
            displayedBookmarks: filteredBookmarks.slice(0, visibleItems),
            hasMore: visibleItems < filteredBookmarks.length,
        };
    }, [filteredBookmarks, visibleItems]);

    // 统计信息和标签数量
    const stats = useMemo(() => {
        const allBookmarks = bookmarksData.bookmarks;

        // 统计每个标签的书签数量
        const tagCounts: Record<string, number> = {};

        // 初始化所有标签计数为0
        Object.keys(bookmarksData.tagColors).forEach(tag => {
            tagCounts[tag] = 0;
        });

        // 统计每个标签在书签中出现的次数
        allBookmarks.forEach(bookmark => {
            bookmark.tags.forEach(tag => {
                if (tagCounts.hasOwnProperty(tag)) {
                    tagCounts[tag]++;
                }
            });
        });

        // All标签显示总数
        tagCounts['All'] = allBookmarks.length;

        return {
            total: allBookmarks.length,
            tags: Object.keys(bookmarksData.tagColors).length,
            tagCounts,
        };
    }, []);

    const getTagColor = (tag: string) => {
        return (bookmarksData.tagColors as Record<string, string>)[tag] || 'bg-gray-100 text-gray-800';
    };

    // 清除搜索和筛选
    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedTag('All');
        setIsSearching(false);
        setIsFixedSearchFocused(false);
    }, []);

    // 处理搜索输入
    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchQuery(value);
            const isCurrentlySearching = value.trim().length > 0;
            setIsSearching(isCurrentlySearching);

            // 如果正在使用固定搜索框且有内容，确保固定搜索框保持显示
            if (isCurrentlySearching && showFixedSearch) {
                setHasTriggeredFixed(true);
            }
        },
        [showFixedSearch]
    );

    // 处理固定搜索框的输入和焦点保持
    const handleFixedSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            handleSearchChange(value);

            // 在输入过程中强制保持固定搜索框显示
            setHasTriggeredFixed(true);
            setShowFixedSearch(true);

            // 保持焦点在固定搜索框上
            setTimeout(() => {
                if (fixedSearchInputRef.current) {
                    fixedSearchInputRef.current.focus();
                }
            }, 0);
        },
        [handleSearchChange]
    );

    // 处理固定搜索框的焦点事件
    const handleFixedSearchFocus = useCallback(() => {
        setIsFixedSearchFocused(true);
        setHasTriggeredFixed(true);
        setShowFixedSearch(true);
    }, []);

    const handleFixedSearchBlur = useCallback(() => {
        // 延迟设置以防止快速焦点切换时的闪烁
        setTimeout(() => {
            setIsFixedSearchFocused(false);
        }, 100);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* JSON-LD 结构化数据 */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* 头部 */}
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl">✨</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">前端利器库</h1>
                    </div>
                </header>

                {/* 搜索框 */}
                <div ref={searchSectionRef} className="mb-6">
                    {!showFixedSearch && (
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
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
                                onChange={e => handleSearchChange(e.target.value)}
                                className="w-full pl-12 pr-12 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white shadow-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setIsSearching(false);
                                        setIsFixedSearchFocused(false);
                                    }}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] justify-center"
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
                    )}
                </div>

                {/* 视图模式切换 */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">视图模式:</span>
                        <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                    viewMode === 'list'
                                        ? 'bg-blue-500 text-white shadow-sm'
                                        : 'bg-transparent text-gray-700 hover:bg-white hover:text-gray-900'
                                }`}
                            >
                                列表
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                    viewMode === 'grid'
                                        ? 'bg-blue-500 text-white shadow-sm'
                                        : 'bg-transparent text-gray-700 hover:bg-white hover:text-gray-900'
                                }`}
                            >
                                网格
                            </button>
                        </div>
                    </div>
                </div>

                {/* 标签过滤 */}
                <div className="mb-8">
                    <div className="mb-4">
                        <span className="text-gray-700 font-medium text-base">标签云:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(bookmarksData.tagColors).map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-[40px] border ${
                                    selectedTag === tag
                                        ? 'bg-blue-500 text-white shadow-md transform scale-105 border-blue-500'
                                        : `${getTagColor(tag)} border-gray-200 hover:border-blue-300 hover:shadow-sm`
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    {tag}
                                    <span
                                        className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs rounded-full font-semibold ${
                                            selectedTag === tag
                                                ? 'bg-white/20 text-white'
                                                : 'bg-gray-500/10 text-gray-600'
                                        }`}
                                    >
                                        {stats.tagCounts[tag] || 0}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* 搜索和筛选状态提示 */}
                    {(searchQuery || selectedTag !== 'All') && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                            <span>
                                显示 {displayedBookmarks.length} / {filteredBookmarks.length} 个结果
                                {searchQuery && <span className="font-medium"> 包含 &quot;{searchQuery}&quot;</span>}
                                {selectedTag !== 'All' && <span className="font-medium"> 标签: {selectedTag}</span>}
                            </span>
                            <button
                                onClick={clearFilters}
                                className="sm:ml-2 text-blue-500 hover:text-blue-700 font-medium underline self-start min-h-[44px] flex items-center"
                            >
                                清除筛选
                            </button>
                        </div>
                    )}
                </div>

                {/* 书签列表 */}
                <div
                    className={
                        viewMode === 'grid' ? 'masonry-container columns-1 lg:columns-2 xl:columns-3' : 'space-y-4'
                    }
                >
                    {displayedBookmarks.map((bookmark: Bookmark, bookmarkIndex) => (
                        <div
                            key={`${bookmark.title}-${bookmarkIndex}`}
                            className={viewMode === 'grid' ? 'masonry-item' : ''}
                        >
                            <LazyBookmarkCard
                                bookmark={bookmark}
                                bookmarkIndex={bookmarkIndex}
                                viewMode={viewMode}
                                getTagColor={getTagColor}
                            />
                        </div>
                    ))}
                </div>

                {/* 加载更多触发器 */}
                {hasMore && (
                    <div ref={loadMoreRef} className="flex justify-center items-center py-8">
                        <div className="flex items-center gap-2 text-gray-500">
                            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                            <span>加载更多...</span>
                        </div>
                    </div>
                )}

                {/* 空状态 */}
                {displayedBookmarks.length === 0 && filteredBookmarks.length === 0 && (
                    <div className="text-center py-8 sm:py-12 px-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-gray-400 text-2xl">🔍</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchQuery ? '没有找到匹配的书签' : '没有找到相关书签'}
                        </h3>
                        <p className="text-gray-500 mb-4 text-sm sm:text-base">
                            {searchQuery ? `没有书签包含 &quot;${searchQuery}&quot;` : '尝试选择其他标签或查看所有书签'}
                        </p>
                        {(searchQuery || selectedTag !== 'All') && (
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center justify-center px-4 py-3 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 min-h-[44px]"
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

            {/* 页脚 */}
            <footer className="mt-12 sm:mt-16 py-6 sm:py-8 border-t border-gray-200">
                <div className="text-center px-4">
                    <p className="text-gray-500 text-sm">
                        Created by <span className="font-medium text-gray-700">Cyclone77</span>
                    </p>
                </div>
            </footer>

            {/* 固定搜索框 */}
            {showFixedSearch && (
                <div className="fixed top-0 left-0 right-0 z-40 fixed-search-bar transition-all duration-300">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center justify-between gap-4">
                            {/* Logo 和标题 */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-lg">✨</span>
                                </div>
                                <h1 className="text-lg font-bold text-gray-900 hidden sm:block">前端利器库</h1>
                            </div>

                            {/* 固定搜索框 */}
                            <div className="relative flex-1 max-w-md sm:max-w-lg">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg
                                        className="w-4 h-4 text-gray-400"
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
                                    ref={fixedSearchInputRef}
                                    type="text"
                                    placeholder="搜索书签..."
                                    value={searchQuery}
                                    onChange={handleFixedSearchChange}
                                    onFocus={handleFixedSearchFocus}
                                    onBlur={handleFixedSearchBlur}
                                    className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setIsSearching(false);
                                            setIsFixedSearchFocused(false);
                                            // 保持焦点在固定搜索框上
                                            setTimeout(() => {
                                                if (fixedSearchInputRef.current) {
                                                    fixedSearchInputRef.current.focus();
                                                }
                                            }, 0);
                                        }}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 min-w-[40px] min-h-[40px] justify-center"
                                        aria-label="清除搜索"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                            {/* 回到顶部按钮（小尺寸） */}
                            <button
                                onClick={scrollToTop}
                                className="flex-shrink-0 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
                                title="回到顶部"
                                aria-label="回到顶部"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 回到顶部按钮 */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
                    title="回到顶部"
                    aria-label="回到顶部"
                >
                    <svg
                        className="w-6 h-6 transform group-hover:-translate-y-0.5 transition-transform duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                    </svg>
                </button>
            )}
        </div>
    );
}
