/**
 * 标签名称处理工具函数
 * 
 * 用于 GitHub Labels 名称与网站标签名称之间的转换
 * 
 * Property 2: Label Prefix Filtering
 * Property 5: Label Name Round-Trip
 * Validates: Requirements 1.2, 3.1, 7.2
 */

// 分类标签前缀
const CATEGORY_PREFIX = '分类:';

// 系统标签列表（不会被同步到网站）
const SYSTEM_LABELS = [
    '待审核',
    '收录通过',
    '已收录',
    '需要修改',
    '拒绝收录',
    '重复收录',
    '收录失败',
    '收录申请'
];

/**
 * 为标签名称添加分类前缀
 * @param {string} tagName - 标签名称（不含前缀）
 * @returns {string} 带前缀的标签名称
 */
function addPrefix(tagName) {
    if (!tagName || typeof tagName !== 'string') {
        throw new Error('Invalid tag name: must be a non-empty string');
    }
    
    const trimmed = tagName.trim();
    if (trimmed.length === 0) {
        throw new Error('Invalid tag name: cannot be empty or whitespace only');
    }
    
    // 如果已经有前缀，直接返回
    if (trimmed.startsWith(CATEGORY_PREFIX)) {
        return trimmed;
    }
    
    return `${CATEGORY_PREFIX}${trimmed}`;
}

/**
 * 从标签名称移除分类前缀
 * @param {string} labelName - 带前缀的标签名称
 * @returns {string} 不含前缀的标签名称
 */
function removePrefix(labelName) {
    if (!labelName || typeof labelName !== 'string') {
        throw new Error('Invalid label name: must be a non-empty string');
    }
    
    const trimmed = labelName.trim();
    
    if (trimmed.startsWith(CATEGORY_PREFIX)) {
        const result = trimmed.substring(CATEGORY_PREFIX.length).trim();
        if (result.length === 0) {
            throw new Error('Invalid label name: empty after removing prefix');
        }
        return result;
    }
    
    return trimmed;
}

/**
 * 检查标签名称是否有效
 * @param {string} name - 标签名称
 * @returns {boolean} 是否有效
 */
function isValidTagName(name) {
    if (!name || typeof name !== 'string') {
        return false;
    }
    
    const trimmed = name.trim();
    
    // 不能为空
    if (trimmed.length === 0) {
        return false;
    }
    
    // 不能只有前缀
    if (trimmed === CATEGORY_PREFIX || trimmed === CATEGORY_PREFIX.slice(0, -1)) {
        return false;
    }
    
    // 如果有前缀，去掉前缀后不能为空
    if (trimmed.startsWith(CATEGORY_PREFIX)) {
        const withoutPrefix = trimmed.substring(CATEGORY_PREFIX.length).trim();
        if (withoutPrefix.length === 0) {
            return false;
        }
    }
    
    return true;
}

/**
 * 检查是否是分类标签（以分类前缀开头）
 * @param {string} labelName - 标签名称
 * @returns {boolean} 是否是分类标签
 */
function isCategoryLabel(labelName) {
    if (!labelName || typeof labelName !== 'string') {
        return false;
    }
    return labelName.trim().startsWith(CATEGORY_PREFIX);
}

/**
 * 检查是否是系统标签
 * @param {string} labelName - 标签名称
 * @returns {boolean} 是否是系统标签
 */
function isSystemLabel(labelName) {
    if (!labelName || typeof labelName !== 'string') {
        return false;
    }
    return SYSTEM_LABELS.includes(labelName.trim());
}

/**
 * 从 GitHub Labels 列表中过滤出分类标签
 * @param {Array<{name: string}>} labels - GitHub Labels 列表
 * @returns {Array<{name: string}>} 分类标签列表
 */
function filterCategoryLabels(labels) {
    if (!Array.isArray(labels)) {
        return [];
    }
    
    return labels.filter(label => {
        if (!label || typeof label.name !== 'string') {
            return false;
        }
        return isCategoryLabel(label.name);
    });
}

/**
 * 从 GitHub Labels 列表中过滤出系统标签
 * @param {Array<{name: string}>} labels - GitHub Labels 列表
 * @returns {Array<{name: string}>} 系统标签列表
 */
function filterSystemLabels(labels) {
    if (!Array.isArray(labels)) {
        return [];
    }
    
    return labels.filter(label => {
        if (!label || typeof label.name !== 'string') {
            return false;
        }
        return isSystemLabel(label.name);
    });
}

/**
 * 将 GitHub Label 转换为网站标签名称
 * @param {string} labelName - GitHub Label 名称
 * @returns {string|null} 网站标签名称，如果不是分类标签则返回 null
 */
function labelToTagName(labelName) {
    if (!isCategoryLabel(labelName)) {
        return null;
    }
    
    try {
        return removePrefix(labelName);
    } catch (e) {
        return null;
    }
}

/**
 * 将网站标签名称转换为 GitHub Label 名称
 * @param {string} tagName - 网站标签名称
 * @returns {string} GitHub Label 名称
 */
function tagNameToLabel(tagName) {
    return addPrefix(tagName);
}

module.exports = {
    CATEGORY_PREFIX,
    SYSTEM_LABELS,
    addPrefix,
    removePrefix,
    isValidTagName,
    isCategoryLabel,
    isSystemLabel,
    filterCategoryLabels,
    filterSystemLabels,
    labelToTagName,
    tagNameToLabel
};
