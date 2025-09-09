import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClarityProvider from '../components/clarity-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'URL收藏夹',
    description: '精心整理的网站收藏，让你的浏览更高效',
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
