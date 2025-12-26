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

        // 避免重复初始化（全局只初始化一次）
        if ((window as Window & { clarity?: unknown }).clarity) {
            return;
        }

        // 等待页面完全加载后再初始化 Clarity
        const initClarity = () => {
            try {
                clarity.init(projectId);
                console.log('Clarity initialized');
            } catch (error) {
                console.error('Failed to initialize Microsoft Clarity:', error);
            }
        };

        // 如果页面已经加载完成，立即初始化
        if (document.readyState === 'complete') {
            setTimeout(initClarity, 3000); // 页面加载完成后再等待3秒
        } else {
            // 否则等待 load 事件
            const handleLoad = () => {
                setTimeout(initClarity, 3000); // 页面加载完成后再等待3秒
            };
            window.addEventListener('load', handleLoad);
            return () => window.removeEventListener('load', handleLoad);
        }
    }, [projectId, enabled]);

    return null;
}
