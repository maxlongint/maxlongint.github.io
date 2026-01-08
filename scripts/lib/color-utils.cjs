/**
 * 颜色转换工具函数
 * 
 * 用于 GitHub Labels 颜色与网站标签颜色之间的转换
 * 
 * Property 3: Color Conversion Round-Trip
 * Property 4: Text Color Contrast
 * Validates: Requirements 2.2, 2.3, 7.3
 */

/**
 * 将十六进制颜色转换为 RGB
 * @param {string} hex - 十六进制颜色 (支持 "RRGGBB" 或 "#RRGGBB")
 * @returns {{ r: number, g: number, b: number }} RGB 值 (0-255)
 */
function hexToRGB(hex) {
    // 移除 # 前缀
    hex = hex.replace(/^#/, '');
    
    if (hex.length !== 6) {
        throw new Error(`Invalid hex color: ${hex}`);
    }
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        throw new Error(`Invalid hex color: ${hex}`);
    }
    
    return { r, g, b };
}

/**
 * 将 RGB 转换为十六进制颜色
 * @param {number} r - 红色 (0-255)
 * @param {number} g - 绿色 (0-255)
 * @param {number} b - 蓝色 (0-255)
 * @returns {string} 十六进制颜色 (不含 #)
 */
function rgbToHex(r, g, b) {
    const toHex = (n) => {
        const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * 将 RGB 转换为 HSL
 * @param {number} r - 红色 (0-255)
 * @param {number} g - 绿色 (0-255)
 * @param {number} b - 蓝色 (0-255)
 * @returns {{ h: number, s: number, l: number }} HSL 值 (h: 0-360, s: 0-100, l: 0-100)
 */
function rgbToHSL(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    
    let h = 0;
    let s = 0;
    
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }
    
    return {
        h: Math.round(h * 360 * 10) / 10,  // 保留一位小数
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

/**
 * 将 HSL 转换为 RGB
 * @param {number} h - 色相 (0-360)
 * @param {number} s - 饱和度 (0-100)
 * @param {number} l - 亮度 (0-100)
 * @returns {{ r: number, g: number, b: number }} RGB 值 (0-255)
 */
function hslToRGB(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;
    
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

/**
 * 将十六进制颜色转换为 HSL
 * @param {string} hex - 十六进制颜色 (支持 "RRGGBB" 或 "#RRGGBB")
 * @returns {{ h: number, s: number, l: number }} HSL 值
 */
function hexToHSL(hex) {
    const { r, g, b } = hexToRGB(hex);
    return rgbToHSL(r, g, b);
}

/**
 * 将 HSL 转换为十六进制颜色
 * @param {number} h - 色相 (0-360)
 * @param {number} s - 饱和度 (0-100)
 * @param {number} l - 亮度 (0-100)
 * @returns {string} 十六进制颜色 (不含 #)
 */
function hslToHex(h, s, l) {
    const { r, g, b } = hslToRGB(h, s, l);
    return rgbToHex(r, g, b);
}

/**
 * 解析 HSL 字符串
 * @param {string} hslString - HSL 字符串，如 "hsl(277.5, 45%, 82%)"
 * @returns {{ h: number, s: number, l: number }} HSL 值
 */
function parseHSL(hslString) {
    const match = hslString.match(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*\)/i);
    if (!match) {
        throw new Error(`Invalid HSL string: ${hslString}`);
    }
    return {
        h: parseFloat(match[1]),
        s: parseFloat(match[2]),
        l: parseFloat(match[3])
    };
}

/**
 * 格式化 HSL 为字符串
 * @param {number} h - 色相 (0-360)
 * @param {number} s - 饱和度 (0-100)
 * @param {number} l - 亮度 (0-100)
 * @returns {string} HSL 字符串，如 "hsl(277.5, 45%, 82%)"
 */
function formatHSL(h, s, l) {
    return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * 计算相对亮度 (用于对比度计算)
 * @param {number} r - 红色 (0-255)
 * @param {number} g - 绿色 (0-255)
 * @param {number} b - 蓝色 (0-255)
 * @returns {number} 相对亮度 (0-1)
 */
function getRelativeLuminance(r, g, b) {
    const sRGB = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * 计算两个颜色之间的对比度
 * @param {string} hex1 - 第一个颜色 (十六进制)
 * @param {string} hex2 - 第二个颜色 (十六进制)
 * @returns {number} 对比度 (1-21)
 */
function getContrastRatio(hex1, hex2) {
    const rgb1 = hexToRGB(hex1);
    const rgb2 = hexToRGB(hex2);
    
    const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 根据背景色计算合适的文字颜色
 * 确保对比度至少达到 WCAG AA 标准 (4.5:1)
 * @param {string} bgHex - 背景色 (十六进制)
 * @returns {string} 文字颜色 (十六进制，不含 #)
 */
function calculateTextColor(bgHex) {
    const bgRGB = hexToRGB(bgHex);
    const bgLuminance = getRelativeLuminance(bgRGB.r, bgRGB.g, bgRGB.b);
    const { h, s, l } = hexToHSL(bgHex);
    
    // 首先尝试使用同色系的深色或浅色
    let textL = l > 50 ? Math.max(15, l - 55) : Math.min(95, l + 55);
    let textS = Math.min(s + 20, 80);
    
    let textHex = hslToHex(h, textS, textL);
    let contrast = getContrastRatio(bgHex, textHex);
    let attempts = 0;
    
    // 尝试调整亮度来达到对比度要求
    while (contrast < 4.5 && attempts < 30) {
        if (bgLuminance > 0.179) {
            // 背景较亮，使用更暗的文字
            textL = Math.max(5, textL - 5);
        } else {
            // 背景较暗，使用更亮的文字
            textL = Math.min(98, textL + 5);
        }
        textHex = hslToHex(h, textS, textL);
        contrast = getContrastRatio(bgHex, textHex);
        attempts++;
    }
    
    // 如果同色系无法达到对比度，使用黑色或白色
    if (contrast < 4.5) {
        const whiteContrast = getContrastRatio(bgHex, 'ffffff');
        const blackContrast = getContrastRatio(bgHex, '000000');
        
        if (whiteContrast >= 4.5) {
            return 'ffffff';
        } else if (blackContrast >= 4.5) {
            return '000000';
        } else {
            // 极端情况：选择对比度更高的
            return whiteContrast > blackContrast ? 'ffffff' : '000000';
        }
    }
    
    return textHex;
}

/**
 * 将 GitHub Label 颜色转换为网站标签配置
 * @param {string} hex - GitHub Label 颜色 (6位十六进制，不含 #)
 * @returns {Object} 标签配置对象
 */
function hexToTagConfig(hex) {
    const { h, s, l } = hexToHSL(hex);
    const textHex = calculateTextColor(hex);
    const { h: textH, s: textS, l: textL } = hexToHSL(textHex);
    
    return {
        className: '',
        color: `#${hex}`,
        backgroundColor: formatHSL(h, s, l),
        textColor: formatHSL(textH, textS, textL)
    };
}

/**
 * 将网站标签配置转换为 GitHub Label 颜色
 * @param {Object} tagConfig - 标签配置对象
 * @returns {string} 十六进制颜色 (不含 #)
 */
function tagConfigToHex(tagConfig) {
    // 优先使用 color 字段
    if (tagConfig.color) {
        return tagConfig.color.replace(/^#/, '');
    }
    
    // 否则从 backgroundColor 解析
    if (tagConfig.backgroundColor) {
        const { h, s, l } = parseHSL(tagConfig.backgroundColor);
        return hslToHex(h, s, l);
    }
    
    throw new Error('Invalid tag config: missing color or backgroundColor');
}

module.exports = {
    hexToRGB,
    rgbToHex,
    rgbToHSL,
    hslToRGB,
    hexToHSL,
    hslToHex,
    parseHSL,
    formatHSL,
    getRelativeLuminance,
    getContrastRatio,
    calculateTextColor,
    hexToTagConfig,
    tagConfigToHex
};
