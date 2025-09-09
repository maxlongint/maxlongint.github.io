'use client';

import { useEffect } from 'react';
import clarity from '@microsoft/clarity';

export default function ClarityProvider() {
    useEffect(() => {
        const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
        const isProduction = process.env.NODE_ENV === 'production';
        const isDevelopment = process.env.NODE_ENV === 'development';
        const enableInDev = process.env.NEXT_PUBLIC_CLARITY_ENABLE_DEV === 'true';

        // 生产环境下默认启用，开发环境下需要明确设置
        const shouldEnable = isProduction || (isDevelopment && enableInDev);

        if (!shouldEnable) {
            console.log(
                'Microsoft Clarity disabled in development. Set NEXT_PUBLIC_CLARITY_ENABLE_DEV=true to enable.'
            );
            return;
        }

        if (!clarityProjectId) {
            console.warn(
                'Microsoft Clarity project ID not found. Please set NEXT_PUBLIC_CLARITY_PROJECT_ID environment variable.'
            );
            return;
        }

        // 检查项目 ID 格式是否有效（通常是 10 个字符的字母数字组合）
        if (!/^[a-zA-Z0-9]{10}$/.test(clarityProjectId)) {
            console.warn(
                `Microsoft Clarity project ID format may be invalid: ${clarityProjectId}. Expected 10 alphanumeric characters.`
            );
        }

        // 添加网络状态检查
        if (!navigator.onLine) {
            console.warn('Network is offline, skipping Microsoft Clarity initialization.');
            return;
        }

        try {
            // 初始化 Clarity
            clarity.init(clarityProjectId);
            console.log(
                `Microsoft Clarity initialized successfully in ${
                    isProduction ? 'production' : 'development'
                } mode with project ID:`,
                clarityProjectId
            );
        } catch (error) {
            console.error('Failed to initialize Microsoft Clarity:', error);
            console.info('This might be due to network issues, ad blockers, or invalid project ID.');
        }
    }, []);

    return null;
}
