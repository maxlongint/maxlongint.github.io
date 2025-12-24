import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ClarityProvider from '../components/ClarityProvider';
import { getTrendingData } from '../utils/github';
import type { WeeklyTrending } from '../types';

function Trending() {
    const [trendingData, setTrendingData] = useState<WeeklyTrending | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        // 从运行时加载 Trending 数据（类似 GitHub Stats）
        console.log('🔄 开始加载 Trending 数据...');
        const data = getTrendingData();
        if (data) {
            console.log('✅ 成功加载 Trending 数据:', data);
            console.log('📊 本周项目数量:', data.repos?.length);
            setTrendingData(data);
        } else {
            console.warn('⚠️ 没有找到 Trending 数据，尝试从文件加载...');
            // 如果运行时数据不存在，尝试直接加载 JSON 文件
            fetch('/trending.json')
                .then(res => {
                    console.log('📡 收到响应，状态码:', res.status);
                    return res.json();
                })
                .then(result => {
                    console.log('✅ 成功从文件加载:', result);
                    setTrendingData(result.data); // 注意：使用 result.data
                })
                .catch(err => {
                    console.error('❌ 加载 Trending 数据失败:', err);
                });
        }
    }, []);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <ClarityProvider projectId="t7y8qtm5hl" enabled={true} />
            <Header onOpenComments={() => {}} isFixed={false} searchQuery="" setSearchQuery={() => {}} />

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {trendingData &&
                                `${formatDate(trendingData.weekStart)} - ${formatDate(trendingData.weekEnd)}`}
                        </div>
                        <h1 className="text-5xl font-bold text-gray-900 mb-4">每周前端趋势</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            本周最热门的前端工具和项目，从 GitHub Trending 精选而来。
                        </p>
                    </div>
                </div>
            </div>

            {/* Trending 列表 */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        本周最热 {trendingData?.repos.length || 0} 个工具
                    </h2>
                    <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-2 transition-colors ${
                                viewMode === 'grid' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                                />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-2 transition-colors ${
                                viewMode === 'list' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {!trendingData ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
                        <p className="mt-4 text-gray-600">正在加载趋势数据...</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
                        {trendingData.repos.map(repo => (
                            <div
                                key={repo.rank}
                                className="bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all p-6 flex flex-col"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                                                {repo.rank}
                                            </span>
                                            <a
                                                href={repo.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                {repo.author} / {repo.name}
                                            </a>
                                        </div>
                                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{repo.description}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                    {repo.language && (
                                        <div className="flex items-center gap-1">
                                            <span
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: repo.languageColor }}
                                            ></span>
                                            <span>{repo.language}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span>{repo.stars.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>{repo.forks.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-green-600 font-medium">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>+{repo.starsThisWeek.toLocaleString()} 本周</span>
                                    </div>
                                </div>

                                {repo.builtBy.length > 0 && (
                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-auto">
                                        <span className="text-xs text-gray-500">Built by</span>
                                        <div className="flex -space-x-2">
                                            {repo.builtBy.slice(0, 5).map(builder => (
                                                <img
                                                    key={builder.username}
                                                    src={builder.avatar}
                                                    alt={builder.username}
                                                    className="w-6 h-6 rounded-full border-2 border-white"
                                                    title={builder.username}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* 返回首页 */}
                <div className="mt-12 text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        返回工具库
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Trending;
