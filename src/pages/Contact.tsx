import { useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ClarityProvider from '../components/ClarityProvider';

export default function Contact() {
    const giscusLoadedRef = useRef(false);

    // 页面加载时加载 Giscus
    useEffect(() => {
        if (!giscusLoadedRef.current) {
            giscusLoadedRef.current = true;

            // 检查是否已经被预加载，如果有则直接使用
            const existingScript = document.querySelector('script[src="https://giscus.app/client.js"]');
            if (existingScript) {
                console.log('✅ Using preloaded Giscus script');
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://giscus.app/client.js';
            script.setAttribute('data-repo', 'maxlongint/maxlongint.github.io');
            script.setAttribute('data-repo-id', 'R_kgDONdqNSQ');
            script.setAttribute('data-category', 'General');
            script.setAttribute('data-category-id', 'DIC_kwDONdqNSc4Clg9m');
            script.setAttribute('data-mapping', 'pathname');
            script.setAttribute('data-strict', '0');
            script.setAttribute('data-reactions-enabled', '1');
            script.setAttribute('data-emit-metadata', '0');
            script.setAttribute('data-input-position', 'top');
            script.setAttribute('data-theme', 'light');
            script.setAttribute('data-lang', 'zh-CN');
            script.crossOrigin = 'anonymous';
            script.async = true;

            const container = document.getElementById('giscus-container');
            if (container) {
                container.appendChild(script);
            }
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <ClarityProvider projectId="t7y8qtm5hl" enabled={true} />
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h2 className="text-5xl font-bold text-gray-900 mb-4">保持联系</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        对工具有疑问?分享您的反馈、报告错误,
                        <br />
                        或使用下面的讨论区为我们的工具库推荐新的前端工具。
                    </p>
                </div>

                {/* Contact Information Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">联系方式</h3>

                        <div className="space-y-6">
                            {/* Email */}
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                        邮箱
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">190615112@qq.com</p>
                                </div>
                            </div>

                            {/* QQ */}
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M21.395 15.035a39.548 39.548 0 00-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.076 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a38.97 38.97 0 00-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 1.229-1.452 1.722-2.983.019.137.038.276.063.415.608 3.416 2.214 5.858 4.051 5.858.956 0 1.815-.867 2.431-2.268.202.012.402.021.607.021s.405-.009.607-.021c.616 1.401 1.475 2.268 2.431 2.268 1.837 0 3.443-2.442 4.051-5.858a14.76 14.76 0 00.063-.415c.493 1.531 1.182 3.048 1.722 2.983.252-.03.583-1.39-.438-4.673z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                        联系QQ
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">190615112</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Community Card */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-amber-500 via-teal-600 to-cyan-700 rounded-xl shadow-sm p-8 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">加入我们的社区</h3>
                            <p className="text-white/90 mb-6">与 10k+ 开发者一起交流。</p>
                            <a
                                href="https://github.com/maxlongint/maxlongint.github.io"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                                </svg>
                                加入 GitHub
                            </a>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
                    </div>
                </div>

                {/* Giscus Discussion Board */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div id="giscus-container" className="giscus-container" />
                </div>
            </main>

            <Footer />
        </div>
    );
}
