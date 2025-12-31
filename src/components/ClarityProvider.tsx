import { useEffect } from 'react';

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

        // 延迟加载 Clarity，等待用户交互或页面空闲时加载
        const initClarity = async () => {
            try {
                // 动态导入 Clarity，只在需要时加载
                const { default: clarity } = await import('@microsoft/clarity');
                clarity.init(projectId);
            } catch {
                // 静默失败，不影响主功能
            }
        };

        // 使用 requestIdleCallback 在浏览器空闲时加载，降低对性能的影响
        if ('requestIdleCallback' in window) {
            const idleCallback = requestIdleCallback(
                () => {
                    setTimeout(initClarity, 5000); // 空闲后再等待5秒
                },
                { timeout: 10000 }
            );
            return () => cancelIdleCallback(idleCallback);
        } else {
            // 降级方案：页面加载完成后延迟加载
            const timer = setTimeout(initClarity, 8000);
            return () => clearTimeout(timer);
        }
    }, [projectId, enabled]);

    return null;
}
