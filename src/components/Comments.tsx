import { useEffect, useRef, useState } from 'react';

interface CommentsProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Comments({ isOpen, onClose }: CommentsProps) {
    const drawerRef = useRef<HTMLDivElement>(null);
    const [isGiscusLoaded, setIsGiscusLoaded] = useState(false);

    // 点击外部关闭抽屉
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // 禁止背景滚动
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // 加载 Giscus
    useEffect(() => {
        if (isOpen && !isGiscusLoaded) {
            setIsGiscusLoaded(true);

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
    }, [isOpen, isGiscusLoaded]);

    if (!isOpen) return null;

    return (
        <>
            {/* 遮罩层 */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" />

            {/* 抽屉 */}
            <div
                ref={drawerRef}
                className="fixed right-0 top-0 h-full w-full md:w-[600px] lg:w-[700px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col"
            >
                {/* 头部 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">讨论</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="关闭"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* 内容区域 */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div id="giscus-container" className="giscus-container" />
                </div>
            </div>
        </>
    );
}
