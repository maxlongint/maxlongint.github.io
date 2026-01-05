# DeepSeek 鉴赏报告生成器使用指南

## 🚀 快速开始

### 1. 获取 DeepSeek API Key

访问 [DeepSeek 开放平台](https://platform.deepseek.com/) 注册并获取 API Key。

### 2. 设置环境变量

**Windows PowerShell:**

```powershell
$env:DEEPSEEK_API_KEY="your-api-key-here"
```

**Linux/Mac:**

```bash
export DEEPSEEK_API_KEY="your-api-key-here"
```

### 3. 运行脚本

```bash
# 使用 npm 命令
npm run generate-appreciates-deepseek -- --library "Axios"

# 或直接使用 node
node scripts/generate-appreciates-deepseek.js --library "Axios"
```

## 📖 使用方法

### 查看帮助信息

```bash
npm run generate-appreciates-deepseek -- --help
```

### 列出所有可用的库

```bash
npm run generate-appreciates-deepseek -- --list
```

### 为单个库生成报告

```bash
# 通过库名称生成
npm run generate-appreciates-deepseek -- --library "Axios"

# 库名称支持模糊匹配
npm run generate-appreciates-deepseek -- --library "lodash"
```

### 批量生成报告

```bash
# 为所有库生成报告
npm run generate-appreciates-deepseek -- --all

# 为指定范围的库生成报告（索引从0开始）
npm run generate-appreciates-deepseek -- --range 0 5
```

### 使用自定义提示词

```bash
# 使用自定义提示词文件
npm run generate-appreciates-deepseek -- --library "Axios" --prompt ./scripts/my-custom-prompt.txt

# 提示词文件可以是相对路径或绝对路径
npm run generate-appreciates-deepseek -- --all --prompt "D:\prompts\tech-review.txt"
```

### 自定义请求延迟

```bash
# 设置5秒延迟（默认3秒）
npm run generate-appreciates-deepseek -- --all --delay 5000
```

## 🎨 自定义提示词

### 提示词模板变量

在自定义提示词文件中，你可以使用以下占位符：

-   `{title}` - 库的名称
-   `{url}` - GitHub 仓库 URL
-   `{description}` - 库的描述
-   `{tags}` - 库的标签（逗号分隔）
-   `{owner/repo}` - GitHub 仓库的 owner/repo 格式

### 创建自定义提示词

1. 复制示例提示词文件：

    ```bash
    cp scripts/prompt-example.txt scripts/my-prompt.txt
    ```

2. 根据需求修改提示词内容

3. 使用自定义提示词运行：
    ```bash
    npm run generate-appreciates-deepseek -- --library "Axios" --prompt ./scripts/my-prompt.txt
    ```

### 提示词示例

参考文件：`scripts/prompt-example.txt`

你可以根据需要调整：

-   报告结构和章节
-   评分维度和标准
-   输出格式和风格
-   特殊要求和注意事项

## 📊 完整示例

### 示例 1：生成单个库的报告

```bash
# 设置 API Key（只需设置一次，在当前会话中有效）
$env:DEEPSEEK_API_KEY="sk-xxxxxxxxxxxxx"

# 生成 Axios 的鉴赏报告
npm run generate-appreciates-deepseek -- --library "Axios"
```

### 示例 2：批量生成前 10 个库的报告

```bash
npm run generate-appreciates-deepseek -- --range 0 9
```

### 示例 3：使用自定义提示词生成所有报告

```bash
npm run generate-appreciates-deepseek -- --all --prompt ./scripts/my-prompt.txt --delay 5000
```

## ⚙️ 配置说明

### API 配置

-   **模型**: `deepseek-chat` (默认)
-   **Temperature**: `0.7` (控制创造性，范围 0-1)
-   **Max Tokens**: `4000` (最大输出长度)

如需修改这些参数，请编辑 `scripts/generate-appreciates-deepseek.js` 文件中的 API 请求部分。

### 输出目录

生成的报告默认保存在：`public/appreciates/`

文件命名规则：`{repo-name}.md`（从 GitHub URL 中提取）

## 🔧 故障排除

### 问题 1：API Key 未设置

**错误信息**：`请设置 DEEPSEEK_API_KEY 环境变量`

**解决方案**：

```powershell
$env:DEEPSEEK_API_KEY="your-api-key-here"
```

### 问题 2：API 请求失败

**可能原因**：

-   API Key 无效
-   网络连接问题
-   API 配额不足

**解决方案**：

1. 检查 API Key 是否正确
2. 检查网络连接
3. 登录 DeepSeek 平台查看配额

### 问题 3：找不到指定的库

**错误信息**：`未找到名称包含 "xxx" 的库`

**解决方案**：

1. 使用 `--list` 查看所有可用的库
2. 确认库名称拼写正确
3. 库名称支持模糊匹配（不区分大小写）

### 问题 4：自定义提示词文件未生效

**解决方案**：

1. 检查文件路径是否正确
2. 确认文件编码为 UTF-8
3. 查看控制台输出是否显示"已加载自定义提示词"

## 💡 最佳实践

1. **批量生成时设置适当延迟**：避免触发 API 频率限制

    ```bash
    npm run generate-appreciates-deepseek -- --all --delay 5000
    ```

2. **先测试单个库**：在批量生成前先测试单个库，确保提示词和输出符合预期

3. **保存 API Key 到环境变量**：不要在脚本中硬编码 API Key

4. **自定义提示词**：根据项目需求调整提示词，获得更符合需求的报告

5. **定期检查输出**：批量生成时定期检查生成的报告质量

## 🆚 与 Gemini 版本对比

| 特性         | DeepSeek        | Gemini                 |
| ------------ | --------------- | ---------------------- |
| API Key 获取 | DeepSeek 平台   | Google AI Studio       |
| 模型名称     | `deepseek-chat` | `gemini-2.0-flash-exp` |
| 自定义提示词 | ✅ 支持         | ❌ 需修改代码          |
| 自定义延迟   | ✅ 支持         | ⚠️ 固定 3 秒           |
| 输出质量     | 专业技术分析    | 综合性分析             |
| 成本         | 按使用计费      | 有免费额度             |

## 📝 注意事项

1. DeepSeek API 为付费服务，请注意控制使用量
2. 批量生成时建议设置较长的延迟时间（5-10 秒）
3. 生成的报告仅供参考，需要结合实际情况判断
4. 自定义提示词时注意保留必要的占位符

## 🔗 相关链接

-   [DeepSeek 官网](https://www.deepseek.com/)
-   [DeepSeek 开放平台](https://platform.deepseek.com/)
-   [DeepSeek API 文档](https://platform.deepseek.com/api-docs/)
