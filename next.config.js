/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
    // 性能优化配置
    compress: true,
    poweredByHeader: false,
    generateEtags: true,
    // 静态资源优化
    assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
    // 实验性特性
    experimental: {
        scrollRestoration: true,
    },
    // 编译优化
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    // Webpack 优化
    webpack: (config, { dev, isServer }) => {
        if (!dev && !isServer) {
            // 生产环境下的优化
            config.optimization.splitChunks = {
                chunks: 'all',
                cacheGroups: {
                    default: {
                        minChunks: 1,
                        priority: -20,
                        reuseExistingChunk: true,
                    },
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        priority: -10,
                        chunks: 'all',
                    },
                },
            };
        }
        return config;
    },
};

module.exports = nextConfig;
