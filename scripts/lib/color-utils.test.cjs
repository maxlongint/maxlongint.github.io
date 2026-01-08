/**
 * 颜色转换工具函数单元测试
 * 
 * Property 3: Color Conversion Round-Trip
 * Property 4: Text Color Contrast
 * Validates: Requirements 2.2, 2.3, 7.3
 */

const {
    hexToRGB,
    rgbToHex,
    rgbToHSL,
    hslToRGB,
    hexToHSL,
    hslToHex,
    parseHSL,
    formatHSL,
    getContrastRatio,
    calculateTextColor,
    hexToTagConfig,
    tagConfigToHex
} = require('./color-utils.cjs');

// 简单的测试框架
let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        passed++;
    } catch (error) {
        console.log(`❌ ${name}`);
        console.log(`   Error: ${error.message}`);
        failed++;
    }
}

function assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
        throw new Error(`${message} Expected ${expected}, got ${actual}`);
    }
}

function assertClose(actual, expected, tolerance = 1, message = '') {
    if (Math.abs(actual - expected) > tolerance) {
        throw new Error(`${message} Expected ${expected} ± ${tolerance}, got ${actual}`);
    }
}

function assertGreaterThan(actual, expected, message = '') {
    if (actual <= expected) {
        throw new Error(`${message} Expected > ${expected}, got ${actual}`);
    }
}

console.log('\n========== 颜色转换工具测试 ==========\n');

// ===== hexToRGB 测试 =====
console.log('--- hexToRGB ---');

test('hexToRGB: 纯红色', () => {
    const { r, g, b } = hexToRGB('ff0000');
    assertEqual(r, 255);
    assertEqual(g, 0);
    assertEqual(b, 0);
});

test('hexToRGB: 纯绿色', () => {
    const { r, g, b } = hexToRGB('00ff00');
    assertEqual(r, 0);
    assertEqual(g, 255);
    assertEqual(b, 0);
});

test('hexToRGB: 纯蓝色', () => {
    const { r, g, b } = hexToRGB('0000ff');
    assertEqual(r, 0);
    assertEqual(g, 0);
    assertEqual(b, 255);
});

test('hexToRGB: 带 # 前缀', () => {
    const { r, g, b } = hexToRGB('#ffffff');
    assertEqual(r, 255);
    assertEqual(g, 255);
    assertEqual(b, 255);
});

test('hexToRGB: 纯黑色', () => {
    const { r, g, b } = hexToRGB('000000');
    assertEqual(r, 0);
    assertEqual(g, 0);
    assertEqual(b, 0);
});

// ===== rgbToHex 测试 =====
console.log('\n--- rgbToHex ---');

test('rgbToHex: 纯红色', () => {
    assertEqual(rgbToHex(255, 0, 0), 'ff0000');
});

test('rgbToHex: 纯白色', () => {
    assertEqual(rgbToHex(255, 255, 255), 'ffffff');
});

test('rgbToHex: 纯黑色', () => {
    assertEqual(rgbToHex(0, 0, 0), '000000');
});

// ===== RGB <-> HSL 转换测试 =====
console.log('\n--- RGB <-> HSL ---');

test('rgbToHSL: 纯红色', () => {
    const { h, s, l } = rgbToHSL(255, 0, 0);
    assertEqual(h, 0);
    assertEqual(s, 100);
    assertEqual(l, 50);
});

test('rgbToHSL: 纯绿色', () => {
    const { h, s, l } = rgbToHSL(0, 255, 0);
    assertEqual(h, 120);
    assertEqual(s, 100);
    assertEqual(l, 50);
});

test('rgbToHSL: 纯蓝色', () => {
    const { h, s, l } = rgbToHSL(0, 0, 255);
    assertEqual(h, 240);
    assertEqual(s, 100);
    assertEqual(l, 50);
});

test('rgbToHSL: 灰色 (无饱和度)', () => {
    const { h, s, l } = rgbToHSL(128, 128, 128);
    assertEqual(s, 0);
    assertClose(l, 50, 1);
});

test('hslToRGB: 纯红色', () => {
    const { r, g, b } = hslToRGB(0, 100, 50);
    assertEqual(r, 255);
    assertEqual(g, 0);
    assertEqual(b, 0);
});

test('hslToRGB: 纯绿色', () => {
    const { r, g, b } = hslToRGB(120, 100, 50);
    assertEqual(r, 0);
    assertEqual(g, 255);
    assertEqual(b, 0);
});

// ===== Property 3: Color Conversion Round-Trip =====
console.log('\n--- Property 3: 颜色转换往返测试 ---');

const testColors = [
    'ff0000', '00ff00', '0000ff', 'ffffff', '000000',
    'd6bce6', 'f1bcd2', 'b0d1e8', 'b0e8c7', 'eeeed3',
    'e6c2bc', 'c8efdd', 'f1d4bc', 'bce6f1', 'f1bcdd'
];

for (const hex of testColors) {
    test(`Round-trip: ${hex}`, () => {
        const { h, s, l } = hexToHSL(hex);
        const result = hslToHex(h, s, l);
        
        // 由于舍入误差，允许每个通道有 ±2 的差异
        const original = hexToRGB(hex);
        const converted = hexToRGB(result);
        
        assertClose(converted.r, original.r, 2, 'R channel');
        assertClose(converted.g, original.g, 2, 'G channel');
        assertClose(converted.b, original.b, 2, 'B channel');
    });
}

// ===== parseHSL 和 formatHSL 测试 =====
console.log('\n--- parseHSL / formatHSL ---');

test('parseHSL: 标准格式', () => {
    const { h, s, l } = parseHSL('hsl(277.5, 45%, 82%)');
    assertEqual(h, 277.5);
    assertEqual(s, 45);
    assertEqual(l, 82);
});

test('formatHSL: 标准格式', () => {
    assertEqual(formatHSL(277.5, 45, 82), 'hsl(277.5, 45%, 82%)');
});

// ===== Property 4: Text Color Contrast =====
console.log('\n--- Property 4: 文字颜色对比度测试 ---');

const bgColors = [
    'd6bce6', 'f1bcd2', 'b0d1e8', 'b0e8c7', 'eeeed3',
    'ffffff', '000000', 'ff0000', '00ff00', '0000ff'
];

for (const bgHex of bgColors) {
    test(`Contrast ratio for bg #${bgHex} >= 4.5:1`, () => {
        const textHex = calculateTextColor(bgHex);
        const ratio = getContrastRatio(bgHex, textHex);
        assertGreaterThan(ratio, 4.5, `Contrast ratio: ${ratio.toFixed(2)}`);
    });
}

// ===== hexToTagConfig 和 tagConfigToHex 测试 =====
console.log('\n--- hexToTagConfig / tagConfigToHex ---');

test('hexToTagConfig: 生成有效配置', () => {
    const config = hexToTagConfig('d6bce6');
    assertEqual(config.color, '#d6bce6');
    assertEqual(config.className, '');
    if (!config.backgroundColor.startsWith('hsl(')) {
        throw new Error('backgroundColor should be HSL format');
    }
    if (!config.textColor.startsWith('hsl(')) {
        throw new Error('textColor should be HSL format');
    }
});

test('tagConfigToHex: 从 color 字段提取', () => {
    const config = { color: '#d6bce6', backgroundColor: 'hsl(277.5, 45%, 82%)' };
    assertEqual(tagConfigToHex(config), 'd6bce6');
});

test('tagConfigToHex: 从 backgroundColor 提取', () => {
    const config = { backgroundColor: 'hsl(0, 100%, 50%)' };
    const hex = tagConfigToHex(config);
    // 纯红色
    assertClose(hexToRGB(hex).r, 255, 2);
    assertClose(hexToRGB(hex).g, 0, 2);
    assertClose(hexToRGB(hex).b, 0, 2);
});

// ===== 测试结果汇总 =====
console.log('\n========================================');
console.log(`测试结果: ${passed} 通过, ${failed} 失败`);
console.log('========================================\n');

process.exit(failed > 0 ? 1 : 0);
