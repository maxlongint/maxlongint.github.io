import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 获取系统主题偏好
function getSystemTheme(): ResolvedTheme {
    if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        // 从 localStorage 读取主题，默认为 system
        try {
            const saved = localStorage.getItem('theme') as Theme | null;
            if (saved === 'dark' || saved === 'light' || saved === 'system') {
                return saved;
            }
            return 'system';
        } catch {
            return 'system';
        }
    });

    // resolvedTheme 需要根据初始 theme 值来计算
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
        try {
            const saved = localStorage.getItem('theme') as Theme | null;
            if (saved === 'light') return 'light';
            if (saved === 'dark') return 'dark';
            // system 或无保存值时，使用系统主题
            return getSystemTheme();
        } catch {
            return getSystemTheme();
        }
    });

    // 监听系统主题变化
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            if (theme === 'system') {
                setResolvedTheme(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    // 当 theme 改变时更新 resolvedTheme
    useEffect(() => {
        if (theme === 'system') {
            setResolvedTheme(getSystemTheme());
        } else {
            setResolvedTheme(theme);
        }
    }, [theme]);

    // 应用主题到 document.documentElement
    useEffect(() => {
        const root = document.documentElement;
        if (resolvedTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // 保存到 localStorage
        try {
            localStorage.setItem('theme', theme);
        } catch (error) {
            console.error('Failed to save theme to localStorage:', error);
        }
    }, [theme, resolvedTheme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    // 切换主题：light -> dark -> system -> light
    const toggleTheme = () => {
        setThemeState(prev => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'system';
            return 'light';
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
