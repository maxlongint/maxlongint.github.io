import { useEffect, useState } from 'react';
import compatibilityData from '../data/compatibility-data.json';

interface CompatibilityInfo {
    node?: string | null;
    typescript: boolean;
    browsers?: string | null;
    license?: string | null;
    bundleSize?: number | null; // bytes
    sideEffects?: boolean | string[] | null;
    dependenciesCount?: number | null;
    weeklyDownloads?: number | null;
}

interface CompatibilityCardProps {
    packageName: string;
}

// 格式化字节大小
function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// 格式化数字（添加千位分隔符）
function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
}

export default function CompatibilityCard({ packageName }: CompatibilityCardProps) {
    const [compatibility, setCompatibility] = useState<CompatibilityInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 直接从导入的 JSON 数据中读取
        const packageData = (compatibilityData as { packages: Record<string, CompatibilityInfo> }).packages;

        if (packageName && packageData[packageName]) {
            setCompatibility(packageData[packageName]);
        }

        setLoading(false);
    }, [packageName]);

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (!compatibility) {
        return null; // 静默失败，不显示卡片
    }

    // 检查是否有任何有用的信息
    const hasInfo =
        compatibility.node ||
        compatibility.typescript ||
        compatibility.license ||
        compatibility.bundleSize ||
        compatibility.weeklyDownloads;
    if (!hasInfo) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <svg
                        className="w-4 h-4 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">兼容性</h3>
            </div>

            <div className="space-y-3">
                {/* Node.js */}
                {compatibility.node && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383 c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076 c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0 L3.075,6.68C2.99,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392 c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,18.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.921 c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.57,0.329,0.924,0.944,0.924,1.603 v10.15c0,0.659-0.354,1.273-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z M19.099,13.993 c0-1.9-1.284-2.406-3.987-2.763c-2.731-0.361-3.009-0.548-3.009-1.187c0-0.528,0.235-1.233,2.258-1.233 c1.807,0,2.473,0.389,2.747,1.607c0.024,0.115,0.129,0.199,0.247,0.199h1.141c0.071,0,0.138-0.031,0.186-0.081 c0.048-0.054,0.074-0.123,0.067-0.196c-0.177-2.098-1.571-3.076-4.388-3.076c-2.508,0-4.004,1.058-4.004,2.833 c0,1.925,1.488,2.457,3.895,2.695c2.88,0.282,3.103,0.703,3.103,1.269c0,0.983-0.789,1.402-2.642,1.402 c-2.327,0-2.839-0.584-3.011-1.742c-0.02-0.124-0.126-0.215-0.253-0.215h-1.137c-0.141,0-0.254,0.112-0.254,0.253 c0,1.482,0.806,3.248,4.655,3.248C17.501,17.007,19.099,15.91,19.099,13.993z" />
                            </svg>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Node.js</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{compatibility.node}</span>
                    </div>
                )}

                {/* TypeScript */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" />
                        </svg>
                        <span className="text-sm text-gray-600 dark:text-gray-400">TypeScript</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {compatibility.typescript ? '✅ 支持' : '❌ 不支持'}
                    </span>
                </div>

                {/* 许可证 */}
                {compatibility.license && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg
                                className="w-4 h-4 text-yellow-600"
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
                            <span className="text-sm text-gray-600 dark:text-gray-400">许可证</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {compatibility.license}
                        </span>
                    </div>
                )}

                {/* 包大小 */}
                {compatibility.bundleSize && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg
                                className="w-4 h-4 text-orange-600"
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
                            <span className="text-sm text-gray-600 dark:text-gray-400">包大小</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatBytes(compatibility.bundleSize)}
                        </span>
                    </div>
                )}

                {/* 副作用 */}
                {compatibility.sideEffects !== null && compatibility.sideEffects !== undefined && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg
                                className="w-4 h-4 text-indigo-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                            <span className="text-sm text-gray-600 dark:text-gray-400">副作用</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {compatibility.sideEffects === false ? '✅ 无' : '⚠️ 有'}
                        </span>
                    </div>
                )}

                {/* 依赖数量 */}
                {compatibility.dependenciesCount !== null && compatibility.dependenciesCount !== undefined && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg
                                className="w-4 h-4 text-pink-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                />
                            </svg>
                            <span className="text-sm text-gray-600 dark:text-gray-400">依赖</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {compatibility.dependenciesCount} 个
                        </span>
                    </div>
                )}

                {/* 每周下载量 */}
                {compatibility.weeklyDownloads && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
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
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                                />
                            </svg>
                            <span className="text-sm text-gray-600 dark:text-gray-400">周下载</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatNumber(compatibility.weeklyDownloads)}
                        </span>
                    </div>
                )}

                {/* 浏览器 */}
                {compatibility.browsers && (
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
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
                                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <span className="text-sm text-gray-600 dark:text-gray-400">浏览器</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white text-right max-w-[180px]">
                            {compatibility.browsers}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
