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
                    'SF Pro SC',
                    'SF Pro Display',
                    'SF Pro Text',
                    'PingFang SC',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'Helvetica Neue',
                    'Arial',
                    'sans-serif',
                ],
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
