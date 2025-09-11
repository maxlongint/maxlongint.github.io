import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/data/**/*.json',
    ],
    theme: {
        extend: {},
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
