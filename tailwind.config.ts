import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/data/**/*.json', // 包含 JSON 数据文件
    ],
    safelist: [
        // 确保所有可能的颜色类都被包含
        {
            pattern:
                /bg-(gray|red|yellow|green|blue|indigo|purple|pink|orange|teal|cyan|emerald|lime|violet|amber|slate|zinc|neutral|stone|rose|sky|fuchsia)-(100|200|300|400)/,
            variants: ['hover', 'focus'],
        },
        {
            pattern:
                /text-(gray|red|yellow|green|blue|indigo|purple|pink|orange|teal|cyan|emerald|lime|violet|amber|slate|zinc|neutral|stone|rose|sky|fuchsia)-(600|700|800|900)/,
            variants: ['hover', 'focus'],
        },
    ],
    theme: {
        extend: {
            colors: {
                // 使用 Tailwind 的完整颜色系统
                gray: colors.gray,
                red: colors.red,
                yellow: colors.yellow,
                green: colors.green,
                blue: colors.blue,
                indigo: colors.indigo,
                purple: colors.purple,
                pink: colors.pink,
                orange: colors.orange,
                teal: colors.teal,
                cyan: colors.cyan,
                emerald: colors.emerald,
                lime: colors.lime,
                violet: colors.violet,
                amber: colors.amber,
                // 添加额外的颜色
                slate: colors.slate,
                zinc: colors.zinc,
                neutral: colors.neutral,
                stone: colors.stone,
                rose: colors.rose,
                sky: colors.sky,
                fuchsia: colors.fuchsia,
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
};
export default config;
