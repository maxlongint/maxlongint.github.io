import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './src/data/**/*.json'],
    safelist: [
        // 确保所有标签颜色类都被包含
        {
            pattern:
                /^bg-(gray|red|blue|green|yellow|indigo|purple|pink|orange|teal|cyan|emerald|violet|fuchsia|rose|amber|lime|sky)-(100|200|300)$/,
        },
        {
            pattern:
                /^text-(gray|red|blue|green|yellow|indigo|purple|pink|orange|teal|cyan|emerald|violet|fuchsia|rose|amber|lime|sky)-(600|700|800)$/,
        },
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'Segoe UI',
                    'SF Pro SC',
                    'SF Pro Display',
                    'SF Pro Text',
                    'PingFang SC',
                    'Microsoft YaHei',
                    'Helvetica Neue',
                    'Arial',
                    'sans-serif',
                ],
            },
            // 优化字体大小与行高配置
            fontSize: {
                xs: ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
                sm: ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],
                base: ['1rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],
                lg: ['1.125rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],
                xl: ['1.25rem', { lineHeight: '1.6', letterSpacing: '0' }],
                '2xl': ['1.5rem', { lineHeight: '1.5', letterSpacing: '0' }],
                '3xl': ['1.875rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
                '4xl': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
                '5xl': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
            },
        },
        screens: {
            xs: '475px',
            sm: '640px',
            md: '768px',
            lg: '960px', // 设置lg为960px，作为移动端和桌面端的分界点
            xl: '1280px',
            '2xl': '1536px',
        },
    },
    plugins: [],
};
export default config;
