// 收藏管理工具函数

const FAVORITES_KEY = 'bookmarks_favorites';

/**
 * 获取所有收藏的工具标题
 */
export function getFavorites(): string[] {
    try {
        const favorites = localStorage.getItem(FAVORITES_KEY);
        return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
        console.error('Failed to get favorites:', error);
        return [];
    }
}

/**
 * 检查工具是否已收藏
 */
export function isFavorite(title: string): boolean {
    const favorites = getFavorites();
    return favorites.includes(title);
}

/**
 * 添加到收藏
 */
export function addFavorite(title: string): void {
    try {
        const favorites = getFavorites();
        if (!favorites.includes(title)) {
            favorites.push(title);
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
            // 触发自定义事件，通知其他组件收藏状态变化
            window.dispatchEvent(new CustomEvent('favorites-changed'));
        }
    } catch (error) {
        console.error('Failed to add favorite:', error);
    }
}

/**
 * 从收藏中移除
 */
export function removeFavorite(title: string): void {
    try {
        const favorites = getFavorites();
        const index = favorites.indexOf(title);
        if (index > -1) {
            favorites.splice(index, 1);
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
            // 触发自定义事件，通知其他组件收藏状态变化
            window.dispatchEvent(new CustomEvent('favorites-changed'));
        }
    } catch (error) {
        console.error('Failed to remove favorite:', error);
    }
}

/**
 * 切换收藏状态
 */
export function toggleFavorite(title: string): boolean {
    const isCurrentlyFavorite = isFavorite(title);
    if (isCurrentlyFavorite) {
        removeFavorite(title);
    } else {
        addFavorite(title);
    }
    return !isCurrentlyFavorite;
}

/**
 * 获取收藏数量
 */
export function getFavoritesCount(): number {
    return getFavorites().length;
}
