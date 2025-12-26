import { useState, useMemo, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ComparisonView from '../components/ComparisonView';
import comparisonData from '../data/comparison-data.json';
import bookmarksData from '../data/bookmarks.json';

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
        npmVersion: string;
        // 新增维度
        language: string;
        repoSize: number;
        forks: number;
        openIssues: number;
        watchers: number;
    };
}

function Compare() {
    const [searchQueryA, setSearchQueryA] = useState('');
    const [searchQueryB, setSearchQueryB] = useState('');
    const [selectedLibraryA, setSelectedLibraryA] = useState<string>('');
    const [selectedLibraryB, setSelectedLibraryB] = useState<string>('');
    const [dropdownOpenA, setDropdownOpenA] = useState(false);
    const [dropdownOpenB, setDropdownOpenB] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 点击外部关闭下拉框
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpenA(false);
                setDropdownOpenB(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 获取所有库
    const libraries = useMemo(() => {
        return Object.values(comparisonData.libraries) as Library[];
    }, []);

    // 热门对比配置（使用库名称，自动查找ID）
    const popularComparisons = useMemo(() => {
        const pairs = [
            { nameA: 'Mutative', nameB: 'Immer' },
            { nameA: 'Valibot', nameB: 'Zod' },
            { nameA: 'Day.js', nameB: 'Moment.js' },
        ];

        return pairs
            .map(pair => {
                const libA = libraries.find(lib => lib.name === pair.nameA);
                const libB = libraries.find(lib => lib.name === pair.nameB);
                if (libA && libB) {
                    return {
                        idA: libA.id,
                        idB: libB.id,
                        label: `${pair.nameA} vs ${pair.nameB}`,
                    };
                }
                return null;
            })
            .filter(Boolean) as { idA: string; idB: string; label: string }[];
    }, [libraries]);

    // 筛选库A（排除已选的库B）
    const filteredLibrariesA = useMemo(() => {
        let filtered = libraries;
        // 排除已选的库B
        if (selectedLibraryB) {
            filtered = filtered.filter(lib => lib.id !== selectedLibraryB);
        }
        // 搜索筛选
        if (!searchQueryA.trim()) return filtered;
        const query = searchQueryA.toLowerCase();
        return filtered.filter(
            lib =>
                lib.name.toLowerCase().includes(query) ||
                lib.npmPackage.toLowerCase().includes(query) ||
                lib.tags.some(tag => tag.toLowerCase().includes(query))
        );
    }, [libraries, searchQueryA, selectedLibraryB]);

    // 筛选库B（排除已选的库A）
    const filteredLibrariesB = useMemo(() => {
        let filtered = libraries;
        // 排除已选的库A
        if (selectedLibraryA) {
            filtered = filtered.filter(lib => lib.id !== selectedLibraryA);
        }
        // 搜索筛选
        if (!searchQueryB.trim()) return filtered;
        const query = searchQueryB.toLowerCase();
        return filtered.filter(
            lib =>
                lib.name.toLowerCase().includes(query) ||
                lib.npmPackage.toLowerCase().includes(query) ||
                lib.tags.some(tag => tag.toLowerCase().includes(query))
        );
    }, [libraries, searchQueryB, selectedLibraryA]);

    // 获取选中的库信息
    const libraryA = libraries.find(lib => lib.id === selectedLibraryA);
    const libraryB = libraries.find(lib => lib.id === selectedLibraryB);

    // 检查是否选择了2个不同的库
    const canCompare = selectedLibraryA && selectedLibraryB && selectedLibraryA !== selectedLibraryB;

    // 热门对比快捷选择
    const handlePopularComparison = (libAId: string, libBId: string) => {
        setSelectedLibraryA(libAId);
        setSelectedLibraryB(libBId);
        setSearchQueryA('');
        setSearchQueryB('');
        setDropdownOpenA(false);
        setDropdownOpenB(false);
    };

    // 获取标签颜色
    const getTagColor = (tag: string) => {
        const tagConfig = (bookmarksData.tags as Record<string, { backgroundColor?: string; textColor?: string }>)[tag];
        if (tagConfig?.backgroundColor && tagConfig?.textColor) {
            return { backgroundColor: tagConfig.backgroundColor, color: tagConfig.textColor };
        }
        return { backgroundColor: '#e5e7eb', color: '#1f2937' };
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Header isFixed={false} searchQuery="" setSearchQuery={() => {}} />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                {/* 页面标题 */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">前端工具库对比</h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        对比{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">{libraryA?.name || '库A'}</span>{' '}
                        和{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">{libraryB?.name || '库B'}</span>{' '}
                        的功能、性能和语法，帮助你为项目选择合适的工具。
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <svg
                            className="w-4 h-4 text-blue-600 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                            数据来源：npm Registry、GitHub API、Bundlephobia，每日自动更新
                        </span>
                    </div>
                </div>

                {/* 选择器区域 - 按设计图样式 */}
                <div className="max-w-3xl mx-auto mb-12" ref={dropdownRef}>
                    <div className="relative bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap items-center gap-2 p-1">
                            {/* 已选择的库 A */}
                            {selectedLibraryA && libraryA && (
                                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/50 shadow-sm">
                                    <img
                                        src={`https://github.com/${libraryA.githubUrl.split('/')[0]}.png?size=24`}
                                        alt={libraryA.name}
                                        className="w-5 h-5 rounded"
                                    />
                                    <span className="text-sm font-medium">{libraryA.name}</span>
                                    <button
                                        onClick={() => setSelectedLibraryA('')}
                                        className="ml-1 text-blue-400 hover:text-red-500 transition-colors rounded-full hover:bg-white/50 dark:hover:bg-black/20 p-0.5"
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
                                </div>
                            )}

                            {/* 已选择的库 B */}
                            {selectedLibraryB && libraryB && (
                                <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-3 py-1.5 rounded-lg border border-yellow-100 dark:border-yellow-800/50 shadow-sm">
                                    <img
                                        src={`https://github.com/${libraryB.githubUrl.split('/')[0]}.png?size=24`}
                                        alt={libraryB.name}
                                        className="w-5 h-5 rounded"
                                    />
                                    <span className="text-sm font-medium">{libraryB.name}</span>
                                    <button
                                        onClick={() => setSelectedLibraryB('')}
                                        className="ml-1 text-yellow-400 hover:text-red-500 transition-colors rounded-full hover:bg-white/50 dark:hover:bg-black/20 p-0.5"
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
                                </div>
                            )}

                            {/* 搜索输入框 */}
                            <div className="flex-1 min-w-[200px]">
                                <input
                                    type="text"
                                    value={searchQueryA || searchQueryB}
                                    onChange={e => {
                                        // 如果已经选择了2个库，不允许再输入
                                        if (selectedLibraryA && selectedLibraryB) {
                                            return;
                                        }
                                        if (!selectedLibraryA) {
                                            setSearchQueryA(e.target.value);
                                            setDropdownOpenA(true);
                                            setDropdownOpenB(false);
                                        } else if (!selectedLibraryB) {
                                            setSearchQueryB(e.target.value);
                                            setDropdownOpenB(true);
                                            setDropdownOpenA(false);
                                        }
                                    }}
                                    onFocus={() => {
                                        // 如果已经选择了2个库，不打开下拉框
                                        if (selectedLibraryA && selectedLibraryB) {
                                            return;
                                        }
                                        if (!selectedLibraryA) {
                                            setDropdownOpenA(true);
                                            setDropdownOpenB(false);
                                        } else if (!selectedLibraryB) {
                                            setDropdownOpenB(true);
                                            setDropdownOpenA(false);
                                        }
                                    }}
                                    placeholder={
                                        selectedLibraryA && selectedLibraryB ? '已选择2个库' : '添加要对比的工具...'
                                    }
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 px-3 placeholder-gray-400 dark:placeholder-gray-500 font-medium focus:outline-none"
                                    disabled={!!(selectedLibraryA && selectedLibraryB)}
                                />
                            </div>

                            <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* 下拉列表 - 相对于选择框定位 */}
                        {(dropdownOpenA || dropdownOpenB) && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                    推荐库
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {(dropdownOpenA ? filteredLibrariesA : filteredLibrariesB).length > 0 ? (
                                        (dropdownOpenA ? filteredLibrariesA : filteredLibrariesB).map(lib => (
                                            <button
                                                key={lib.id}
                                                onClick={() => {
                                                    // 根据当前打开的下拉框来决定设置哪个库
                                                    if (dropdownOpenA && !selectedLibraryA) {
                                                        setSelectedLibraryA(lib.id);
                                                        setSearchQueryA('');
                                                        // 自动切换到选择第二个库
                                                        setDropdownOpenA(false);
                                                        setDropdownOpenB(true);
                                                    } else if (dropdownOpenB && !selectedLibraryB) {
                                                        setSelectedLibraryB(lib.id);
                                                        setSearchQueryB('');
                                                        // 选择完毕，关闭下拉框
                                                        setDropdownOpenB(false);
                                                    }
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/10 flex items-center justify-between transition-colors group/item border-b border-gray-100 dark:border-gray-700 last:border-0"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={`https://github.com/${
                                                            lib.githubUrl.split('/')[0]
                                                        }.png?size=40`}
                                                        alt={lib.name}
                                                        className="w-9 h-9 rounded-lg shadow-sm"
                                                    />
                                                    <div>
                                                        <div className="font-semibold text-sm text-gray-900 dark:text-white group-hover/item:text-blue-600 transition-colors">
                                                            {lib.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {lib.npmPackage} · ⭐{' '}
                                                            {(lib.dimensions.stars / 1000).toFixed(1)}k
                                                        </div>
                                                    </div>
                                                </div>
                                                <svg
                                                    className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover/item:text-blue-600 opacity-0 group-hover/item:opacity-100 transition-all transform translate-x-2 group-hover/item:translate-x-0"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-gray-500 dark:text-gray-400">未找到匹配的库</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 热门对比提示 */}
                    <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400 flex justify-center gap-2">
                        <span>热门对比：</span>
                        {popularComparisons.map((comparison, index) => (
                            <>
                                {index > 0 && (
                                    <span key={`sep-${index}`} className="text-gray-300 dark:text-gray-600">
                                        |
                                    </span>
                                )}
                                <span
                                    key={comparison.label}
                                    onClick={() => handlePopularComparison(comparison.idA, comparison.idB)}
                                    className="hover:text-blue-600 cursor-pointer border-b border-dashed border-gray-300 hover:border-blue-600 transition-colors"
                                >
                                    {comparison.label}
                                </span>
                            </>
                        ))}
                    </div>
                </div>

                {/* 对比结果 */}
                {canCompare ? (
                    <ComparisonView libraryA={libraryA!} libraryB={libraryB!} getTagColor={getTagColor} />
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <svg
                            className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            请选择两个不同的库进行对比
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {selectedLibraryA && selectedLibraryB && selectedLibraryA === selectedLibraryB
                                ? '不能选择相同的库，请选择两个不同的库进行对比'
                                : '从上方搜索框中分别选择两个库，即可查看详细对比'}
                        </p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default Compare;
