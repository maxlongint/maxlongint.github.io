interface Library {
    id: string;
    name: string;
    githubUrl: string;
    npmPackage: string;
    tags: string[];
    dimensions: {
        bundleSize: { minified: number; gzipped: number };
        bundleSizeRating: string;
        weeklyDownloads: number;
        stars: number;
        lastUpdate: string;
        philosophy: string;
        ecosystem: string;
        ecosystemPlugins?: string[];
        npmVersion: string;
        // 新增维度
        language: string;
        repoSize: number;
        forks: number;
        openIssues: number;
        watchers: number;
    };
}

interface ComparisonViewProps {
    libraryA: Library;
    libraryB: Library;
    getTagColor: (tag: string) => { backgroundColor: string; color: string } | string;
}

function ComparisonView({ libraryA, libraryB }: ComparisonViewProps) {
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        if (bytes < k) return bytes + ' B';
        return (bytes / k).toFixed(2) + ' kB';
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
        return num.toString();
    };

    // 获取生态系统插件列表
    const getEcosystemPlugins = (library: Library): string[] => {
        return library.dimensions.ecosystemPlugins || [];
    };

    // 获取生态系统评级标签
    const getEcosystemLabel = (ecosystem: string): string => {
        const labels: { [key: string]: string } = {
            Rich: '丰富',
            Growing: '增长中',
            Moderate: '中等',
            Small: '较小',
        };
        return labels[ecosystem] || ecosystem;
    };

    // 获取生态系统描述
    const getEcosystemDescription = (ecosystem: string): string => {
        const descriptions: { [key: string]: string } = {
            Rich: '广泛的生态系统，拥有大量社区插件和集成',
            Growing: '增长中的生态系统，有主要库的官方适配器，但社区插件较少',
            Moderate: '中等规模的生态系统，有一些常用的插件支持',
            Small: '较小的生态系统，插件和集成相对较少',
        };
        return descriptions[ecosystem] || '生态系统信息';
    };

    // 检查是否应该显示生态 & 插件部分
    const shouldShowEcosystem = (): boolean => {
        const pluginsA = getEcosystemPlugins(libraryA);
        const pluginsB = getEcosystemPlugins(libraryB);
        return pluginsA.length > 0 || pluginsB.length > 0;
    };

    const calculatePercentage = (valueA: number, valueB: number) => {
        const total = valueA + valueB;
        if (total === 0) return { percentA: 50, percentB: 50 };
        return {
            percentA: (valueA / total) * 100,
            percentB: (valueB / total) * 100,
        };
    };

    const bundleSizePercent = calculatePercentage(
        libraryB.dimensions.bundleSize.gzipped,
        libraryA.dimensions.bundleSize.gzipped
    );

    return (
        <div className="space-y-8">
            {/* 对比表格 */}
            <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                {/* 表头 - 3列布局 */}
                <div className="grid grid-cols-1 md:grid-cols-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                    <div className="hidden md:flex items-center justify-center p-6 border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                        <span className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            对比维度
                        </span>
                    </div>

                    {/* Library A Header */}
                    <div className="p-6 border-r border-gray-200 dark:border-gray-700 relative group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src={`https://github.com/${libraryA.githubUrl.split('/')[0]}.png?size=48`}
                                    alt={libraryA.name}
                                    className="w-12 h-12 rounded-lg shadow-sm"
                                />
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{libraryA.name}</h3>
                                    <a
                                        href={`https://github.com/${libraryA.githubUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                    >
                                        v{libraryA.dimensions.npmVersion}
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                </svg>
                                {(libraryA.dimensions.stars / 1000).toFixed(0)}k
                            </span>
                            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-2 py-1 rounded">
                                TypeScript First
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{libraryA.dimensions.philosophy}</p>
                    </div>

                    {/* Library B Header */}
                    <div className="p-6 relative group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src={`https://github.com/${libraryB.githubUrl.split('/')[0]}.png?size=48`}
                                    alt={libraryB.name}
                                    className="w-12 h-12 rounded-lg shadow-sm"
                                />
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{libraryB.name}</h3>
                                    <a
                                        href={`https://github.com/${libraryB.githubUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                    >
                                        v{libraryB.dimensions.npmVersion}
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                </svg>
                                {(libraryB.dimensions.stars / 1000).toFixed(1)}k
                            </span>
                            <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs px-2 py-1 rounded">
                                Modular
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{libraryB.dimensions.philosophy}</p>
                    </div>
                </div>

                {/* 对比维度行 */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {/* Bundle Size */}
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        <div className="p-4 md:p-6 bg-gray-50/50 dark:bg-gray-900/30 border-r border-gray-200 dark:border-gray-700 flex items-center md:font-medium text-gray-600 dark:text-gray-400">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                                />
                            </svg>
                            打包体积(压缩后)
                        </div>
                        <div className="p-4 md:p-6 border-r border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-lg text-red-500">
                                    ~{formatBytes(libraryA.dimensions.bundleSize.gzipped)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                    较大
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-2">
                                <div
                                    className="bg-red-500 h-1.5 rounded-full"
                                    style={{ width: `${bundleSizePercent.percentA}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">包含完整库</p>
                        </div>
                        <div className="p-4 md:p-6">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-lg text-green-500">
                                    &lt; {formatBytes(libraryB.dimensions.bundleSize.gzipped)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                    模块化
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-2">
                                <div
                                    className="bg-green-500 h-1.5 rounded-full"
                                    style={{ width: `${bundleSizePercent.percentB}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">支持 Tree-shaking(按需引入)</p>
                        </div>
                    </div>

                    {/* Basic Usage → 主要语言 & 仓库大小 */}
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        <div className="p-4 md:p-6 bg-gray-50/50 dark:bg-gray-900/30 border-r border-gray-200 dark:border-gray-700 flex items-center md:font-medium text-gray-600 dark:text-gray-400">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                                />
                            </svg>
                            主要语言 & 仓库大小
                        </div>
                        <div className="p-4 md:p-6 border-r border-gray-200 dark:border-gray-700">
                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">主要语言</div>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                            {libraryA.dimensions.language || 'JavaScript'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">仓库大小</div>
                                    <div className="text-lg font-semibold">
                                        {formatNumber(libraryA.dimensions.repoSize || 0)} KB
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 md:p-6">
                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">主要语言</div>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                            {libraryB.dimensions.language || 'TypeScript'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">仓库大小</div>
                                    <div className="text-lg font-semibold">
                                        {formatNumber(libraryB.dimensions.repoSize || 0)} KB
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance → 社区活跃度 */}
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        <div className="p-4 md:p-6 bg-gray-50/50 dark:bg-gray-900/30 border-r border-gray-200 dark:border-gray-700 flex items-center md:font-medium text-gray-600 dark:text-gray-400">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            社区活跃度
                        </div>
                        <div className="p-4 md:p-6 border-r border-gray-200 dark:border-gray-700">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Fork 数</span>
                                    <span className="font-semibold">
                                        {formatNumber(libraryA.dimensions.forks || 0)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">关注者</span>
                                    <span className="font-semibold">
                                        {formatNumber(libraryA.dimensions.watchers || 0)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">开放 Issue</span>
                                    <span className="font-semibold">
                                        {formatNumber(libraryA.dimensions.openIssues || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 md:p-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Fork 数</span>
                                    <span className="font-semibold">
                                        {formatNumber(libraryB.dimensions.forks || 0)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">关注者</span>
                                    <span className="font-semibold">
                                        {formatNumber(libraryB.dimensions.watchers || 0)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">开放 Issue</span>
                                    <span className="font-semibold">
                                        {formatNumber(libraryB.dimensions.openIssues || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ecosystem & Plugins */}
                    {shouldShowEcosystem() && (
                        <div className="grid grid-cols-1 md:grid-cols-3">
                            <div className="p-4 md:p-6 bg-gray-50/50 dark:bg-gray-900/30 border-r border-gray-200 dark:border-gray-700 flex items-center md:font-medium text-gray-600 dark:text-gray-400">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
                                    />
                                </svg>
                                生态 & 插件
                            </div>
                            <div className="p-4 md:p-6 border-r border-gray-200 dark:border-gray-700">
                                <div className="mb-2">
                                    <span className="text-2xl font-bold">
                                        {getEcosystemLabel(libraryA.dimensions.ecosystem)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {getEcosystemDescription(libraryA.dimensions.ecosystem)}
                                </p>
                                {getEcosystemPlugins(libraryA).length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {getEcosystemPlugins(libraryA).map((plugin, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs border border-gray-200 dark:border-gray-600"
                                            >
                                                {plugin}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="p-4 md:p-6">
                                <div className="mb-2">
                                    <span className="text-2xl font-bold">
                                        {getEcosystemLabel(libraryB.dimensions.ecosystem)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {getEcosystemDescription(libraryB.dimensions.ecosystem)}
                                </p>
                                {getEcosystemPlugins(libraryB).length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {getEcosystemPlugins(libraryB).map((plugin, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs border border-gray-200 dark:border-gray-600"
                                            >
                                                {plugin}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Philosophy */}
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        <div className="p-4 md:p-6 bg-gray-50/50 dark:bg-gray-900/30 border-r border-gray-200 dark:border-gray-700 flex items-center md:font-medium text-gray-600 dark:text-gray-400">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                />
                            </svg>
                            设计理念
                        </div>
                        <div className="p-4 md:p-6 border-r border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold mb-1">开发体验优先</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                优先考虑链式语法和易用性。TypeScript 验证的"标准"。
                            </p>
                        </div>
                        <div className="p-4 md:p-6">
                            <h4 className="font-semibold mb-1">体积优先</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                优先考虑模块化。所有功能都是函数,实现积极的 tree-shaking。
                            </p>
                        </div>
                    </div>

                    {/* Weekly Downloads */}
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        <div className="p-4 md:p-6 bg-gray-50/50 dark:bg-gray-900/30 border-r border-gray-200 dark:border-gray-700 flex items-center md:font-medium text-gray-600 dark:text-gray-400">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                            </svg>
                            周下载量
                        </div>
                        <div className="p-4 md:p-6 border-r border-gray-200 dark:border-gray-700">
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold">
                                    {formatNumber(libraryA.dimensions.weeklyDownloads)}
                                </span>
                                <span className="text-sm text-green-500 mb-1">▲ 5%</span>
                            </div>
                        </div>
                        <div className="p-4 md:p-6">
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold">
                                    {formatNumber(libraryB.dimensions.weeklyDownloads)}
                                </span>
                                <span className="text-sm text-green-500 mb-1">▲ 15%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 底部按钮 */}
                <div className="grid grid-cols-1 md:grid-cols-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <div className="hidden md:block border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30"></div>
                    <div className="p-6 border-r border-gray-200 dark:border-gray-700 text-center">
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                            <span>查看文档</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                            </svg>
                        </button>
                    </div>
                    <div className="p-6 text-center">
                        <button className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                            <span>查看文档</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ComparisonView;
