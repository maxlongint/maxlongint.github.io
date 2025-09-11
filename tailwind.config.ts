import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
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
