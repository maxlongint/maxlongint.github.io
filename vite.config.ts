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
                    'react-vendor': ['react', 'react-dom'],
                    'router-vendor': ['react-router-dom'],
                    'chart-vendor': ['recharts'],
                    'markdown-vendor': ['marked', 'highlight.js'],
                    'search-vendor': ['fuse.js'], // Fuse.js 分离
                    // Clarity 延迟加载，不需要单独 chunk
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
                passes: 2, // 多次压缩，提高压缩率
            },
            mangle: {
                safari10: true, // 兼容 Safari 10
            },
        },
        // 启用 CSS 代码分割
        cssCodeSplit: true,
        // 资源压缩阈值 - 小于 4KB 的资源内联为 base64
        assetsInlineLimit: 4096,
        // 禁用 sourcemap 提高构建性能
        sourcemap: false,
        // 启用 CSS 压缩
        cssMinify: true,
        // 优化输出
        reportCompressedSize: false, // 禁用压缩大小报告，提高构建速度
    },
});
