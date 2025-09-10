import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClarityProvider from '../components/clarity-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: '前端利器库',
    description: '精心整理的前端开发工具与资源，让你的开发更高效',
    icons: {
        icon: [
            { url: '/favicon.svg', type: 'image/svg+xml' },
            { url: '/favicon-16x16.svg', sizes: '16x16', type: 'image/svg+xml' },
            { url: '/favicon-32x32.svg', sizes: '32x32', type: 'image/svg+xml' },
        ],
        apple: { url: '/apple-touch-icon.png.svg', sizes: '180x180', type: 'image/svg+xml' },
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
                <ClarityProvider />
                {children}
            </body>
        </html>
    );
}
