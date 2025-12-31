import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },

    base: './',
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // 将大型库分离到单独的chunk
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'chart-vendor': ['recharts'],
                    'markdown-vendor': ['marked', 'highlight.js'],
                },
            },
        },
        chunkSizeWarningLimit: 600,
        // 启用压缩优化
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true, // 生产环境移除 console
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug'],
            },
        },
        // 启用 CSS 代码分割
        cssCodeSplit: true,
        // 资源压缩阈值
        assetsInlineLimit: 4096,
        // 启用 sourcemap 仅用于错误追踪，不影响性能
        sourcemap: false,
    },
});
