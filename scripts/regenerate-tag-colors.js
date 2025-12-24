import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取 bookmarks.json
const bookmarksPath = path.join(__dirname, '../src/data/bookmarks.json');
const bookmarksData = JSON.parse(fs.readFileSync(bookmarksPath, 'utf8'));

// 动态生成颜色：使用 HSL 色彩空间，从浅色到深色渐变
function generateTagColor(index) {
    // 使用黄金角度 (137.5度) 确保颜色分布均匀
    const goldenAngle = 137.5;
    const hue = (index * goldenAngle) % 360;

    // 饱和度：45-65% 之间，避免过于鲜艳
    const saturation = 45 + (index % 3) * 10;

    // 亮度：从浅到深渐变，但避免太深
    // 范围：78-88%，保持在浅色区间
    const lightnessBase = 88;
    const lightnessStep = 2;
    const maxSteps = 6; // 最多6个深度级别
    const lightness = lightnessBase - (index % maxSteps) * lightnessStep;

    // 生成 HSL 颜色
    const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    const textLightness = Math.max(20, lightness - 50); // 文字颜色更深
    const textColor = `hsl(${hue}, ${Math.min(saturation + 20, 80)}%, ${textLightness}%)`;

    // 转换为十六进制颜色（用于 color 字段）
    const hexColor = hslToHex(hue, saturation, lightness);

    return {
        className: '', // Tailwind className 不再使用，改用内联样式
        color: hexColor,
        backgroundColor: backgroundColor,
        textColor: textColor,
        hsl: { hue, saturation, lightness },
    };
}

// HSL 转 HEX
function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
    }

    const toHex = num => {
        const hex = Math.round((num + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

console.log('🎨 开始重新生成所有标签颜色...\n');

// 收集所有标签（排除 "All"）
const allTagNames = Object.keys(bookmarksData.tags).filter(tag => tag !== 'All');

console.log(`📊 共找到 ${allTagNames.length} 个标签\n`);

// 重新生成颜色
const newTags = {
    All: bookmarksData.tags.All, // 保持 "All" 不变
};

allTagNames.forEach((tagName, index) => {
    const colorInfo = generateTagColor(index);
    newTags[tagName] = {
        className: colorInfo.className,
        color: colorInfo.color,
        backgroundColor: colorInfo.backgroundColor,
        textColor: colorInfo.textColor,
    };

    console.log(`✅ [${index + 1}/${allTagNames.length}] ${tagName}`);
    console.log(
        `   色相: ${Math.round(colorInfo.hsl.hue)}° | 亮度: ${colorInfo.hsl.lightness}% | 饱和度: ${
            colorInfo.hsl.saturation
        }%`
    );
    console.log(`   背景: ${colorInfo.backgroundColor}`);
    console.log(`   文字: ${colorInfo.textColor}`);
    console.log(`   Hex: ${colorInfo.color}\n`);
});

// 保存最后一个颜色的索引到元数据
newTags.__meta__ = {
    lastColorIndex: allTagNames.length - 1,
    totalTags: allTagNames.length,
    generatedAt: new Date().toISOString(),
};

// 更新 bookmarks.json
bookmarksData.tags = newTags;

// 写回文件
fs.writeFileSync(bookmarksPath, JSON.stringify(bookmarksData, null, 4), 'utf8');

console.log('✅ 颜色重新生成完成！');
console.log(`📝 已更新 ${allTagNames.length} 个标签`);
console.log(`📍 最后颜色索引: ${newTags.__meta__.lastColorIndex}`);
console.log(`💾 已保存到: ${bookmarksPath}`);
