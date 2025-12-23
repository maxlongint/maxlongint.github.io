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
            console.log('Microsoft Clarity is disabled');
            return;
        }

        // 避免在开发环境重复初始化
        if (import.meta.env.DEV && (window as Window & { clarity?: unknown }).clarity) {
            console.log('Clarity already initialized');
            return;
        }

        try {
            clarity.init(projectId);
            console.log('Microsoft Clarity initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Microsoft Clarity:', error);
        }
    }, [projectId, enabled]);

    return null;
}
