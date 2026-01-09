import React, { useState, useMemo, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ComparisonView from '../components/ComparisonView';
import comparisonData from '../data/comparison-data.json';
import bookmarksData from '../data/bookmarks.json';

// ============ 类型定义 ============

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
        language: string;
        repoSize: number;
        forks: number;
        openIssues: number;
        watchers: number;
    };
}

// ============ Props 接口定义 ============

interface PageHeaderProps {
    libraryAName?: string;
    libraryBName?: string;
}

interface SelectedLibraryTagProps {
    library: Library;
    colorScheme: 'blue' | 'yellow';
    onRemove: () => void;
}

interface LibraryDropdownItemProps {
    library: Library;
    isHighlighted: boolean;
    onClick: () => void;
    itemRef?: React.RefObject<HTMLButtonElement | null>;
}

interface PopularComparisonsProps {
    comparisons: { idA: string; idB: string; label: string }[];
    onSelect: (idA: string, idB: string) => void;
}

interface EmptyComparisonStateProps {
    isSameLibrary: boolean;
}

// ============ 子组件函数 ============

function PageHeader({ libraryAName, libraryBName }: PageHeaderProps) {
    return (
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">前端工具库对比</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                对比 <span className="font-semibold text-gray-900 dark:text-white">{libraryAName || '库A'}</span> 和{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{libraryBName || '库B'}</span>{' '}
                的功能、性能和语法，帮助你为项目选择合适的工具。
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    );
}

function SelectedLibraryTag({ library, colorScheme, onRemove }: SelectedLibraryTagProps) {
    const colorClasses =
        colorScheme === 'blue'
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800/50'
            : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-100 dark:border-yellow-800/50';

    const buttonColorClass = colorScheme === 'blue' ? 'text-blue-400' : 'text-yellow-400';

    return (
        <div className={`flex items-center gap-2 ${colorClasses} px-3 py-1.5 rounded-lg border shadow-sm`}>
            <img
                src={`https://github.com/${library.githubUrl.split('/')[0]}.png?size=24`}
                alt={library.name}
                className="w-5 h-5 rounded"
            />
            <span className="text-sm font-medium">{library.name}</span>
            <button
                onClick={onRemove}
                className={`ml-1 ${buttonColorClass} hover:text-red-500 transition-colors rounded-full hover:bg-white/50 dark:hover:bg-black/20 p-0.5`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

function LibraryDropdownItem({ library, isHighlighted, onClick, itemRef }: LibraryDropdownItemProps) {
    return (
        <button
            ref={itemRef}
            onClick={onClick}
            className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors group/item border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                isHighlighted ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-blue-50 dark:hover:bg-blue-900/10'
            }`}
        >
            <div className="flex items-center gap-3">
                <img
                    src={`https://github.com/${library.githubUrl.split('/')[0]}.png?size=40`}
                    alt={library.name}
                    className="w-9 h-9 rounded-lg shadow-sm"
                />
                <div>
                    <div
                        className={`font-semibold text-sm transition-colors ${
                            isHighlighted
                                ? 'text-blue-600'
                                : 'text-gray-900 dark:text-white group-hover/item:text-blue-600'
                        }`}
                    >
                        {library.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {library.npmPackage} · ⭐ {(library.dimensions.stars / 1000).toFixed(1)}k
                    </div>
                </div>
            </div>
            <svg
                className={`w-5 h-5 transition-all transform ${
                    isHighlighted
                        ? 'text-blue-600 opacity-100 translate-x-0'
                        : 'text-gray-300 dark:text-gray-600 group-hover/item:text-blue-600 opacity-0 group-hover/item:opacity-100 translate-x-2 group-hover/item:translate-x-0'
                }`}
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
    );
}

function PopularComparisons({ comparisons, onSelect }: PopularComparisonsProps) {
    return (
        <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400 flex justify-center gap-2">
            <span>热门对比：</span>
            {comparisons.map((comparison, index) => (
                <React.Fragment key={comparison.label}>
                    {index > 0 && <span className="text-gray-300 dark:text-gray-600">|</span>}
                    <span
                        onClick={() => onSelect(comparison.idA, comparison.idB)}
                        className="hover:text-blue-600 cursor-pointer border-b border-dashed border-gray-300 hover:border-blue-600 transition-colors"
                    >
                        {comparison.label}
                    </span>
                </React.Fragment>
            ))}
        </div>
    );
}

function EmptyComparisonState({ isSameLibrary }: EmptyComparisonStateProps) {
    return (
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">请选择两个不同的库进行对比</h3>
            <p className="text-gray-500 dark:text-gray-400">
                {isSameLibrary
                    ? '不能选择相同的库，请选择两个不同的库进行对比'
                    : '从上方搜索框中分别选择两个库，即可查看详细对比'}
            </p>
        </div>
    );
}

// ============ 主页面组件 ============

function Compare() {
    const [searchQueryA, setSearchQueryA] = useState('');
    const [searchQueryB, setSearchQueryB] = useState('');
    const [selectedLibraryA, setSelectedLibraryA] = useState<string>('');
    const [selectedLibraryB, setSelectedLibraryB] = useState<string>('');
    const [dropdownOpenA, setDropdownOpenA] = useState(false);
    const [dropdownOpenB, setDropdownOpenB] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const highlightedItemRef = useRef<HTMLButtonElement>(null);

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

    const libraries = useMemo(() => {
        return Object.values(comparisonData.libraries) as Library[];
    }, []);

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
                    return { idA: libA.id, idB: libB.id, label: `${pair.nameA} vs ${pair.nameB}` };
                }
                return null;
            })
            .filter(Boolean) as { idA: string; idB: string; label: string }[];
    }, [libraries]);

    const filteredLibrariesA = useMemo(() => {
        let filtered = libraries;
        if (selectedLibraryB) {
            filtered = filtered.filter(lib => lib.id !== selectedLibraryB);
        }
        if (!searchQueryA.trim()) return filtered;
        const query = searchQueryA.toLowerCase();
        return filtered.filter(
            lib =>
                lib.name.toLowerCase().includes(query) ||
                lib.npmPackage.toLowerCase().includes(query) ||
                lib.tags.some(tag => tag.toLowerCase().includes(query))
        );
    }, [libraries, searchQueryA, selectedLibraryB]);

    const filteredLibrariesB = useMemo(() => {
        let filtered = libraries;
        if (selectedLibraryA) {
            filtered = filtered.filter(lib => lib.id !== selectedLibraryA);
        }
        if (!searchQueryB.trim()) return filtered;
        const query = searchQueryB.toLowerCase();
        return filtered.filter(
            lib =>
                lib.name.toLowerCase().includes(query) ||
                lib.npmPackage.toLowerCase().includes(query) ||
                lib.tags.some(tag => tag.toLowerCase().includes(query))
        );
    }, [libraries, searchQueryB, selectedLibraryA]);

    const libraryA = libraries.find(lib => lib.id === selectedLibraryA);
    const libraryB = libraries.find(lib => lib.id === selectedLibraryB);
    const canCompare = selectedLibraryA && selectedLibraryB && selectedLibraryA !== selectedLibraryB;

    const handlePopularComparison = (libAId: string, libBId: string) => {
        setSelectedLibraryA(libAId);
        setSelectedLibraryB(libBId);
        setSearchQueryA('');
        setSearchQueryB('');
        setDropdownOpenA(false);
        setDropdownOpenB(false);
        setHighlightedIndex(-1);
    };

    const handleSelectLibrary = (libId: string) => {
        if (dropdownOpenA && !selectedLibraryA) {
            setSelectedLibraryA(libId);
            setSearchQueryA('');
            setDropdownOpenA(false);
            setDropdownOpenB(true);
            setHighlightedIndex(-1);
        } else if (dropdownOpenB && !selectedLibraryB) {
            setSelectedLibraryB(libId);
            setSearchQueryB('');
            setDropdownOpenB(false);
            setHighlightedIndex(-1);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const currentList = dropdownOpenA ? filteredLibrariesA : filteredLibrariesB;

        if (!currentList.length) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => (prev < currentList.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < currentList.length) {
                    handleSelectLibrary(currentList[highlightedIndex].id);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setDropdownOpenA(false);
                setDropdownOpenB(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    useEffect(() => {
        setHighlightedIndex(-1);
    }, [searchQueryA, searchQueryB, dropdownOpenA, dropdownOpenB]);

    useEffect(() => {
        if (highlightedIndex >= 0 && highlightedItemRef.current) {
            highlightedItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [highlightedIndex]);

    const getTagColor = (tag: string) => {
        const tagConfig = (bookmarksData.tags as Record<string, { backgroundColor?: string; textColor?: string }>)[tag];
        if (tagConfig?.backgroundColor && tagConfig?.textColor) {
            return { backgroundColor: tagConfig.backgroundColor, color: tagConfig.textColor };
        }
        return { backgroundColor: '#e5e7eb', color: '#1f2937' };
    };

    const currentFilteredLibraries = dropdownOpenA ? filteredLibrariesA : filteredLibrariesB;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Header isFixed={false} searchQuery="" setSearchQuery={() => {}} />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <PageHeader libraryAName={libraryA?.name} libraryBName={libraryB?.name} />

                {/* 选择器区域 */}
                <div className="max-w-3xl mx-auto mb-12" ref={dropdownRef}>
                    <div className="relative bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap items-center gap-2 p-1">
                            {selectedLibraryA && libraryA && (
                                <SelectedLibraryTag
                                    library={libraryA}
                                    colorScheme="blue"
                                    onRemove={() => setSelectedLibraryA('')}
                                />
                            )}

                            {selectedLibraryB && libraryB && (
                                <SelectedLibraryTag
                                    library={libraryB}
                                    colorScheme="yellow"
                                    onRemove={() => setSelectedLibraryB('')}
                                />
                            )}

                            <div className="flex-1 min-w-[200px]">
                                <input
                                    type="text"
                                    value={searchQueryA || searchQueryB}
                                    onChange={e => {
                                        if (selectedLibraryA && selectedLibraryB) return;
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
                                        if (selectedLibraryA && selectedLibraryB) return;
                                        if (!selectedLibraryA) {
                                            setDropdownOpenA(true);
                                            setDropdownOpenB(false);
                                        } else if (!selectedLibraryB) {
                                            setDropdownOpenB(true);
                                            setDropdownOpenA(false);
                                        }
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder={selectedLibraryA && selectedLibraryB ? '已选择2个库' : '添加要对比的工具...'}
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

                        {(dropdownOpenA || dropdownOpenB) && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                    推荐库
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {currentFilteredLibraries.length > 0 ? (
                                        currentFilteredLibraries.map((lib, index) => (
                                            <LibraryDropdownItem
                                                key={lib.id}
                                                library={lib}
                                                isHighlighted={index === highlightedIndex}
                                                onClick={() => handleSelectLibrary(lib.id)}
                                                itemRef={index === highlightedIndex ? highlightedItemRef : undefined}
                                            />
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-gray-500 dark:text-gray-400">未找到匹配的库</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <PopularComparisons comparisons={popularComparisons} onSelect={handlePopularComparison} />
                </div>

                {canCompare ? (
                    <ComparisonView libraryA={libraryA!} libraryB={libraryB!} getTagColor={getTagColor} />
                ) : (
                    <EmptyComparisonState
                        isSameLibrary={!!(selectedLibraryA && selectedLibraryB && selectedLibraryA === selectedLibraryB)}
                    />
                )}
            </main>

            <Footer />
        </div>
    );
}

export default Compare;
