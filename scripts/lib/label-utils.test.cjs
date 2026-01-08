/**
 * 标签名称处理工具函数单元测试
 * 
 * Property 2: Label Prefix Filtering
 * Property 5: Label Name Round-Trip
 * Validates: Requirements 1.2, 3.1, 7.2
 */

const {
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
} = require('./label-utils.cjs');

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
        throw new Error(`${message} Expected "${expected}", got "${actual}"`);
    }
}

function assertArrayEqual(actual, expected, message = '') {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`${message} Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
}

function assertTrue(value, message = '') {
    if (!value) {
        throw new Error(`${message} Expected true, got ${value}`);
    }
}

function assertFalse(value, message = '') {
    if (value) {
        throw new Error(`${message} Expected false, got ${value}`);
    }
}

function assertThrows(fn, message = '') {
    try {
        fn();
        throw new Error(`${message} Expected function to throw`);
    } catch (e) {
        if (e.message.includes('Expected function to throw')) {
            throw e;
        }
        // 预期的异常，测试通过
    }
}

console.log('\n========== 标签名称处理工具测试 ==========\n');

// ===== addPrefix 测试 =====
console.log('--- addPrefix ---');

test('addPrefix: 普通标签名', () => {
    assertEqual(addPrefix('动画效果'), '分类:动画效果');
});

test('addPrefix: 英文标签名', () => {
    assertEqual(addPrefix('CSS框架'), '分类:CSS框架');
});

test('addPrefix: 已有前缀不重复添加', () => {
    assertEqual(addPrefix('分类:动画效果'), '分类:动画效果');
});

test('addPrefix: 空字符串抛出异常', () => {
    assertThrows(() => addPrefix(''));
});

test('addPrefix: null 抛出异常', () => {
    assertThrows(() => addPrefix(null));
});

test('addPrefix: 纯空格抛出异常', () => {
    assertThrows(() => addPrefix('   '));
});

// ===== removePrefix 测试 =====
console.log('\n--- removePrefix ---');

test('removePrefix: 移除前缀', () => {
    assertEqual(removePrefix('分类:动画效果'), '动画效果');
});

test('removePrefix: 无前缀保持不变', () => {
    assertEqual(removePrefix('动画效果'), '动画效果');
});

test('removePrefix: 只有前缀抛出异常', () => {
    assertThrows(() => removePrefix('分类:'));
});

test('removePrefix: 空字符串抛出异常', () => {
    assertThrows(() => removePrefix(''));
});

// ===== Property 5: Label Name Round-Trip =====
console.log('\n--- Property 5: 标签名称往返测试 ---');

const testTagNames = [
    '动画效果',
    '数据校验',
    'CSS框架',
    '图表可视化',
    '富文本编辑',
    '代码编辑',
    '视频播放',
    '文件上传',
    '网络请求',
    '实时协作'
];

for (const tagName of testTagNames) {
    test(`Round-trip: ${tagName}`, () => {
        const withPrefix = addPrefix(tagName);
        const withoutPrefix = removePrefix(withPrefix);
        assertEqual(withoutPrefix, tagName);
    });
}

// ===== isValidTagName 测试 =====
console.log('\n--- isValidTagName ---');

test('isValidTagName: 有效标签名', () => {
    assertTrue(isValidTagName('动画效果'));
});

test('isValidTagName: 带前缀的有效标签名', () => {
    assertTrue(isValidTagName('分类:动画效果'));
});

test('isValidTagName: 空字符串无效', () => {
    assertFalse(isValidTagName(''));
});

test('isValidTagName: null 无效', () => {
    assertFalse(isValidTagName(null));
});

test('isValidTagName: 只有前缀无效', () => {
    assertFalse(isValidTagName('分类:'));
});

// ===== isCategoryLabel / isSystemLabel 测试 =====
console.log('\n--- isCategoryLabel / isSystemLabel ---');

test('isCategoryLabel: 分类标签返回 true', () => {
    assertTrue(isCategoryLabel('分类:动画效果'));
});

test('isCategoryLabel: 系统标签返回 false', () => {
    assertFalse(isCategoryLabel('待审核'));
});

test('isSystemLabel: 系统标签返回 true', () => {
    assertTrue(isSystemLabel('待审核'));
    assertTrue(isSystemLabel('已收录'));
    assertTrue(isSystemLabel('收录通过'));
});

test('isSystemLabel: 分类标签返回 false', () => {
    assertFalse(isSystemLabel('分类:动画效果'));
});

// ===== Property 2: Label Prefix Filtering =====
console.log('\n--- Property 2: 标签前缀过滤测试 ---');

test('filterCategoryLabels: 只返回分类标签', () => {
    const labels = [
        { name: '分类:动画效果', color: 'd6bce6' },
        { name: '待审核', color: 'FFA500' },
        { name: '分类:数据校验', color: 'f1bcd2' },
        { name: '已收录', color: '8B5CF6' },
        { name: '分类:CSS框架', color: 'dbbcf1' }
    ];
    
    const result = filterCategoryLabels(labels);
    assertEqual(result.length, 3);
    assertTrue(result.every(l => l.name.startsWith('分类:')));
});

test('filterCategoryLabels: 空数组返回空数组', () => {
    assertArrayEqual(filterCategoryLabels([]), []);
});

test('filterCategoryLabels: 无分类标签返回空数组', () => {
    const labels = [
        { name: '待审核', color: 'FFA500' },
        { name: '已收录', color: '8B5CF6' }
    ];
    assertArrayEqual(filterCategoryLabels(labels), []);
});

test('filterSystemLabels: 只返回系统标签', () => {
    const labels = [
        { name: '分类:动画效果', color: 'd6bce6' },
        { name: '待审核', color: 'FFA500' },
        { name: '分类:数据校验', color: 'f1bcd2' },
        { name: '已收录', color: '8B5CF6' }
    ];
    
    const result = filterSystemLabels(labels);
    assertEqual(result.length, 2);
    assertTrue(result.every(l => SYSTEM_LABELS.includes(l.name)));
});

// ===== labelToTagName / tagNameToLabel 测试 =====
console.log('\n--- labelToTagName / tagNameToLabel ---');

test('labelToTagName: 转换分类标签', () => {
    assertEqual(labelToTagName('分类:动画效果'), '动画效果');
});

test('labelToTagName: 非分类标签返回 null', () => {
    assertEqual(labelToTagName('待审核'), null);
});

test('tagNameToLabel: 转换标签名', () => {
    assertEqual(tagNameToLabel('动画效果'), '分类:动画效果');
});

// ===== 边界情况测试 =====
console.log('\n--- 边界情况 ---');

test('处理带空格的标签名', () => {
    assertEqual(addPrefix('  动画效果  '), '分类:动画效果');
});

test('处理中英文混合标签名', () => {
    const tagName = 'CSS框架';
    const withPrefix = addPrefix(tagName);
    const withoutPrefix = removePrefix(withPrefix);
    assertEqual(withoutPrefix, tagName);
});

test('处理特殊字符标签名', () => {
    const tagName = 'JSON编辑';
    const withPrefix = addPrefix(tagName);
    assertEqual(withPrefix, '分类:JSON编辑');
});

// ===== 测试结果汇总 =====
console.log('\n========================================');
console.log(`测试结果: ${passed} 通过, ${failed} 失败`);
console.log('========================================\n');

process.exit(failed > 0 ? 1 : 0);
