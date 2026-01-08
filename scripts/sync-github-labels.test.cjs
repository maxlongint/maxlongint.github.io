/**
 * sync-github-labels.cjs 单元测试
 * 
 * Property 6: Sync Consistency
 * - 同步后本地标签应与 GitHub Labels 一致
 * - 保留 All 和 __meta__ 不变
 * - 正确检测被删除标签的使用情况
 * 
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4
 */

const { syncTags, formatBookmarksJson } = require('./sync-github-labels.cjs');

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

function assertDeepEqual(actual, expected, message = '') {
    const actualStr = JSON.stringify(actual, null, 2);
    const expectedStr = JSON.stringify(expected, null, 2);
    if (actualStr !== expectedStr) {
        throw new Error(`${message}\n   Expected: ${expectedStr}\n   Actual: ${actualStr}`);
    }
}

function assertArrayEqual(actual, expected, message = '') {
    if (actual.length !== expected.length) {
        throw new Error(`${message}\n   Array length mismatch: ${actual.length} vs ${expected.length}`);
    }
    const sortedActual = [...actual].sort();
    const sortedExpected = [...expected].sort();
    for (let i = 0; i < sortedActual.length; i++) {
        if (sortedActual[i] !== sortedExpected[i]) {
            throw new Error(`${message}\n   Expected: [${sortedExpected.join(', ')}]\n   Actual: [${sortedActual.join(', ')}]`);
        }
    }
}

function assertTrue(condition, message = '') {
    if (!condition) {
        throw new Error(message || 'Expected true but got false');
    }
}

function assertFalse(condition, message = '') {
    if (condition) {
        throw new Error(message || 'Expected false but got true');
    }
}

// 创建测试用的 bookmarks 数据
function createTestBookmarks(tags = {}, bookmarks = []) {
    return {
        tags: {
            All: { className: '', color: '#000', backgroundColor: '#fff', textColor: '#000' },
            __meta__: { totalTags: Object.keys(tags).length, lastUpdated: '2024-01-01' },
            ...tags
        },
        bookmarks: bookmarks
    };
}

// 创建测试用的 GitHub Labels
function createGitHubLabels(labels) {
    return labels.map(l => ({
        name: l.name,
        color: l.color || 'aabbcc',
        description: l.description || ''
    }));
}

console.log('\n🧪 sync-github-labels.cjs 单元测试\n');
console.log('=' .repeat(50));

// ============================================
// syncTags 函数测试
// ============================================

console.log('\n📦 syncTags 函数测试\n');

test('空标签同步 - 本地和远程都为空', () => {
    const bookmarks = createTestBookmarks();
    const labels = createGitHubLabels([]);
    
    const result = syncTags(bookmarks, labels);
    
    assertEqual(result.added.length, 0, '不应有新增');
    assertEqual(result.removed.length, 0, '不应有删除');
    assertEqual(result.updated.length, 0, '不应有更新');
});

test('新增标签 - 从 GitHub 添加新标签', () => {
    const bookmarks = createTestBookmarks();
    const labels = createGitHubLabels([
        { name: '分类:测试工具', color: 'aabbcc' },
        { name: '分类:UI组件', color: 'ddeeff' }
    ]);
    
    const result = syncTags(bookmarks, labels);
    
    assertEqual(result.added.length, 2, '应新增2个标签');
    assertArrayEqual(result.added, ['测试工具', 'UI组件'], '新增标签名称');
    assertTrue(bookmarks.tags['测试工具'] !== undefined, '测试工具标签应存在');
    assertTrue(bookmarks.tags['UI组件'] !== undefined, 'UI组件标签应存在');
});

test('删除标签 - 本地有但 GitHub 没有', () => {
    const bookmarks = createTestBookmarks({
        '旧标签': { color: '#aabbcc', backgroundColor: 'hsl(0,50%,90%)', textColor: 'hsl(0,50%,30%)' }
    });
    const labels = createGitHubLabels([]);
    
    const result = syncTags(bookmarks, labels);
    
    assertEqual(result.removed.length, 1, '应删除1个标签');
    assertArrayEqual(result.removed, ['旧标签'], '删除标签名称');
    assertTrue(bookmarks.tags['旧标签'] === undefined, '旧标签应被删除');
});

test('更新标签颜色 - GitHub 颜色变化', () => {
    const bookmarks = createTestBookmarks({
        '测试': { color: '#aabbcc', backgroundColor: 'hsl(0,50%,90%)', textColor: 'hsl(0,50%,30%)' }
    });
    const labels = createGitHubLabels([
        { name: '分类:测试', color: 'ddeeff' }
    ]);
    
    const result = syncTags(bookmarks, labels);
    
    assertEqual(result.updated.length, 1, '应更新1个标签');
    assertArrayEqual(result.updated, ['测试'], '更新标签名称');
    assertTrue(bookmarks.tags['测试'].color.toLowerCase().includes('ddeeff'), '颜色应更新');
});

test('颜色未变化 - 不应标记为更新', () => {
    const bookmarks = createTestBookmarks({
        '测试': { color: '#aabbcc', backgroundColor: 'hsl(0,50%,90%)', textColor: 'hsl(0,50%,30%)' }
    });
    const labels = createGitHubLabels([
        { name: '分类:测试', color: 'aabbcc' }
    ]);
    
    const result = syncTags(bookmarks, labels);
    
    assertEqual(result.updated.length, 0, '不应有更新');
    assertEqual(result.unchanged.length, 1, '应有1个未变化');
});

test('保留 All 标签 - 不应被删除', () => {
    const bookmarks = createTestBookmarks();
    const labels = createGitHubLabels([]);
    
    syncTags(bookmarks, labels);
    
    assertTrue(bookmarks.tags.All !== undefined, 'All 标签应保留');
});

test('保留 __meta__ - 不应被删除', () => {
    const bookmarks = createTestBookmarks();
    const labels = createGitHubLabels([]);
    
    syncTags(bookmarks, labels);
    
    assertTrue(bookmarks.tags.__meta__ !== undefined, '__meta__ 应保留');
});

test('更新 __meta__ 元数据', () => {
    const bookmarks = createTestBookmarks();
    const labels = createGitHubLabels([
        { name: '分类:新标签', color: 'aabbcc' }
    ]);
    
    syncTags(bookmarks, labels);
    
    assertEqual(bookmarks.tags.__meta__.totalTags, 1, '标签总数应为1');
    assertTrue(bookmarks.tags.__meta__.syncedFromGitHub === true, '应标记为从 GitHub 同步');
    assertTrue(bookmarks.tags.__meta__.lastUpdated !== undefined, '应有更新时间');
});

test('过滤非分类标签 - 系统标签不应同步', () => {
    const bookmarks = createTestBookmarks();
    const labels = createGitHubLabels([
        { name: '分类:测试', color: 'aabbcc' },
        { name: '待审核', color: 'ff0000' },
        { name: '已收录', color: '00ff00' },
        { name: 'bug', color: 'ff00ff' }
    ]);
    
    const result = syncTags(bookmarks, labels);
    
    assertEqual(result.added.length, 1, '只应新增1个分类标签');
    assertArrayEqual(result.added, ['测试'], '只有分类标签被添加');
});

test('检测被删除标签的使用情况 - 生成警告', () => {
    const bookmarks = createTestBookmarks(
        { '旧标签': { color: '#aabbcc', backgroundColor: 'hsl(0,50%,90%)', textColor: 'hsl(0,50%,30%)' } },
        [{ title: '测试库', url: 'https://github.com/test/test', tags: ['旧标签'] }]
    );
    const labels = createGitHubLabels([]);
    
    const result = syncTags(bookmarks, labels);
    
    assertEqual(result.warnings.length, 1, '应有1个警告');
    assertTrue(result.warnings[0].includes('旧标签'), '警告应包含标签名');
    assertTrue(result.warnings[0].includes('1'), '警告应包含使用数量');
});

test('删除未使用的标签 - 不生成警告', () => {
    const bookmarks = createTestBookmarks(
        { '未使用标签': { color: '#aabbcc', backgroundColor: 'hsl(0,50%,90%)', textColor: 'hsl(0,50%,30%)' } },
        [{ title: '测试库', url: 'https://github.com/test/test', tags: ['其他标签'] }]
    );
    const labels = createGitHubLabels([]);
    
    const result = syncTags(bookmarks, labels);
    
    assertEqual(result.warnings.length, 0, '不应有警告');
    assertEqual(result.removed.length, 1, '应删除1个标签');
});

test('复杂场景 - 同时新增、更新、删除', () => {
    const bookmarks = createTestBookmarks({
        '保留': { color: '#aabbcc', backgroundColor: 'hsl(0,50%,90%)', textColor: 'hsl(0,50%,30%)' },
        '更新': { color: '#111111', backgroundColor: 'hsl(0,50%,90%)', textColor: 'hsl(0,50%,30%)' },
        '删除': { color: '#333333', backgroundColor: 'hsl(0,50%,90%)', textColor: 'hsl(0,50%,30%)' }
    });
    const labels = createGitHubLabels([
        { name: '分类:保留', color: 'aabbcc' },
        { name: '分类:更新', color: '222222' },
        { name: '分类:新增', color: '444444' }
    ]);
    
    const result = syncTags(bookmarks, labels);
    
    assertEqual(result.unchanged.length, 1, '1个未变化');
    assertEqual(result.updated.length, 1, '1个更新');
    assertEqual(result.added.length, 1, '1个新增');
    assertEqual(result.removed.length, 1, '1个删除');
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
    assertFalse(result.includes('"tags": [\n'), 'tags 不应多行');
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

// ============================================
// Property 6: Sync Consistency 测试
// ============================================

console.log('\n📦 Property 6: Sync Consistency 测试\n');

test('同步一致性 - 多次同步结果相同', () => {
    const createFreshBookmarks = () => createTestBookmarks({
        '标签A': { color: '#aabbcc', backgroundColor: 'hsl(0,50%,90%)', textColor: 'hsl(0,50%,30%)' }
    });
    const labels = createGitHubLabels([
        { name: '分类:标签A', color: 'aabbcc' },
        { name: '分类:标签B', color: 'ddeeff' }
    ]);
    
    const bookmarks1 = createFreshBookmarks();
    const bookmarks2 = createFreshBookmarks();
    
    syncTags(bookmarks1, labels);
    syncTags(bookmarks2, labels);
    
    // 比较标签（排除时间戳）
    const tags1 = Object.keys(bookmarks1.tags).filter(k => k !== '__meta__').sort();
    const tags2 = Object.keys(bookmarks2.tags).filter(k => k !== '__meta__').sort();
    
    assertArrayEqual(tags1, tags2, '两次同步结果应相同');
});

test('同步一致性 - 连续同步无变化', () => {
    const bookmarks = createTestBookmarks();
    const labels = createGitHubLabels([
        { name: '分类:测试', color: 'aabbcc' }
    ]);
    
    // 第一次同步
    const result1 = syncTags(bookmarks, labels);
    assertEqual(result1.added.length, 1, '第一次应新增');
    
    // 第二次同步（相同数据）
    const result2 = syncTags(bookmarks, labels);
    assertEqual(result2.added.length, 0, '第二次不应新增');
    assertEqual(result2.unchanged.length, 1, '第二次应全部未变化');
});

test('同步一致性 - 颜色大小写不敏感', () => {
    const bookmarks = createTestBookmarks({
        '测试': { color: '#AABBCC', backgroundColor: 'hsl(0,50%,90%)', textColor: 'hsl(0,50%,30%)' }
    });
    const labels = createGitHubLabels([
        { name: '分类:测试', color: 'aabbcc' }
    ]);
    
    const result = syncTags(bookmarks, labels);
    
    assertEqual(result.updated.length, 0, '大小写不同不应触发更新');
    assertEqual(result.unchanged.length, 1, '应标记为未变化');
});

// ============================================
// 边界情况测试
// ============================================

console.log('\n📦 边界情况测试\n');

test('空书签数组', () => {
    const bookmarks = createTestBookmarks({}, []);
    const labels = createGitHubLabels([
        { name: '分类:测试', color: 'aabbcc' }
    ]);
    
    const result = syncTags(bookmarks, labels);
    
    assertEqual(result.added.length, 1, '应正常新增');
    assertEqual(result.warnings.length, 0, '不应有警告');
});

test('特殊字符标签名', () => {
    const bookmarks = createTestBookmarks();
    const labels = createGitHubLabels([
        { name: '分类:UI/UX', color: 'aabbcc' },
        { name: '分类:C++', color: 'bbccdd' },
        { name: '分类:Node.js', color: 'ccddee' }
    ]);
    
    const result = syncTags(bookmarks, labels);
    
    assertEqual(result.added.length, 3, '应新增3个特殊字符标签');
    assertTrue(bookmarks.tags['UI/UX'] !== undefined, 'UI/UX 标签应存在');
    assertTrue(bookmarks.tags['C++'] !== undefined, 'C++ 标签应存在');
    assertTrue(bookmarks.tags['Node.js'] !== undefined, 'Node.js 标签应存在');
});

test('中文标签名', () => {
    const bookmarks = createTestBookmarks();
    const labels = createGitHubLabels([
        { name: '分类:状态管理', color: 'aabbcc' },
        { name: '分类:数据可视化', color: 'bbccdd' }
    ]);
    
    const result = syncTags(bookmarks, labels);
    
    assertEqual(result.added.length, 2, '应新增2个中文标签');
    assertTrue(bookmarks.tags['状态管理'] !== undefined, '状态管理标签应存在');
    assertTrue(bookmarks.tags['数据可视化'] !== undefined, '数据可视化标签应存在');
});

test('颜色格式 - 带 # 前缀', () => {
    const bookmarks = createTestBookmarks({
        '测试': { color: '#aabbcc', backgroundColor: 'hsl(0,50%,90%)', textColor: 'hsl(0,50%,30%)' }
    });
    const labels = createGitHubLabels([
        { name: '分类:测试', color: 'aabbcc' }  // GitHub 返回不带 #
    ]);
    
    const result = syncTags(bookmarks, labels);
    
    assertEqual(result.updated.length, 0, '带/不带 # 应视为相同');
});

// ============================================
// 输出测试结果
// ============================================

console.log('\n' + '='.repeat(50));
console.log(`\n测试完成: ${passed} 通过, ${failed} 失败\n`);

if (failed > 0) {
    process.exit(1);
}
