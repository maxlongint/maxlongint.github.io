import { useEffect } from 'react';
import clarity from '@microsoft/clarity';

interface ClarityProviderProps {
    projectId: string;
    enabled?: boolean;
}

export default function ClarityProvider({ projectId, enabled = true }: ClarityProviderProps) {
    useEffect(() => {
        // 只在启用且有 projectId 时初始化
        if (!enabled || !projectId) {
            return;
        }

        // 避免在开发环境重复初始化
        if (import.meta.env.DEV && (window as Window & { clarity?: unknown }).clarity) {
            return;
        }

        // 延迟加载 Clarity，避免阻塞主线程
        const timer = setTimeout(() => {
            try {
                clarity.init(projectId);
            } catch (error) {
                console.error('Failed to initialize Microsoft Clarity:', error);
            }
        }, 2000); // 延迟2秒加载分析脚本

        return () => clearTimeout(timer);
    }, [projectId, enabled]);

    return null;
}
