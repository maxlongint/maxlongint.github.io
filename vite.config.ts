import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        // 构建时复制 OG 图片到 dist
        {
            name: 'copy-og-images',
            closeBundle() {
                const sourceDir = path.resolve(__dirname, 'src/data/og-images');
                const targetDir = path.resolve(__dirname, 'dist/og-images');

                if (fs.existsSync(sourceDir)) {
                    // 确保目标目录存在
                    if (!fs.existsSync(targetDir)) {
                        fs.mkdirSync(targetDir, { recursive: true });
                    }

                    // 复制所有 PNG 文件
                    const files = fs.readdirSync(sourceDir);
                    files.forEach(file => {
                        if (file.endsWith('.png')) {
                            const source = path.join(sourceDir, file);
                            const target = path.join(targetDir, file);
                            fs.copyFileSync(source, target);
                        }
                    });
                    console.log(
                        `✓ Copied ${files.filter(f => f.endsWith('.png')).length} OG images to dist/og-images/`
                    );
                }
            },
        },
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        // 开发模式下将 /og-images 映射到 src/data/og-images
        proxy: {
            '/og-images': {
                target: 'http://localhost',
                configure: proxy => {
                    proxy.on('proxyReq', (proxyReq, req, res) => {
                        const filePath = path.resolve(__dirname, 'src/data' + req.url);
                        if (fs.existsSync(filePath)) {
                            res.writeHead(200, { 'Content-Type': 'image/png' });
                            fs.createReadStream(filePath).pipe(res);
                            // 阻止代理继续
                            proxyReq.destroy();
                        }
                    });
                },
            },
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
