import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import { markedEmoji } from 'marked-emoji';
import { nameToEmoji } from 'gemoji';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import python from 'highlight.js/lib/languages/python';
import swift from 'highlight.js/lib/languages/swift';
import 'highlight.js/styles/github-dark.css';
import 'github-markdown-css/github-markdown.css';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import bookmarksData from '../data/bookmarks.json';
import { getGitHubRepoInfo, getGitHubInfo, getGitHubReadme } from '../utils/github';
import type { BundleSize, NPMDownloadData } from '../types';

// 配置 marked 使用 GitHub Flavored Markdown (GFM)
marked.setOptions({
    gfm: true, // 启用 GitHub Flavored Markdown
    breaks: true, // 将单个换行符转换为 <br>
});

// 配置 Emoji 支持（GitHub 风格的 :emoji: 语法）
// 使用 GitHub 官方 emoji 数据
marked.use(
    markedEmoji({
        emojis: nameToEmoji,
        renderer: token => token.emoji, // 直接返回 Unicode 字符
    })
);

// 注册常用语言
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('jsx', javascript);
hljs.registerLanguage('tsx', typescript);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('python', python);
hljs.registerLanguage('swift', swift);

export default function BookmarkDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [readme, setReadme] = useState<string>('');
    const [npmDownloads, setNpmDownloads] = useState<NPMDownloadData[]>([]);
    const [bundleSize, setBundleSize] = useState<BundleSize | null>(null);
    const [loading, setLoading] = useState(true);
    const [readmeLoaded, setReadmeLoaded] = useState(false);
    const [readmeError, setReadmeError] = useState(false);
    const [showFixedBanner, setShowFixedBanner] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [tocItems, setTocItems] = useState<{ id: string; text: string; level: number }[]>([]);
    const [showToc, setShowToc] = useState(false);
    const [activeHeading, setActiveHeading] = useState<string>('');
    const readmeRef = useRef<HTMLDivElement>(null);

    // 根据路由名称查找书签
    const bookmark = bookmarksData.bookmarks.find(b => {
        const routeName = b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return routeName === id;
    });
    const repoInfo = bookmark ? getGitHubRepoInfo(bookmark.url) : null;

    const githubInfo = bookmark ? getGitHubInfo(bookmark.url) : null;

    // 进入详情页时滚动到顶部
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]); // 当路由参数变化时触发

    // 设置页面标题
    useEffect(() => {
        if (bookmark) {
            document.title = `${bookmark.title} - 前端工具库`;
        }
        return () => {
            document.title = '前端工具库';
        };
    }, [bookmark]);

    // 监听滚动，控制固定 banner 和回到顶部按钮的显示
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            // 当滚动超过 300px 时显示固定 banner
            setShowFixedBanner(scrollY > 300);
            // 当滚动超过 500px 时显示回到顶部按钮
            setShowBackToTop(scrollY > 500);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
            const npmCacheKey = `npm_${repoInfo?.name}`;
            const bundleCacheKey = `bundle_${repoInfo?.name}`;

            // 缓存有效期：7天（NPM、Bundle Size）
            const CACHE_EXPIRY_7_DAYS = 7 * 24 * 60 * 60 * 1000;

            try {
                // === 1. 获取README内容（从预构建数据） ===
                // 添加重试逻辑，等待数据加载完成
                let readmeText: string | null = null;
                let retryCount = 0;
                const maxRetries = 10; // 最多重试10次
                const retryDelay = 100; // 每次等待100ms

                while (!readmeText && retryCount < maxRetries) {
                    readmeText = await getGitHubReadme(githubInfo.owner, githubInfo.repo);
                    if (!readmeText) {
                        // 等待一段时间后重试
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                        retryCount++;
                    }
                }

                if (readmeText && readmeText.trim().length > 0) {
                    let htmlContent = await marked(readmeText);

                    // 修复图片路径：将相对路径转换为 GitHub 绝对路径
                    htmlContent = htmlContent.replace(
                        /<img([^>]*?)src="(?!\/\/|http:\/\/|https:\/\/)([^"]+)"/g,
                        (_match, attrs, src) => {
                            // 处理相对路径中的 ../ 和 /blob/
                            let cleanSrc = src;

                            // 如果路径以 / 开头且包含 ../，需要特殊处理
                            if (cleanSrc.startsWith('/') && cleanSrc.includes('../')) {
                                // 移除前导 / 和所有 ../
                                cleanSrc = cleanSrc.replace(/^\/+/, '').replace(/\.\.\//g, '');
                            }

                            // 检查是否是跨仓库引用（格式：owner/repo/blob/branch/path）
                            const crossRepoMatch = cleanSrc.match(/^([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/);
                            if (crossRepoMatch) {
                                const [, owner, repo, branch, path] = crossRepoMatch;
                                return `<img${attrs}src="https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}" onerror="this.src=this.src.replace('/${branch}/', '/master/')"`;
                            }

                            // 移除 /blob/ 路径（如果存在）
                            cleanSrc = cleanSrc.replace(/\/blob\//, '/');

                            const fullSrc = cleanSrc.startsWith('/')
                                ? `https://raw.githubusercontent.com/${githubInfo.owner}/${githubInfo.repo}/main${cleanSrc}`
                                : `https://raw.githubusercontent.com/${githubInfo.owner}/${githubInfo.repo}/main/${cleanSrc}`;
                            return `<img${attrs}src="${fullSrc}" onerror="this.src=this.src.replace('/main/', '/master/')"`;
                        }
                    );

                    // 修复 GitHub URL 中错误的 blob 路径（应该是 raw.githubusercontent.com）
                    htmlContent = htmlContent.replace(
                        /<img([^>]*?)src="https:\/\/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/([^"]+)"/g,
                        (_match, attrs, owner, repo, branch, path) => {
                            const correctSrc = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
                            return `<img${attrs}src="${correctSrc}"`;
                        }
                    );

                    // 生成目录：从 HTML 中提取所有标题
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = htmlContent;
                    const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
                    const toc: { id: string; text: string; level: number }[] = [];

                    headings.forEach((heading, index) => {
                        const level = parseInt(heading.tagName.substring(1));
                        const text = heading.textContent || '';

                        // 保留已有的 ID（Markdown 渲染器生成的），如果没有则根据标题文本生成
                        let id = heading.id;
                        if (!id) {
                            // 生成与 GitHub 一致的 ID：小写、空格转连字符、移除特殊字符
                            id = text
                                .toLowerCase()
                                .trim()
                                .replace(/[^\w\s-]/g, '') // 移除特殊字符
                                .replace(/\s+/g, '-') // 空格转连字符
                                .replace(/-+/g, '-'); // 多个连字符合并为一个

                            // 如果生成的ID为空，使用索引作为后备
                            if (!id) {
                                id = `heading-${index}`;
                            }
                            heading.id = id;
                        }

                        toc.push({ id, text, level });
                    });

                    // 更新 HTML 内容
                    htmlContent = tempDiv.innerHTML;

                    setTocItems(toc);
                    setReadme(htmlContent);
                    setReadmeLoaded(true);
                    setReadmeError(false);
                } else {
                    // 如果没有 README 数据，显示降级 UI
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
                                const formattedData = npmData.downloads.map(
                                    (item: { day: string; downloads: number }) => ({
                                        date: new Date(item.day).toLocaleDateString('zh-CN', {
                                            month: 'short',
                                            day: 'numeric',
                                        }),
                                        downloads: item.downloads,
                                    })
                                );
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]); // 只依赖id，避免循环触发

    useEffect(() => {
        if (!readme || !readmeRef.current) return;

        // 直接设置HTML内容，绕过React的重渲染
        readmeRef.current.innerHTML = readme;

        // 等待DOM更新后再高亮代码
        const timeoutId = setTimeout(() => {
            if (!readmeRef.current) return;

            // 移除所有已高亮的标记，重新高亮
            const codeBlocks = readmeRef.current.querySelectorAll('pre code');

            codeBlocks.forEach(block => {
                const el = block as HTMLElement;
                // 清除旧的高亮
                el.removeAttribute('data-highlighted');
                el.className = el.className
                    .split(' ')
                    .filter(c => !c.startsWith('hljs'))
                    .join(' ');

                // 检查是否有语言标识
                const hasLanguage = el.className
                    .split(' ')
                    .some(
                        c =>
                            c.startsWith('language-') ||
                            [
                                'javascript',
                                'typescript',
                                'html',
                                'css',
                                'json',
                                'bash',
                                'shell',
                                'sh',
                                'python',
                                'swift',
                                'jsx',
                                'tsx',
                                'xml',
                            ].includes(c)
                    );

                // 如果没有语言标识，尝试自动检测
                if (!hasLanguage) {
                    const result = hljs.highlightAuto(el.textContent || '');
                    el.innerHTML = result.value;
                    el.className = `hljs ${result.language || ''}`;
                } else {
                    // 有语言标识，使用正常高亮
                    hljs.highlightElement(el);
                }
            });
        }, 150);

        return () => clearTimeout(timeoutId);
    }, [readme]);

    // 使用全局事件处理README内部的锚点链接（必须在Router之前拦截）
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a') as HTMLAnchorElement;

            // 只处理README容器内的链接
            if (!anchor || !readmeRef.current?.contains(anchor)) {
                return;
            }

            const href = anchor.getAttribute('href');

            // 检查是否是锚点链接
            if (href?.includes('#')) {
                const hashIndex = href.indexOf('#');
                const hash = href.substring(hashIndex + 1);
                const beforeHash = href.substring(0, hashIndex);

                // 如果是纯锚点或当前页面的锚点
                if (!beforeHash || beforeHash === '' || window.location.hash.includes(beforeHash)) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();

                    if (hash && readmeRef.current) {
                        const targetElement = readmeRef.current.querySelector(`#${CSS.escape(hash)}`);

                        if (targetElement) {
                            const yOffset = -100;
                            const elementPosition = targetElement.getBoundingClientRect().top;
                            const offsetPosition = elementPosition + window.pageYOffset + yOffset;
                            window.scrollTo({
                                top: offsetPosition,
                                behavior: 'smooth',
                            });
                        }
                    }
                    return false;
                }
            }
        };

        // 在document上监听，捕获阶段，优先级最高
        document.addEventListener('click', handleClick, true);

        return () => {
            document.removeEventListener('click', handleClick, true);
        };
    }, []);

    // 监听滚动，更新活动标题
    useEffect(() => {
        if (!readme || tocItems.length === 0) return;

        const handleScroll = () => {
            const headingElements = tocItems.map(item => document.getElementById(item.id)).filter(Boolean);

            // 找到当前可视区域的标题
            for (let i = headingElements.length - 1; i >= 0; i--) {
                const element = headingElements[i];
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 100) {
                        setActiveHeading(element.id);
                        return;
                    }
                }
            }
            setActiveHeading('');
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // 初始化
        return () => window.removeEventListener('scroll', handleScroll);
    }, [readme, tocItems]);

    // 点击空白区域关闭目录
    useEffect(() => {
        if (!showToc) return;

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // 如果点击的不是目录按钮或目录内容，就关闭
            if (!target.closest('.toc-container') && !target.closest('.toc-button')) {
                setShowToc(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showToc]);

    if (!bookmark) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 固定顶部 Banner */}
            <div
                className={`fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 transition-transform duration-300 ${
                    showFixedBanner ? 'translate-y-0' : '-translate-y-full'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
                    <div className="flex items-center justify-between gap-4">
                        {/* 左侧：返回按钮 + 标题 */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                                onClick={() => navigate('/')}
                                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                                title="返回首页"
                            >
                                <svg
                                    className="w-5 h-5 text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                            </button>
                            <div className="flex items-center gap-2 min-w-0">
                                {githubInfo && (
                                    <img
                                        src={`https://github.com/${githubInfo.owner}.png?size=32`}
                                        alt={bookmark.title}
                                        className="w-8 h-8 rounded-lg flex-shrink-0"
                                    />
                                )}
                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold text-gray-900 truncate">{bookmark.title}</h2>
                                    {repoInfo?.npm_version && repoInfo.npm_version !== 'N/A' && (
                                        <span className="text-xs text-gray-500">v{repoInfo.npm_version}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 右侧：操作按钮 */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <a
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all text-sm font-medium"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                </svg>
                                <span className="hidden md:inline">GitHub</span>
                            </a>
                            {repoInfo?.npm_version && repoInfo.npm_version !== 'N/A' && (
                                <a
                                    href={`https://www.npmjs.com/package/${repoInfo.name}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-medium"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
                                    </svg>
                                    <span className="hidden md:inline">NPM</span>
                                </a>
                            )}
                            {/* 移动端：显示更多按钮 */}
                            <div className="sm:hidden flex gap-1">
                                <a
                                    href={bookmark.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 flex items-center justify-center bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
                                    title="访问 GitHub"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                    </svg>
                                </a>
                                {repoInfo?.npm_version && repoInfo.npm_version !== 'N/A' && (
                                    <a
                                        href={`https://www.npmjs.com/package/${repoInfo.name}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 flex items-center justify-center bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                                        title="访问 NPM"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                                {repoInfo?.npm_version && repoInfo.npm_version !== 'N/A' && (
                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                                        v{repoInfo.npm_version}
                                    </span>
                                )}
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
                                    ref={readmeRef}
                                    className="prose prose-sm max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-img:inline-block prose-img:my-0"
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
                            <div className="border-b border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
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
                                {/* 目录按钮 */}
                                {tocItems.length > 0 && (
                                    <button
                                        onClick={() => setShowToc(!showToc)}
                                        className="toc-button flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="目录"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 6h16M4 12h16M4 18h7"
                                            />
                                        </svg>
                                        目录
                                    </button>
                                )}
                            </div>
                            <div className="p-6 relative">
                                {loading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : readmeError || !readme || readme.trim().length === 0 ? (
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
                                    <>
                                        {/* 右侧浮动目录 */}
                                        {showToc && tocItems.length > 0 && (
                                            <div className="toc-container float-right w-64 ml-6 mb-4">
                                                <div className="sticky top-20 bg-white rounded-lg border border-gray-200 p-3">
                                                    <h3 className="text-xs font-semibold text-gray-700 mb-2 px-2">
                                                        目录
                                                    </h3>
                                                    <nav className="space-y-0.5 max-h-[calc(100vh-200px)] overflow-y-auto text-xs">
                                                        {tocItems.map((item, index) => (
                                                            <a
                                                                key={index}
                                                                href={`#${item.id}`}
                                                                onClick={e => {
                                                                    e.preventDefault();
                                                                    const element = readmeRef.current?.querySelector(
                                                                        `#${item.id}`
                                                                    );
                                                                    if (element) {
                                                                        const yOffset = -100; // 固定头部高度的偏移
                                                                        const elementPosition =
                                                                            element.getBoundingClientRect().top;
                                                                        const offsetPosition =
                                                                            elementPosition +
                                                                            window.pageYOffset +
                                                                            yOffset;
                                                                        window.scrollTo({
                                                                            top: offsetPosition,
                                                                            behavior: 'smooth',
                                                                        });
                                                                    }
                                                                }}
                                                                className={`flex items-start gap-1.5 py-1 px-2 rounded transition-colors ${
                                                                    activeHeading === item.id
                                                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                                                        : 'text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                                style={{
                                                                    paddingLeft: `${(item.level - 1) * 10 + 8}px`,
                                                                }}
                                                            >
                                                                <span className="w-1 h-1 rounded-full bg-current flex-shrink-0 mt-1.5"></span>
                                                                <span className="flex-1 leading-snug">{item.text}</span>
                                                            </a>
                                                        ))}
                                                    </nav>
                                                </div>
                                            </div>
                                        )}
                                        <div key="readme-content" ref={readmeRef} className="markdown-body" />
                                        {/* HTML内容通过useEffect中的innerHTML设置 */}
                                    </>
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
                                <ResponsiveContainer width="100%" height={128}>
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

            {/* 回到顶部按钮 */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`fixed bottom-8 right-8 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-40 flex items-center justify-center ${
                    showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16 pointer-events-none'
                }`}
                title="回到顶部"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
            </button>
        </div>
    );
}
