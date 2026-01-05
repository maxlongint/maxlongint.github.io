import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取书签数据
const bookmarksPath = path.join(__dirname, '../src/data/bookmarks.json');
const bookmarksData = JSON.parse(fs.readFileSync(bookmarksPath, 'utf-8'));

// 输出目录
const OUTPUT_DIR = path.join(__dirname, '../public/appreciates');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * 默认提示词模板
 */
const DEFAULT_PROMPT_TEMPLATE = `你是一位资深的前端技术专家和开源项目评审员。请对以下 JavaScript/TypeScript 库进行深度技术尽职调查，并生成一份专业的鉴赏报告。

## 库信息
- **名称**: {title}
- **仓库**: {url}
- **描述**: {description}
- **标签**: {tags}

## 报告要求
请按照以下结构生成 Markdown 格式的报告：

### 1. 项目速览 (Executive Summary)
用一句话概括该库的核心价值和当前状态（50字以内）。

### 2. 深度审计详情 (Deep Dive)

#### 2.1 架构设计与代码质量 (Architecture & Code Quality)
- 架构模式和设计理念
- 代码风格和技术选型
- 亮点 (Pros) - 至少列举2点
- 改进点/缺陷 (Cons) - 至少列举2点

#### 2.2 文档与开发者体验 (Documentation & DX)
- 文档质量评估
- API 设计易用性
- 亮点和改进点

#### 2.3 工程化与规范 (Engineering Standards)
- 测试覆盖情况
- CI/CD 配置
- 构建工具和代码规范
- 亮点和改进点

#### 2.4 维护状态与社区健康度 (Maintenance & Health)
- GitHub 活跃度
- Issue 和 PR 响应情况
- 版本发布频率
- 亮点和改进点

#### 2.5 创新性与价值 (Innovation & Value)
- 解决的核心痛点
- 与同类库的对比优势
- 亮点和改进点

### 3. 评分表 (Scorecard)
对以上5个维度分别打分（满分20分），并给出简评。使用 Markdown 表格格式。

### 4. 最终裁决 (Final Verdict)
- 总分（满分100分）
- 评级（S+/S/A+/A/B+/B/C）
- 结论性评价
- 适用场景推荐
- 风险提示

## 注意事项
1. 报告应客观、专业，既要指出优点，也要指出不足
2. 使用 Markdown 格式，包含适当的 emoji 提升可读性
3. 评分要基于实际表现，避免主观臆断
4. 如果无法获取 GitHub 实时数据，基于一般经验给出合理推测
5. 报告标题格式为: # 🔍 技术尽职调查报告: {owner/repo}

请生成完整的鉴赏报告：`;

/**
 * 读取自定义提示词文件
 */
function loadCustomPrompt(promptFile) {
    try {
        if (!promptFile) return DEFAULT_PROMPT_TEMPLATE;

        const promptPath = path.isAbsolute(promptFile) ? promptFile : path.join(process.cwd(), promptFile);

        if (!fs.existsSync(promptPath)) {
            console.warn(`⚠️  提示词文件不存在: ${promptPath}，使用默认提示词`);
            return DEFAULT_PROMPT_TEMPLATE;
        }

        const content = fs.readFileSync(promptPath, 'utf-8');
        console.log(`✅ 已加载自定义提示词: ${promptPath}`);
        return content;
    } catch (error) {
        console.warn(`⚠️  读取提示词文件失败: ${error.message}，使用默认提示词`);
        return DEFAULT_PROMPT_TEMPLATE;
    }
}

/**
 * 生成鉴赏报告的提示词
 */
function generatePrompt(library, promptTemplate) {
    return promptTemplate
        .replace('{title}', library.title)
        .replace('{url}', library.url)
        .replace('{description}', library.description)
        .replace('{tags}', library.tags.join(', '))
        .replace('{owner/repo}', library.url.match(/github\.com\/([^\/]+\/[^\/\?#]+)/)?.[1] || library.title);
}

/**
 * 从 GitHub URL 提取库名称（用于文件命名）
 * 将点号替换为横杠
 */
function getLibraryFileName(url) {
    const match = url.match(/github\.com\/[^\/]+\/([^\/\?#]+)/);
    let fileName = '';
    if (match) {
        fileName = match[1].toLowerCase();
    } else {
        fileName = url.split('/').pop().toLowerCase();
    }
    // 将点号替换为横杠
    return fileName.replace(/\./g, '-');
}

/**
 * 调用 DeepSeek API 生成鉴赏报告
 */
async function generateAppreciate(library, promptTemplate) {
    try {
        console.log(`\n🤖 正在为 "${library.title}" 生成鉴赏报告...`);

        // 检查 API Key
        const API_KEY = process.env.DEEPSEEK_API_KEY;
        if (!API_KEY) {
            throw new Error('请设置 DEEPSEEK_API_KEY 环境变量');
        }

        const prompt = generatePrompt(library, promptTemplate);

        // 调用 DeepSeek API
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 4000,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API 请求失败: ${response.status} ${response.statusText}\n${errorText}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;

        if (!text) {
            throw new Error('API 返回的内容为空');
        }

        // 保存到文件
        const fileName = getLibraryFileName(library.url);
        const filePath = path.join(OUTPUT_DIR, `${fileName}.md`);

        fs.writeFileSync(filePath, text, 'utf-8');

        console.log(`✅ 已生成: ${filePath}`);
        return { success: true, fileName, filePath };
    } catch (error) {
        console.error(`❌ 生成失败: ${library.title}`);
        console.error(`   错误: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * 主函数
 */
async function main() {
    const args = process.argv.slice(2);

    // 显示使用说明
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
📝 库鉴赏报告生成工具 (DeepSeek 版本)

用法:
  node scripts/generate-appreciates-deepseek.js [选项]

选项:
  --all                         为所有库生成鉴赏报告
  --missing                     仅为未生成报告的库生成报告
  --range <start> <end>         为指定范围内的库生成报告（索引从0开始）
  --library <名称>              为指定库生成报告（匹配 title 字段）
  --list                        列出所有可用的库
  --list-missing                列出所有未生成报告的库
  --prompt <文件路径>           指定自定义提示词文件（支持相对/绝对路径）
  --delay <毫秒>                设置请求延迟（默认3000ms）
  -h, --help                    显示此帮助信息

示例:
  node scripts/generate-appreciates-deepseek.js --all
  node scripts/generate-appreciates-deepseek.js --missing
  node scripts/generate-appreciates-deepseek.js --range 0 5
  node scripts/generate-appreciates-deepseek.js --library "JSZip"
  node scripts/generate-appreciates-deepseek.js --list
  node scripts/generate-appreciates-deepseek.js --list-missing
  node scripts/generate-appreciates-deepseek.js --library "Axios" --prompt ./my-prompt.txt
  node scripts/generate-appreciates-deepseek.js --all --delay 5000

环境变量:
  DEEPSEEK_API_KEY              DeepSeek API Key（必需）
  
获取 API Key:
  访问 https://platform.deepseek.com/ 注册并获取 API Key
  
设置环境变量:
  Windows PowerShell: $env:DEEPSEEK_API_KEY="your-api-key"
  Linux/Mac: export DEEPSEEK_API_KEY="your-api-key"
        `);
        return;
    }

    // 列出所有库
    if (args.includes('--list')) {
        console.log('\n📚 可用的库列表:\n');
        bookmarksData.bookmarks.forEach((lib, index) => {
            const fileName = getLibraryFileName(lib.url);
            const filePath = path.join(OUTPUT_DIR, `${fileName}.md`);
            const exists = fs.existsSync(filePath) ? '✅' : '❌';
            console.log(`  [${index}] ${exists} ${lib.title}`);
            console.log(`      ${lib.url}`);
        });
        console.log(`\n共 ${bookmarksData.bookmarks.length} 个库`);
        return;
    }

    // 列出未生成报告的库
    if (args.includes('--list-missing')) {
        console.log('\n📚 未生成报告的库列表:\n');
        const missingLibs = [];
        bookmarksData.bookmarks.forEach((lib, index) => {
            const fileName = getLibraryFileName(lib.url);
            const filePath = path.join(OUTPUT_DIR, `${fileName}.md`);
            if (!fs.existsSync(filePath)) {
                missingLibs.push({ index, lib });
                console.log(`  [${index}] ${lib.title}`);
                console.log(`      ${lib.url}`);
            }
        });
        console.log(`\n共 ${missingLibs.length} 个库未生成报告`);
        return;
    }

    // 解析自定义提示词
    const promptIndex = args.indexOf('--prompt');
    const promptFile = promptIndex !== -1 ? args[promptIndex + 1] : null;
    const promptTemplate = loadCustomPrompt(promptFile);

    // 解析延迟时间
    const delayIndex = args.indexOf('--delay');
    const delay = delayIndex !== -1 ? parseInt(args[delayIndex + 1]) : 3000;
    if (isNaN(delay) || delay < 0) {
        console.error('❌ 错误: --delay 参数必须是非负整数');
        return;
    }

    let librariesToProcess = [];

    // 处理所有库
    if (args.includes('--all')) {
        librariesToProcess = bookmarksData.bookmarks;
        console.log(`\n🚀 将为全部 ${librariesToProcess.length} 个库生成鉴赏报告`);
    }
    // 仅处理未生成报告的库
    else if (args.includes('--missing')) {
        librariesToProcess = bookmarksData.bookmarks.filter(lib => {
            const fileName = getLibraryFileName(lib.url);
            const filePath = path.join(OUTPUT_DIR, `${fileName}.md`);
            return !fs.existsSync(filePath);
        });
        console.log(`\n🚀 将为 ${librariesToProcess.length} 个未生成报告的库生成鉴赏报告`);
        if (librariesToProcess.length === 0) {
            console.log('\n✅ 所有库都已生成报告！');
            return;
        }
    }
    // 处理指定范围
    else if (args.includes('--range')) {
        const rangeIndex = args.indexOf('--range');
        const start = parseInt(args[rangeIndex + 1]);
        const end = parseInt(args[rangeIndex + 2]);

        if (isNaN(start) || isNaN(end)) {
            console.error('❌ 错误: --range 参数必须是数字');
            return;
        }

        librariesToProcess = bookmarksData.bookmarks.slice(start, end + 1);
        console.log(`\n🚀 将为索引 ${start}-${end} 的 ${librariesToProcess.length} 个库生成鉴赏报告`);
    }
    // 处理指定库
    else if (args.includes('--library')) {
        const libraryIndex = args.indexOf('--library');
        const libraryName = args[libraryIndex + 1];

        if (!libraryName) {
            console.error('❌ 错误: --library 参数必须提供库名称');
            return;
        }

        const found = bookmarksData.bookmarks.find(lib => lib.title.toLowerCase().includes(libraryName.toLowerCase()));

        if (!found) {
            console.error(`❌ 错误: 未找到名称包含 "${libraryName}" 的库`);
            return;
        }

        librariesToProcess = [found];
        console.log(`\n🚀 将为 "${found.title}" 生成鉴赏报告`);
    }
    // 默认：显示帮助
    else {
        console.log('❌ 错误: 请指定操作选项');
        console.log('   使用 --help 查看帮助信息');
        return;
    }

    // 开始生成
    console.log(`\n⏰ 开始时间: ${new Date().toLocaleString('zh-CN')}`);
    console.log('━'.repeat(60));

    const results = {
        success: [],
        failed: [],
    };

    for (let i = 0; i < librariesToProcess.length; i++) {
        const library = librariesToProcess[i];
        const result = await generateAppreciate(library, promptTemplate);

        if (result.success) {
            results.success.push(library.title);
        } else {
            results.failed.push({ title: library.title, error: result.error });
        }

        // 避免 API 频率限制，每次请求后延迟
        if (i < librariesToProcess.length - 1) {
            console.log(`⏳ 等待 ${delay / 1000} 秒...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    // 输出统计
    console.log('\n' + '━'.repeat(60));
    console.log('📊 生成统计:');
    console.log(`   ✅ 成功: ${results.success.length}`);
    console.log(`   ❌ 失败: ${results.failed.length}`);

    if (results.failed.length > 0) {
        console.log('\n失败列表:');
        results.failed.forEach(item => {
            console.log(`   - ${item.title}: ${item.error}`);
        });
    }

    console.log(`\n⏰ 完成时间: ${new Date().toLocaleString('zh-CN')}`);
    console.log(`\n📁 输出目录: ${OUTPUT_DIR}`);
}

// 运行主函数
main().catch(error => {
    console.error('💥 程序异常:', error);
    process.exit(1);
});
