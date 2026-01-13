import { useEffect, useState, useRef, useMemo } from 'react';
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
import type { BundleSize, NPMDownloadData, Bookmark, RepoInfo } from '../types';
import CompatibilityCard from '../components/CompatibilityCard';

// ============ Props 接口定义 ============

interface ToastNotificationProps {
    show: boolean;
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

interface BreadcrumbProps {
    title: string;
    onNavigateHome: () => void;
}

interface ActionButtonsProps {
    bookmark: Bookmark;
    repoInfo: RepoInfo | null;
    npmPackageName: string | null;
    onShare: () => void;
    isMobile?: boolean;
}

interface MetadataCardProps {
    icon: React.ReactNode;
    iconBgColor: string;
    title: string;
    value: React.ReactNode;
    subtitle?: string;
    children?: React.ReactNode;
}

interface TabSwitcherProps {
    activeTab: 'appreciate' | 'readme';
    setActiveTab: (tab: 'appreciate' | 'readme') => void;
    hasAppreciate: boolean;
    tocItems: { id: string; text: string; level: number }[];
    showToc: boolean;
    setShowToc: (show: boolean) => void;
}

interface TocPanelProps {
    tocItems: { id: string; text: string; level: number }[];
    showToc: boolean;
    readmeRef: React.RefObject<HTMLDivElement | null>;
}

interface NpmDownloadsChartProps {
    npmDownloads: NPMDownloadData[];
}

// ============ 子组件函数 ============

function ToastNotification({ show, message, type, onClose }: ToastNotificationProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
            <div
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full transform transition-all ${
                    show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`}
            >
                <div className="flex items-start gap-4">
                    <div
                        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                            type === 'success'
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-red-100 dark:bg-red-900/30'
                        }`}
                    >
                        {type === 'success' ? (
                            <svg
                                className="w-6 h-6 text-green-600 dark:text-green-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg
                                className="w-6 h-6 text-red-600 dark:text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3
                            className={`text-lg font-semibold mb-1 ${
                                type === 'success'
                                    ? 'text-green-900 dark:text-green-300'
                                    : 'text-red-900 dark:text-red-300'
                            }`}
                        >
                            {type === 'success' ? '复制成功！' : '复制失败'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{message}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                </div>
            </div>
        </div>
    );
}

function Breadcrumb({ title, onNavigateHome }: BreadcrumbProps) {
    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <button
                        onClick={onNavigateHome}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
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
                    <span className="text-gray-900 dark:text-white truncate">{title}</span>
                </div>
            </div>
        </div>
    );
}

function ActionButtons({ bookmark, repoInfo, npmPackageName, onShare, isMobile = false }: ActionButtonsProps) {
    const buttonClass = isMobile
        ? 'w-full px-5 py-3 rounded-xl transition-all shadow-lg active:shadow-xl flex items-center justify-center gap-2 font-semibold text-sm'
        : 'px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-semibold';

    return (
        <div className={isMobile ? 'flex flex-col gap-2.5' : 'flex flex-col gap-3 flex-shrink-0'}>
            <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonClass} bg-gray-900 text-white hover:bg-gray-800`}
            >
                <svg className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>访问 GitHub</span>
            </a>
            {repoInfo?.npm_version && repoInfo.npm_version !== 'N/A' && (
                <a
                    href={`https://www.npmjs.com/package/${npmPackageName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${buttonClass} bg-red-600 text-white hover:bg-red-700`}
                >
                    <svg className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
                    </svg>
                    <span>NPM Package</span>
                </a>
            )}
            <button
                onClick={onShare}
                className={`${buttonClass} bg-purple-600 text-white hover:bg-purple-700`}
            >
                <svg className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                </svg>
                <span>分享卡片</span>
            </button>
        </div>
    );
}

function MetadataCard({ icon, iconBgColor, title, value, subtitle, children }: MetadataCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg ${iconBgColor} flex items-center justify-center`}>{icon}</div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
            {children}
        </div>
    );
}

function TabSwitcher({ activeTab, setActiveTab, hasAppreciate, tocItems, showToc, setShowToc }: TabSwitcherProps) {
    if (hasAppreciate) {
        return (
            <div className="px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-end justify-between">
                <div className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('appreciate')}
                        className={`relative py-3 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                            activeTab === 'appreciate'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                        </svg>
                        鉴赏
                        {activeTab === 'appreciate' && (
                            <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('readme')}
                        className={`relative py-3 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                            activeTab === 'readme'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        README
                        {activeTab === 'readme' && (
                            <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                        )}
                    </button>
                </div>
                {activeTab === 'readme' && tocItems.length > 0 && (
                    <button
                        onClick={() => setShowToc(!showToc)}
                        className="toc-button flex items-center gap-1.5 px-3 py-1.5 mb-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        title="目录"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        目录
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-end justify-between">
            <h2 className="py-3 text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
                README
            </h2>
            {tocItems.length > 0 && (
                <button
                    onClick={() => setShowToc(!showToc)}
                    className="toc-button flex items-center gap-1.5 px-3 py-1.5 mb-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    title="目录"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    目录
                </button>
            )}
        </div>
    );
}

function TocPanel({ tocItems, showToc, readmeRef }: TocPanelProps) {
    if (!showToc || tocItems.length === 0) return null;

    return (
        <div className="toc-container float-right w-64 ml-6 mb-4">
            <div className="sticky top-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 px-2">目录</h3>
                <nav className="space-y-0.5 max-h-[calc(100vh-200px)] overflow-y-auto text-xs">
                    {tocItems.map((item, index) => (
                        <a
                            key={index}
                            href={`#${item.id}`}
                            onClick={e => {
                                e.preventDefault();
                                const element = readmeRef.current?.querySelector(`#${item.id}`);
                                if (element) {
                                    const yOffset = -100;
                                    const elementPosition = element.getBoundingClientRect().top;
                                    const offsetPosition = elementPosition + window.pageYOffset + yOffset;
                                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                                }
                            }}
                            className="flex items-start gap-1.5 py-1 px-2 rounded transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            style={{ paddingLeft: `${(item.level - 1) * 10 + 8}px` }}
                        >
                            <span className="w-1 h-1 rounded-full bg-current flex-shrink-0 mt-1.5"></span>
                            <span className="flex-1 leading-snug">{item.text}</span>
                        </a>
                    ))}
                </nav>
            </div>
        </div>
    );
}

function NpmDownloadsChart({ npmDownloads }: NpmDownloadsChartProps) {
    const chartData =
        npmDownloads.length > 0
            ? npmDownloads
            : [
                  { date: 'Jan', downloads: 35000 },
                  { date: 'Feb', downloads: 38000 },
                  { date: 'Mar', downloads: 40000 },
                  { date: 'Apr', downloads: 42000 },
                  { date: 'May', downloads: 44000 },
                  { date: 'Jun', downloads: 45231 },
              ];

    return (
        <div className="h-32">
            <ResponsiveContainer width="100%" height={128}>
                <AreaChart data={chartData}>
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
                    <Area type="monotone" dataKey="downloads" stroke="#3B82F6" strokeWidth={2} fill="url(#colorDownloads)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

// ============ 配置 ============

// 配置 marked 使用 GitHub Flavored Markdown (GFM)
marked.setOptions({
    gfm: true,
    breaks: true,
});

// 配置 Emoji 支持
marked.use(
    markedEmoji({
        emojis: nameToEmoji,
        renderer: token => token.emoji,
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

// ============ 主页面组件 ============

export default function BookmarkDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [readme, setReadme] = useState<string>('');
    const [npmDownloads, setNpmDownloads] = useState<NPMDownloadData[]>([]);
    const [bundleSize, setBundleSize] = useState<BundleSize | null>(null);
    const [loading, setLoading] = useState(true);
    const [readmeLoaded, setReadmeLoaded] = useState(false);
    const [readmeError, setReadmeError] = useState(false);
    const [tocItems, setTocItems] = useState<{ id: string; text: string; level: number }[]>([]);
    const [showToc, setShowToc] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [activeTab, setActiveTab] = useState<'appreciate' | 'readme'>('appreciate');
    const [appreciate, setAppreciate] = useState<string>('');
    const [appreciateLoaded, setAppreciateLoaded] = useState(false);
    const [appreciateError, setAppreciateError] = useState(false);
    const readmeRef = useRef<HTMLDivElement>(null);
    const mobileReadmeRef = useRef<HTMLDivElement>(null);
    const appreciateRef = useRef<HTMLDivElement>(null);
    const mobileAppreciateRef = useRef<HTMLDivElement>(null);
    const hasRenderedRef = useRef<boolean>(false);

    // 显示提示框
    const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // 分享按钮处理
    const handleShare = async () => {
        if (!bookmark) return;

        const routeName = bookmark.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const ogImageUrl = `${window.location.origin}/og-images/${routeName}.png`;

        try {
            const response = await fetch(ogImageUrl);

            if (!response.ok || response.status !== 200) {
                throw new Error(`图片不存在 (HTTP ${response.status})`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.startsWith('image/')) {
                throw new Error(`返回的不是图片文件 (${contentType})`);
            }

            const blob = await response.blob();

            if (!blob.type.startsWith('image/')) {
                throw new Error(`Blob 类型不正确 (${blob.type})`);
            }

            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob,
                }),
            ]);

            showToastMessage('分享卡片已复制到剪贴板！\n可以直接粘贴到 QQ、微信等应用分享啦~', 'success');
        } catch (error) {
            console.error('复制失败:', error);
            showToastMessage('分享图片不存在或复制失败\n请联系管理员生成分享图片', 'error');
        }
    };

    const bookmark = useMemo(() => {
        return bookmarksData.bookmarks.find(b => {
            const routeName = b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return routeName === id;
        });
    }, [id]);

    const repoInfo = useMemo(() => {
        return bookmark ? getGitHubRepoInfo(bookmark.url) : null;
    }, [bookmark]);

    const githubInfo = useMemo(() => {
        return bookmark ? getGitHubInfo(bookmark.url) : null;
    }, [bookmark]);

    const npmPackageName = useMemo(() => {
        if (bookmark?.npmUrl) {
            const match = bookmark.npmUrl.match(/npmjs\.com\/package\/(@[^/]+\/[^/?]+|[^/?]+)/);
            if (match) {
                return match[1];
            }
        }
        if (repoInfo?.name) {
            return repoInfo.name;
        }
        if (githubInfo?.repo) {
            return githubInfo.repo;
        }
        return null;
    }, [bookmark, repoInfo, githubInfo]);

    const renderedReadme = useMemo(() => readme, [readme]);

    useEffect(() => {
        window.scrollTo(0, 0);
        hasRenderedRef.current = false;
        setAppreciateLoaded(false);
        setAppreciateError(false);
        setAppreciate('');
    }, [id]);

    useEffect(() => {
        if (bookmark) {
            document.title = `${bookmark.title} - 前端工具库`;

            const routeName = bookmark.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const ogImageUrl = `${window.location.origin}/og-images/${routeName}.png`;
            const ogUrl = window.location.href;

            const updateMetaTag = (property: string, content: string) => {
                let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
                if (!meta) {
                    meta = document.createElement('meta');
                    meta.setAttribute('property', property);
                    document.head.appendChild(meta);
                }
                meta.setAttribute('content', content);
            };

            const updateTwitterTag = (name: string, content: string) => {
                let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
                if (!meta) {
                    meta = document.createElement('meta');
                    meta.setAttribute('name', name);
                    document.head.appendChild(meta);
                }
                meta.setAttribute('content', content);
            };

            updateMetaTag('og:title', `${bookmark.title} - 前端工具库`);
            updateMetaTag('og:description', bookmark.description);
            updateMetaTag('og:image', ogImageUrl);
            updateMetaTag('og:url', ogUrl);
            updateMetaTag('og:type', 'article');

            updateTwitterTag('twitter:card', 'summary_large_image');
            updateTwitterTag('twitter:title', `${bookmark.title} - 前端工具库`);
            updateTwitterTag('twitter:description', bookmark.description);
            updateTwitterTag('twitter:image', ogImageUrl);
        }
        return () => {
            document.title = '前端工具库';

            const resetMetaTag = (property: string, defaultContent: string) => {
                const meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
                if (meta) {
                    meta.setAttribute('content', defaultContent);
                }
            };

            const resetTwitterTag = (name: string, defaultContent: string) => {
                const meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
                if (meta) {
                    meta.setAttribute('content', defaultContent);
                }
            };

            resetMetaTag('og:title', '前端工具库');
            resetMetaTag('og:description', '精心整理的前端开发工具与资源,让你的开发更高效');
            resetMetaTag('og:type', 'website');
            resetTwitterTag('twitter:title', '前端工具库');
            resetTwitterTag('twitter:description', '精心整理的前端开发工具与资源,让你的开发更高效');
        };
    }, [bookmark]);

    useEffect(() => {
        if (!bookmark || !githubInfo) {
            navigate('/');
            return;
        }

        if (readmeLoaded) {
            return;
        }

        const fetchData = async () => {
            setLoading(true);

            const npmCacheKey = `npm_${npmPackageName}`;
            const bundleCacheKey = `bundle_${npmPackageName}`;
            const CACHE_EXPIRY_7_DAYS = 7 * 24 * 60 * 60 * 1000;

            try {
                const match = bookmark.url.match(/github\.com\/[^/]+\/([^/?#]+)/);
                let fileName = '';
                if (match) {
                    fileName = match[1].toLowerCase();
                } else {
                    fileName = bookmark.url.split('/').pop()?.toLowerCase() || '';
                }
                fileName = fileName.replace(/\./g, '-');
                const appreciatePath = `/appreciates/${fileName}.md`;

                try {
                    const appreciateResponse = await fetch(appreciatePath);

                    if (appreciateResponse.ok && appreciateResponse.status === 200) {
                        const contentType = appreciateResponse.headers.get('content-type');

                        if (
                            contentType &&
                            !contentType.includes('text/html') &&
                            (contentType.includes('text/') || contentType.includes('markdown'))
                        ) {
                            const appreciateText = await appreciateResponse.text();

                            if (
                                appreciateText &&
                                appreciateText.trim().length > 0 &&
                                !appreciateText.trim().startsWith('<!DOCTYPE') &&
                                !appreciateText.trim().startsWith('<html')
                            ) {
                                const appreciateHtml = await marked(appreciateText);
                                setAppreciate(appreciateHtml);
                                setAppreciateLoaded(true);
                                setAppreciateError(false);
                                setActiveTab('appreciate');
                            } else {
                                setAppreciateError(true);
                                setActiveTab('readme');
                            }
                        } else {
                            setAppreciateError(true);
                            setActiveTab('readme');
                        }
                    } else {
                        setAppreciateError(true);
                        setActiveTab('readme');
                    }
                } catch {
                    setAppreciateError(true);
                    setActiveTab('readme');
                }

                let readmeText: string | null = null;
                let retryCount = 0;
                const maxRetries = 10;
                const retryDelay = 100;

                while (!readmeText && retryCount < maxRetries) {
                    readmeText = await getGitHubReadme(githubInfo.owner, githubInfo.repo);
                    if (!readmeText) {
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                        retryCount++;
                    }
                }

                if (readmeText && readmeText.trim().length > 0) {
                    let htmlContent = await marked(readmeText);

                    htmlContent = htmlContent.replace(
                        /<img([^>]*?)src="(?!\/\/|http:\/\/|https:\/\/)([^"]+)"/g,
                        (_match, attrs, src) => {
                            let cleanSrc = src;

                            if (cleanSrc.startsWith('/') && cleanSrc.includes('../')) {
                                cleanSrc = cleanSrc.replace(/^\/+/, '').replace(/\.\.\//g, '');
                            }

                            const crossRepoMatch = cleanSrc.match(/^([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/);
                            if (crossRepoMatch) {
                                const [, owner, repo, branch, path] = crossRepoMatch;
                                return `<img${attrs}src="https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}" onerror="if(!this.dataset.failed){this.dataset.failed='1';this.src=this.src.replace('/${branch}/', '/master/');}else{this.style.display='none';}"`;
                            }

                            cleanSrc = cleanSrc.replace(/\/blob\//, '/');

                            const fullSrc = cleanSrc.startsWith('/')
                                ? `https://raw.githubusercontent.com/${githubInfo.owner}/${githubInfo.repo}/main${cleanSrc}`
                                : `https://raw.githubusercontent.com/${githubInfo.owner}/${githubInfo.repo}/main/${cleanSrc}`;
                            return `<img${attrs}src="${fullSrc}" onerror="if(!this.dataset.failed){this.dataset.failed='1';this.src=this.src.replace('/main/', '/master/');}else{this.style.display='none';}"`;
                        }
                    );

                    htmlContent = htmlContent.replace(
                        /<img([^>]*?)src="https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/([^"]+)"/g,
                        (_match, attrs, owner, repo, branch, path) => {
                            const correctSrc = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
                            return `<img${attrs}src="${correctSrc}"`;
                        }
                    );

                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = htmlContent;
                    const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
                    const toc: { id: string; text: string; level: number }[] = [];

                    headings.forEach((heading, index) => {
                        const level = parseInt(heading.tagName.substring(1));
                        const text = heading.textContent || '';

                        let headingId = heading.id;
                        if (!headingId) {
                            headingId = text
                                .toLowerCase()
                                .trim()
                                .replace(/[^\w\s-]/g, '')
                                .replace(/\s+/g, '-')
                                .replace(/-+/g, '-');

                            if (!headingId) {
                                headingId = `heading-${index}`;
                            }
                            heading.id = headingId;
                        }

                        toc.push({ id: headingId, text, level });
                    });

                    htmlContent = tempDiv.innerHTML;

                    setTocItems(toc);
                    setReadme(htmlContent);
                    setReadmeLoaded(true);
                    setReadmeError(false);
                } else {
                    setReadmeError(true);
                    setReadmeLoaded(true);
                }
                setLoading(false);

                if (npmPackageName && repoInfo?.npm_version !== 'N/A') {
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
                                `https://api.npmjs.org/downloads/range/last-month/${npmPackageName}`
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

                if (npmPackageName && repoInfo?.npm_version !== 'N/A') {
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
                                `https://bundlephobia.com/api/size?package=${npmPackageName}@latest`
                            );
                            if (bundleResponse.ok) {
                                const bundleData = await bundleResponse.json();
                                const sizeData = {
                                    gzip: (bundleData.gzip / 1024).toFixed(2) + ' kB',
                                    raw: (bundleData.size / 1024).toFixed(2) + ' kB',
                                };
                                setBundleSize(sizeData);
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
    }, [id]);

    useEffect(() => {
        if (!appreciate) return;

        if (appreciateRef.current) {
            appreciateRef.current.innerHTML = appreciate;
        }

        if (mobileAppreciateRef.current) {
            mobileAppreciateRef.current.innerHTML = appreciate;
        }

        const timeoutId = setTimeout(() => {
            [appreciateRef.current, mobileAppreciateRef.current].forEach(container => {
                if (!container) return;
                const codeBlocks = container.querySelectorAll('pre code');
                codeBlocks.forEach(block => {
                    const el = block as HTMLElement;
                    el.removeAttribute('data-highlighted');
                    el.className = el.className
                        .split(' ')
                        .filter(c => !c.startsWith('hljs'))
                        .join(' ');
                    hljs.highlightElement(el);
                });
            });
        }, 150);

        return () => clearTimeout(timeoutId);
    }, [appreciate]);

    useEffect(() => {
        if (!renderedReadme) return;

        if (readmeRef.current) {
            if (!hasRenderedRef.current || !readmeRef.current.hasChildNodes()) {
                readmeRef.current.innerHTML = renderedReadme;
                hasRenderedRef.current = true;
            }
        }

        if (mobileReadmeRef.current) {
            if (!mobileReadmeRef.current.hasChildNodes()) {
                mobileReadmeRef.current.innerHTML = renderedReadme;
            }
        }

        const timeoutId = setTimeout(() => {
            [readmeRef.current, mobileReadmeRef.current].forEach(container => {
                if (!container) return;
                const codeBlocks = container.querySelectorAll('pre code');
                codeBlocks.forEach(block => {
                    const el = block as HTMLElement;
                    el.removeAttribute('data-highlighted');
                    el.className = el.className
                        .split(' ')
                        .filter(c => !c.startsWith('hljs'))
                        .join(' ');

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

                    if (!hasLanguage) {
                        const result = hljs.highlightAuto(el.textContent || '');
                        el.innerHTML = result.value;
                        el.className = `hljs ${result.language || ''}`;
                    } else {
                        hljs.highlightElement(el);
                    }
                });
            });
        }, 150);

        return () => clearTimeout(timeoutId);
    }, [renderedReadme]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a') as HTMLAnchorElement;

            const inPcReadme = readmeRef.current?.contains(anchor);
            const inMobileReadme = mobileReadmeRef.current?.contains(anchor);

            if (!anchor || (!inPcReadme && !inMobileReadme)) {
                return;
            }

            const href = anchor.getAttribute('href');

            if (href?.includes('#')) {
                const hashIndex = href.indexOf('#');
                const hash = href.substring(hashIndex + 1);
                const beforeHash = href.substring(0, hashIndex);

                if (!beforeHash || beforeHash === '' || window.location.hash.includes(beforeHash)) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();

                    if (hash) {
                        const container = inPcReadme ? readmeRef.current : mobileReadmeRef.current;
                        if (container) {
                            const targetElement = container.querySelector(`#${CSS.escape(hash)}`);

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
                    }
                    return false;
                }
            }
        };

        document.addEventListener('click', handleClick, true);

        return () => {
            document.removeEventListener('click', handleClick, true);
        };
    }, []);

    useEffect(() => {
        if (!showToc) return;

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
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

    // Helper function to render tags
    const renderTags = (tags: string[], size: 'sm' | 'md' = 'md') => {
        const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';
        return tags.map((tag, index) => {
            const tagConfig = (
                bookmarksData.tags as Record<string, { className?: string; backgroundColor?: string; textColor?: string }>
            )[tag];
            const isStyleObject = tagConfig && tagConfig.backgroundColor && tagConfig.textColor;
            return (
                <span
                    key={index}
                    className={`${sizeClass} rounded-lg font-medium ${
                        isStyleObject ? '' : tagConfig?.className || 'bg-gray-100 text-gray-700'
                    }`}
                    style={
                        isStyleObject
                            ? { backgroundColor: tagConfig.backgroundColor, color: tagConfig.textColor }
                            : undefined
                    }
                >
                    {tag}
                </span>
            );
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <ToastNotification
                show={showToast}
                message={toastMessage}
                type={toastType}
                onClose={() => setShowToast(false)}
            />

            <Breadcrumb title={bookmark.title} onNavigateHome={() => navigate('/')} />

            {/* Banner区域 */}
            <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
                    {/* 移动端布局 */}
                    <div className="block lg:hidden space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-gray-700 shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-600">
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
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                                    {bookmark.title}
                                </h1>
                                {repoInfo?.npm_version && repoInfo.npm_version !== 'N/A' && (
                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                                        v{repoInfo.npm_version}
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                            {bookmark.description}
                        </p>
                        <div className="flex flex-wrap gap-2">{renderTags(bookmark.tags, 'sm')}</div>
                        <ActionButtons
                            bookmark={bookmark}
                            repoInfo={repoInfo}
                            npmPackageName={npmPackageName}
                            onShare={handleShare}
                            isMobile={true}
                        />
                    </div>

                    {/* PC端布局 */}
                    <div className="hidden lg:flex items-start gap-8">
                        <div className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-700 shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-600">
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

                        <div className="flex-1">
                            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                                {bookmark.title}
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-6 max-w-3xl">
                                {bookmark.description}
                            </p>

                            <div className="flex items-center gap-3 mb-6">
                                {repoInfo?.npm_version && repoInfo.npm_version !== 'N/A' && (
                                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full">
                                        v{repoInfo.npm_version}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">{renderTags(bookmark.tags)}</div>
                        </div>

                        <ActionButtons
                            bookmark={bookmark}
                            repoInfo={repoInfo}
                            npmPackageName={npmPackageName}
                            onShare={handleShare}
                        />
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
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">包体积</h3>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{bundleSize?.gzip || '—'}</div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Gzipped</p>
                        </div>

                        {/* Open Issues */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Issues</h3>
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
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm col-span-2">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">最后更新</h3>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <div className="text-xl font-bold text-gray-900 dark:text-white">
                                    {repoInfo?.pushed_at
                                        ? new Date(repoInfo.pushed_at).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
                                        : '—'}
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {repoInfo?.pushed_at
                                        ? new Date(repoInfo.pushed_at).toLocaleDateString('zh-CN', { year: 'numeric' })
                                        : ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 移动端 README/鉴赏 内容 */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                        <TabSwitcher
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            hasAppreciate={appreciateLoaded && !appreciateError}
                            tocItems={tocItems}
                            showToc={showToc}
                            setShowToc={setShowToc}
                        />

                        <div className="p-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: activeTab === 'appreciate' ? 'block' : 'none' }}>
                                        {appreciateLoaded && !appreciateError ? (
                                            <div key="mobile-appreciate-content" ref={mobileAppreciateRef} className="markdown-body" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                                <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">暂无鉴赏报告</h3>
                                                <p className="text-gray-500 dark:text-gray-400">该库暂时还没有鉴赏报告</p>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: activeTab === 'readme' ? 'block' : 'none' }}>
                                        {readmeError || !readme || readme.trim().length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                                <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">README 暂时无法加载</h3>
                                                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">数据正在同步中，稍后会自动更新。您也可以直接访问 GitHub 查看完整文档。</p>
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
                                            <div key="mobile-readme-content" ref={mobileReadmeRef} className="markdown-body" />
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* PC端布局 */}
                <div className="hidden lg:grid lg:grid-cols-4 gap-6">
                    {/* 左侧 README/鉴赏 内容 */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            <TabSwitcher
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                hasAppreciate={appreciateLoaded && !appreciateError}
                                tocItems={tocItems}
                                showToc={showToc}
                                setShowToc={setShowToc}
                            />

                            <div className="p-6 relative">
                                {loading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ display: activeTab === 'appreciate' ? 'block' : 'none' }}>
                                            {appreciateLoaded && !appreciateError ? (
                                                <div key="appreciate-content" ref={appreciateRef} className="markdown-body" />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                                    <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">暂无鉴赏报告</h3>
                                                    <p className="text-gray-500 dark:text-gray-400">该库暂时还没有鉴赏报告</p>
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: activeTab === 'readme' ? 'block' : 'none' }}>
                                            {readmeError || !readme || readme.trim().length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                                    <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">README 暂时无法加载</h3>
                                                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">数据正在同步中，稍后会自动更新。您也可以直接访问 GitHub 查看完整文档。</p>
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
                                                    <TocPanel tocItems={tocItems} showToc={showToc} readmeRef={readmeRef} />
                                                    <div key="readme-content" ref={readmeRef} className="markdown-body" />
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 右侧元数据卡片 */}
                    <div className="lg:col-span-1 space-y-4">
                        <MetadataCard
                            icon={
                                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            }
                            iconBgColor="bg-purple-100 dark:bg-purple-900/30"
                            title="包体积"
                            value={bundleSize?.gzip || '—'}
                            subtitle="Gzipped"
                        />

                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">NPM 下载</h3>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                {npmDownloads.length > 0 ? npmDownloads[npmDownloads.length - 1].downloads.toLocaleString() : '45,231'}
                            </div>
                            <NpmDownloadsChart npmDownloads={npmDownloads} />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">过去 30 天</p>
                        </div>

                        {npmPackageName && repoInfo?.npm_version !== 'N/A' && <CompatibilityCard packageName={npmPackageName} />}

                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Issues</h3>
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
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline block"
                                    >
                                        查看所有问题 →
                                    </a>
                                </div>
                            )}
                        </div>

                        <MetadataCard
                            icon={
                                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                            iconBgColor="bg-green-100 dark:bg-green-900/30"
                            title="最后更新"
                            value={
                                repoInfo?.pushed_at
                                    ? new Date(repoInfo.pushed_at).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
                                    : '—'
                            }
                            subtitle={
                                repoInfo?.pushed_at
                                    ? new Date(repoInfo.pushed_at).toLocaleDateString('zh-CN', { year: 'numeric' })
                                    : ''
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
