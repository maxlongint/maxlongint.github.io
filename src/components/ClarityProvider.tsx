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

        try {
            clarity.init(projectId);
        } catch (error) {
            console.error('Failed to initialize Microsoft Clarity:', error);
        }
    }, [projectId, enabled]);

    return null;
}
