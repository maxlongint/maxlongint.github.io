'use client';

import { useEffect } from 'react';

export default function PerformanceMonitor() {
    useEffect(() => {
        // 只在生产环境启用性能监控
        if (process.env.NODE_ENV !== 'production') return;

        // Web Vitals 监控
        const reportWebVitals = (metric: any) => {
            // 可以发送到分析服务
            console.log('Web Vital:', metric);
        };

        // Core Web Vitals
        const observer = new PerformanceObserver(list => {
            list.getEntries().forEach(entry => {
                if (entry.entryType === 'largest-contentful-paint') {
                    reportWebVitals({
                        name: 'LCP',
                        value: entry.startTime,
                        id: 'lcp',
                    });
                }
                if (entry.entryType === 'first-input') {
                    reportWebVitals({
                        name: 'FID',
                        value: (entry as any).processingStart - entry.startTime,
                        id: 'fid',
                    });
                }
                if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
                    reportWebVitals({
                        name: 'CLS',
                        value: (entry as any).value,
                        id: 'cls',
                    });
                }
            });
        });

        // 监控不同类型的性能指标
        try {
            observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
        } catch (e) {
            // 浏览器不支持时的兜底处理
            console.log('Performance Observer not supported');
        }

        // 页面加载完成时的性能指标
        const measurePageLoad = () => {
            if ('performance' in window && 'getEntriesByType' in window.performance) {
                const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

                if (navigation) {
                    const metrics = {
                        // DNS 查询时间
                        dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
                        // TCP 连接时间
                        tcpConnect: navigation.connectEnd - navigation.connectStart,
                        // 服务器响应时间
                        serverResponse: navigation.responseStart - navigation.requestStart,
                        // DOM 解析时间
                        domParse: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                        // 页面完全加载时间
                        pageLoad: navigation.loadEventEnd - navigation.loadEventStart,
                        // 总时间
                        totalTime: navigation.loadEventEnd - navigation.fetchStart,
                    };

                    console.log('Page Performance Metrics:', metrics);
                }
            }
        };

        // 页面加载完成后测量
        if (document.readyState === 'complete') {
            measurePageLoad();
        } else {
            window.addEventListener('load', measurePageLoad);
        }

        return () => {
            observer.disconnect();
            window.removeEventListener('load', measurePageLoad);
        };
    }, []);

    return null;
}
