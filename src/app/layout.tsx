import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClarityProvider from '../components/clarity-provider';
import PerformanceMonitor from '../components/performance-monitor';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: {
        default: '前端利器库',
        template: '%s | 前端利器库',
    },
    description:
        '精心整理的前端开发工具与资源，让你的开发更高效。包含JavaScript库、TypeScript工具、图标资源、动画库等优秀的Web开发资源。',
    keywords: [
        '前端开发',
        'JavaScript',
        'TypeScript',
        '网页开发',
        '开发工具',
        'Web开发',
        '编程资源',
        '前端库',
        '代码工具',
    ],
    authors: [{ name: 'Cyclone77' }],
    creator: 'Cyclone77',
    publisher: 'Cyclone77',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: 'website',
        locale: 'zh_CN',
        title: '前端利器库',
        description: '精心整理的前端开发工具与资源，让你的开发更高效',
        siteName: '前端利器库',
    },
    twitter: {
        card: 'summary_large_image',
        title: '前端利器库',
        description: '精心整理的前端开发工具与资源，让你的开发更高效',
    },
    category: '技术',
    classification: '开发工具',
    icons: {
        icon: [
            { url: '/favicon.png', type: 'image/png' },
            { url: '/favicon.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
        ],
        apple: { url: '/favicon.png', sizes: '180x180', type: 'image/png' },
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="zh-CN">
            <body className={inter.className}>
                <PerformanceMonitor />
                <ClarityProvider />
                {children}
            </body>
        </html>
    );
}
