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
    },
});
