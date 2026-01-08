/**
 * parse-and-merge-issue.cjs 单元测试
 * 
 * Property 7: Color Generation Determinism
 * Property 8: Tag Validation Consistency
 * 
 * Validates: Requirements 6.1, 6.3
 */

const { parseIssueBody, formatBookmarksJson, generateTagColor } = require('./parse-and-merge-issue.cjs');

// 测试计数器
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
        throw new Error(`${message}\n   Expected: ${expected}\n   Actual: ${actual}`);
    }
}

function assertArrayEqual(actual, expected, message = '') {
    if (actual.length !== expected.length) {
        throw new Error(`${message}\n   Array length mismatch: ${actual.length} vs ${expected.length}`);
    }
    for (let i = 0; i < actual.length; i++) {
        if (actual[i] !== expected[i]) {
            throw new Error(`${message}\n   Expected: [${expected.join(', ')}]\n   Actual: [${actual.join(', ')}]`);
        }
    }
}

function assertTrue(condition, message = '') {
    if (!condition) {
        throw new Error(message || 'Expected true but got false');
    }
}

console.log('\n🧪 parse-and-merge-issue.cjs 单元测试\n');
console.log('=' .repeat(50));

// ============================================
// parseIssueBody 函数测试
// ============================================

console.log('\n📦 parseIssueBody 函数测试\n');

test('解析完整的 Issue 正文', () => {
    const body = `**工具名称:** TestLib
**GitHub 仓库地址:** https://github.com/test/testlib
**npm 地址:** https://www.npmjs.com/package/testlib

### 描述

这是一个测试库的描述。

### 标签

测试工具, UI组件

---`;

    const result = parseIssueBody(body);
    
    assertEqual(result.toolName, 'TestLib', '工具名称');
    assertEqual(result.githubUrl, 'https://github.com/test/testlib', 'GitHub URL');
    assertEqual(result.npmUrl, 'https://www.npmjs.com/package/testlib', 'npm URL');
    assertEqual(result.description, '这是一个测试库的描述。', '描述');
    assertArrayEqual(result.tags, ['测试工具', 'UI组件'], '标签');
});

test('解析没有 npm 地址的 Issue', () => {
    const body = `**工具名称:** TestLib
**GitHub 仓库地址:** https://github.com/test/testlib

### 描述

测试描述

### 标签

工具

---`;

    const result = parseIssueBody(body);
    
    assertEqual(result.toolName, 'TestLib', '工具名称');
    assertEqual(result.githubUrl, 'https://github.com/test/testlib', 'GitHub URL');
    assertEqual(result.npmUrl, '', 'npm URL 应为空');
});

test('解析中文逗号分隔的标签', () => {
    const body = `**工具名称:** Test
**GitHub 仓库地址:** https://github.com/test/test

### 描述

描述

### 标签

标签一，标签二，标签三

---`;

    const result = parseIssueBody(body);
    
    assertArrayEqual(result.tags, ['标签一', '标签二', '标签三'], '中文逗号分隔');
});

test('解析英文逗号分隔的标签', () => {
    const body = `**工具名称:** Test
**GitHub 仓库地址:** https://github.com/test/test

### 描述

描述

### 标签

tag1, tag2, tag3

---`;

    const result = parseIssueBody(body);
    
    assertArrayEqual(result.tags, ['tag1', 'tag2', 'tag3'], '英文逗号分隔');
});

test('自动添加 https 前缀', () => {
    const body = `**工具名称:** Test
**GitHub 仓库地址:** github.com/test/test

### 描述

描述

### 标签

标签

---`;

    const result = parseIssueBody(body);
    
    assertEqual(result.githubUrl, 'https://github.com/test/test', '应自动添加 https');
});

// ============================================
// Property 7: Color Generation Determinism 测试
// ============================================

console.log('\n📦 Property 7: Color Generation Determinism 测试\n');

test('相同索引生成相同颜色', () => {
    const color1 = generateTagColor(0);
    const color2 = generateTagColor(0);
    
    assertEqual(color1.color, color2.color, '颜色应相同');
    assertEqual(color1.backgroundColor, color2.backgroundColor, '背景色应相同');
    assertEqual(color1.textColor, color2.textColor, '文字颜色应相同');
});

test('不同索引生成不同颜色', () => {
    const color1 = generateTagColor(0);
    const color2 = generateTagColor(1);
    const color3 = generateTagColor(2);
    
    assertTrue(color1.color !== color2.color, '索引0和1颜色应不同');
    assertTrue(color2.color !== color3.color, '索引1和2颜色应不同');
    assertTrue(color1.color !== color3.color, '索引0和2颜色应不同');
});

test('颜色格式正确 - hex 格式', () => {
    const color = generateTagColor(5);
    
    assertTrue(/^#[0-9a-f]{6}$/i.test(color.color), `颜色应为 hex 格式: ${color.color}`);
});

test('颜色格式正确 - hsl 格式', () => {
    const color = generateTagColor(5);
    
    assertTrue(color.backgroundColor.startsWith('hsl('), `背景色应为 hsl 格式: ${color.backgroundColor}`);
    assertTrue(color.textColor.startsWith('hsl('), `文字颜色应为 hsl 格式: ${color.textColor}`);
});

test('大量索引不会产生重复颜色', () => {
    const colors = new Set();
    
    for (let i = 0; i < 50; i++) {
        const color = generateTagColor(i);
        colors.add(color.color);
    }
    
    // 允许少量重复（因为颜色空间有限）
    assertTrue(colors.size >= 40, `50个索引应产生至少40种不同颜色，实际: ${colors.size}`);
});

test('颜色亮度在合理范围内', () => {
    for (let i = 0; i < 20; i++) {
        const color = generateTagColor(i);
        
        // 提取 HSL 中的亮度值
        const bgMatch = color.backgroundColor.match(/hsl\(\d+,\s*\d+%,\s*(\d+)%\)/);
        const textMatch = color.textColor.match(/hsl\(\d+,\s*\d+%,\s*(\d+)%\)/);
        
        if (bgMatch) {
            const bgLightness = parseInt(bgMatch[1]);
            assertTrue(bgLightness >= 70 && bgLightness <= 95, 
                `背景亮度应在70-95%之间: ${bgLightness}%`);
        }
        
        if (textMatch) {
            const textLightness = parseInt(textMatch[1]);
            assertTrue(textLightness >= 15 && textLightness <= 50, 
                `文字亮度应在15-50%之间: ${textLightness}%`);
        }
    }
});

// ============================================
// formatBookmarksJson 函数测试
// ============================================

console.log('\n📦 formatBookmarksJson 函数测试\n');

test('tags 数组格式化为单行', () => {
    const data = {
        bookmarks: [
            { title: 'Test', tags: ['tag1', 'tag2', 'tag3'] }
        ]
    };
    
    const result = formatBookmarksJson(data);
    
    assertTrue(result.includes('"tags": ["tag1", "tag2", "tag3"]'), 'tags 应在单行');
});

test('保持 4 空格缩进', () => {
    const data = {
        bookmarks: [
            { title: 'Test' }
        ]
    };
    
    const result = formatBookmarksJson(data);
    
    assertTrue(result.includes('    "bookmarks"'), '应使用4空格缩进');
});

test('addedDate 保持格式', () => {
    const data = {
        bookmarks: [
            { title: 'Test', addedDate: '2024-01-15' }
        ]
    };
    
    const result = formatBookmarksJson(data);
    
    assertTrue(result.includes('"addedDate": "2024-01-15"'), 'addedDate 格式正确');
});

test('复杂数据结构格式化', () => {
    const data = {
        tags: {
            All: { color: '#000' },
            __meta__: { totalTags: 2 },
            '测试': { color: '#aabbcc', backgroundColor: 'hsl(0,50%,90%)', textColor: 'hsl(0,50%,30%)' }
        },
        bookmarks: [
            { 
                title: 'Test', 
                url: 'https://github.com/test/test',
                description: '描述',
                tags: ['测试'],
                addedDate: '2024-01-15'
            }
        ]
    };
    
    const result = formatBookmarksJson(data);
    
    // 验证是有效的 JSON
    const parsed = JSON.parse(result);
    assertEqual(parsed.bookmarks[0].title, 'Test', '解析后数据正确');
    assertArrayEqual(parsed.bookmarks[0].tags, ['测试'], '标签数据正确');
});

// ============================================
// Property 8: Tag Validation Consistency 测试
// ============================================

console.log('\n📦 Property 8: Tag Validation Consistency 测试\n');

test('标签解析一致性 - 多次解析相同结果', () => {
    const body = `**工具名称:** Test
**GitHub 仓库地址:** https://github.com/test/test

### 描述

描述

### 标签

标签A, 标签B

---`;

    const result1 = parseIssueBody(body);
    const result2 = parseIssueBody(body);
    
    assertArrayEqual(result1.tags, result2.tags, '多次解析应得到相同标签');
});

test('标签去除空白', () => {
    const body = `**工具名称:** Test
**GitHub 仓库地址:** https://github.com/test/test

### 描述

描述

### 标签

  标签A  ,   标签B  

---`;

    const result = parseIssueBody(body);
    
    assertArrayEqual(result.tags, ['标签A', '标签B'], '标签应去除首尾空白');
});

test('过滤空标签', () => {
    const body = `**工具名称:** Test
**GitHub 仓库地址:** https://github.com/test/test

### 描述

描述

### 标签

标签A, , 标签B, ,

---`;

    const result = parseIssueBody(body);
    
    // 空标签应被过滤
    assertTrue(!result.tags.includes(''), '不应包含空标签');
    assertTrue(result.tags.length >= 2, '应至少有2个有效标签');
});

// ============================================
// 边界情况测试
// ============================================

console.log('\n📦 边界情况测试\n');

test('空 Issue 正文', () => {
    const result = parseIssueBody('');
    
    assertEqual(result.toolName, '', '工具名称应为空');
    assertEqual(result.githubUrl, '', 'GitHub URL 应为空');
    assertArrayEqual(result.tags, [], '标签应为空数组');
});

test('只有部分字段的 Issue', () => {
    const body = `**工具名称:** TestOnly`;
    
    const result = parseIssueBody(body);
    
    assertEqual(result.toolName, 'TestOnly', '工具名称');
    assertEqual(result.githubUrl, '', 'GitHub URL 应为空');
});

test('特殊字符标签', () => {
    const body = `**工具名称:** Test
**GitHub 仓库地址:** https://github.com/test/test

### 描述

描述

### 标签

C++, Node.js, UI/UX

---`;

    const result = parseIssueBody(body);
    
    assertTrue(result.tags.includes('C++'), '应包含 C++');
    assertTrue(result.tags.includes('Node.js'), '应包含 Node.js');
    assertTrue(result.tags.includes('UI/UX'), '应包含 UI/UX');
});

test('颜色索引为负数', () => {
    // 不应抛出错误
    const color = generateTagColor(-1);
    assertTrue(color.color !== undefined, '应返回有效颜色');
});

test('颜色索引为大数', () => {
    const color = generateTagColor(1000);
    assertTrue(/^#[0-9a-f]{6}$/i.test(color.color), '大索引应返回有效颜色');
});

// ============================================
// 输出测试结果
// ============================================

console.log('\n' + '='.repeat(50));
console.log(`\n测试完成: ${passed} 通过, ${failed} 失败\n`);

if (failed > 0) {
    process.exit(1);
}
