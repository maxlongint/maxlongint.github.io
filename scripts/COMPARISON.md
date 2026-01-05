# DeepSeek vs Gemini 鉴赏报告生成器对比

## 📊 功能对比表

| 功能特性         | DeepSeek 版本          | Gemini 版本            |
| ---------------- | ---------------------- | ---------------------- |
| **基础生成功能** | ✅                     | ✅                     |
| 批量生成所有库   | ✅ `--all`             | ✅ `--all`             |
| 指定范围生成     | ✅ `--range 0 5`       | ✅ `--range 0 5`       |
| 单个库生成       | ✅ `--library "Axios"` | ✅ `--library "Axios"` |
| 列出所有库       | ✅ `--list`            | ✅ `--list`            |
| **高级功能**     |                        |                        |
| 自定义提示词     | ✅ `--prompt <文件>`   | ❌ 需修改代码          |
| 自定义延迟       | ✅ `--delay <毫秒>`    | ⚠️ 固定 3000ms         |
| 友好的帮助信息   | ✅                     | ✅                     |
| 错误处理         | ✅                     | ✅                     |
| 进度显示         | ✅                     | ✅                     |

## 🔑 API 配置对比

### DeepSeek

```javascript
// API 端点
https://api.deepseek.com/v1/chat/completions

// 模型
deepseek-chat

// 环境变量
DEEPSEEK_API_KEY

// API 参数
{
  temperature: 0.7,
  max_tokens: 4000
}
```

### Gemini

```javascript
// SDK
@google/generative-ai

// 模型
gemini-1.5-flash-latest
// (推荐: gemini-2.0-flash-exp)

// 环境变量
GEMINI_API_KEY

// API 参数
(由 SDK 自动管理)
```

## 💰 成本对比

### DeepSeek

-   **定价模式**：按 token 计费
-   **特点**：相对经济实惠，适合大量生成
-   **免费额度**：新用户有限额度
-   **获取方式**：[DeepSeek 平台](https://platform.deepseek.com/)

### Gemini

-   **定价模式**：免费额度 + 付费
-   **特点**：有较大的免费额度
-   **免费额度**：Google AI Studio 提供大量免费配额
-   **获取方式**：[Google AI Studio](https://ai.google.dev/)

## 📝 使用命令对比

### DeepSeek 版本

```bash
# 基础使用
npm run generate-appreciates-deepseek -- --library "Axios"

# 自定义提示词
npm run generate-appreciates-deepseek -- --library "Axios" --prompt ./my-prompt.txt

# 自定义延迟
npm run generate-appreciates-deepseek -- --all --delay 5000

# 批量生成
npm run generate-appreciates-deepseek -- --range 0 9 --delay 8000
```

### Gemini 版本

```bash
# 基础使用
npm run generate-appreciates -- --library "Axios"

# 批量生成（延迟固定为 3 秒）
npm run generate-appreciates -- --range 0 9

# 注意：不支持自定义提示词和延迟
```

## 🎯 适用场景

### 选择 DeepSeek 版本的场景

✅ 需要**自定义提示词**来调整报告风格和内容  
✅ 需要**灵活控制 API 调用频率**  
✅ 想要更**专业的技术分析**视角  
✅ 批量生成时需要**避免 API 限流**  
✅ 预算有限，寻找**性价比高**的方案

### 选择 Gemini 版本的场景

✅ 希望使用**免费额度**进行测试  
✅ 不需要自定义提示词，使用**默认模板**即可  
✅ 生成数量较少，不担心**API 限制**  
✅ 偏好使用 **Google 生态**的 AI 服务  
✅ 需要**更综合性**的分析视角

## 🚀 性能对比

### 生成速度

| 维度             | DeepSeek          | Gemini            |
| ---------------- | ----------------- | ----------------- |
| 单次请求时间     | ~3-5 秒           | ~2-4 秒           |
| 批量生成 10 个库 | ~50 秒（延迟 3s） | ~40 秒（固定 3s） |
| 自定义延迟后     | 可调节            | 固定              |

### 输出质量

两者输出质量都很高，但侧重点不同：

**DeepSeek**：

-   更专业的技术分析
-   更详细的代码层面讨论
-   适合技术决策参考

**Gemini**：

-   更全面的综合分析
-   更注重生态和社区
-   适合整体评估

## 📦 安装和配置

### DeepSeek 版本

```bash
# 1. 无需额外安装依赖（使用原生 fetch）
# 2. 设置环境变量
$env:DEEPSEEK_API_KEY="sk-your-api-key"

# 3. 运行
npm run generate-appreciates-deepseek -- --library "Axios"
```

### Gemini 版本

```bash
# 1. 已包含在项目依赖中
# @google/generative-ai

# 2. 设置环境变量
$env:GEMINI_API_KEY="your-api-key"

# 3. 运行
npm run generate-appreciates -- --library "Axios"
```

## 🔧 自定义能力对比

### DeepSeek - 高度可定制

```bash
# 可以完全自定义提示词
npm run generate-appreciates-deepseek -- --library "Axios" \
  --prompt ./scripts/custom-prompt.txt \
  --delay 5000
```

**示例自定义提示词场景**：

-   针对特定技术栈的分析（如 React 生态）
-   面向特定角色的报告（CTO、技术经理、开发者）
-   不同语言风格（正式、轻松、技术向）
-   特定关注点（安全性、性能、易用性）

### Gemini - 固定模板

```javascript
// 需要修改源代码来调整提示词
function generatePrompt(library) {
    return `你是一位资深的前端技术专家...`; // 固定在代码中
}
```

## 💡 最佳实践建议

### DeepSeek 版本最佳实践

1. **创建多个提示词模板**

    ```bash
    scripts/
    ├── prompt-technical.txt    # 技术深度分析
    ├── prompt-business.txt     # 商业价值分析
    ├── prompt-security.txt     # 安全性评估
    └── prompt-beginner.txt     # 新手友好版本
    ```

2. **批量生成时设置合理延迟**

    ```bash
    # 大量生成时使用 5-8 秒延迟
    npm run generate-appreciates-deepseek -- --all --delay 8000
    ```

3. **分批生成**
    ```bash
    # 分多次小批量生成，避免一次性消耗大量配额
    npm run generate-appreciates-deepseek -- --range 0 20 --delay 5000
    npm run generate-appreciates-deepseek -- --range 21 40 --delay 5000
    ```

### Gemini 版本最佳实践

1. **利用免费额度**
    - 优先使用 Gemini 测试和小量生成
2. **固定延迟已优化**

    - 3 秒延迟已经过测试，无需调整

3. **快速原型**
    - 适合快速生成原型报告

## 🔄 迁移指南

### 从 Gemini 迁移到 DeepSeek

```bash
# 1. 设置新的 API Key
$env:DEEPSEEK_API_KEY="sk-your-deepseek-key"

# 2. 使用新命令
npm run generate-appreciates-deepseek -- --library "Axios"

# 3. （可选）创建自定义提示词
cp scripts/prompt-example.txt scripts/my-prompt.txt
# 编辑 my-prompt.txt
npm run generate-appreciates-deepseek -- --library "Axios" --prompt ./scripts/my-prompt.txt
```

### 从 DeepSeek 迁移回 Gemini

```bash
# 1. 设置 Gemini API Key
$env:GEMINI_API_KEY="your-gemini-key"

# 2. 使用原命令
npm run generate-appreciates -- --library "Axios"

# 注意：自定义提示词将失效，需要修改源代码
```

## 📈 总结

### 选择 DeepSeek 如果你：

-   ✅ 需要灵活性和可定制性
-   ✅ 要批量生成大量报告
-   ✅ 想要精细控制生成过程
-   ✅ 需要不同风格的报告

### 选择 Gemini 如果你：

-   ✅ 想要快速上手
-   ✅ 生成量较小
-   ✅ 使用默认模板即可
-   ✅ 偏好 Google 生态

### 同时使用两者

你也可以同时使用两个版本：

-   **DeepSeek**：用于正式的技术报告和批量生成
-   **Gemini**：用于快速测试和原型验证

两个脚本互不干扰，可以根据需求灵活选择！
