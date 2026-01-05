# DeepSeek 鉴赏报告生成器 - 快速开始

## 📦 功能特性

✅ **批量生成**：支持为所有库批量生成鉴赏报告  
✅ **单个生成**：支持为指定库生成报告  
✅ **范围生成**：支持为指定索引范围的库生成报告  
✅ **自定义提示词**：支持使用自定义提示词模板  
✅ **可配置延迟**：支持自定义 API 请求延迟时间  
✅ **友好提示**：详细的错误提示和进度显示

## 🚀 三步开始

### 1️⃣ 获取 API Key

访问 [DeepSeek 平台](https://platform.deepseek.com/) 注册并获取 API Key

### 2️⃣ 设置环境变量

```powershell
# Windows PowerShell
$env:DEEPSEEK_API_KEY="sk-your-api-key-here"
```

```bash
# Linux/Mac
export DEEPSEEK_API_KEY="sk-your-api-key-here"
```

### 3️⃣ 运行脚本

```bash
# 为单个库生成报告
npm run generate-appreciates-deepseek -- --library "Axios"

# 为所有库生成报告
npm run generate-appreciates-deepseek -- --all
```

## 📝 常用命令

### 查看帮助

```bash
npm run generate-appreciates-deepseek -- --help
```

### 列出所有库

```bash
npm run generate-appreciates-deepseek -- --list
```

### 单个库生成

```bash
npm run generate-appreciates-deepseek -- --library "lodash"
```

### 范围生成

```bash
# 生成索引 0-5 的库
npm run generate-appreciates-deepseek -- --range 0 5
```

### 使用自定义提示词

```bash
npm run generate-appreciates-deepseek -- --library "Axios" --prompt ./scripts/my-prompt.txt
```

### 自定义延迟

```bash
npm run generate-appreciates-deepseek -- --all --delay 5000
```

## 🎨 自定义提示词

### 步骤 1：创建提示词文件

复制示例文件：

```bash
cp scripts/prompt-example.txt scripts/my-prompt.txt
```

### 步骤 2：编辑提示词

可用占位符：

-   `{title}` - 库名称
-   `{url}` - GitHub URL
-   `{description}` - 库描述
-   `{tags}` - 标签列表
-   `{owner/repo}` - 仓库完整路径

### 步骤 3：使用自定义提示词

```bash
npm run generate-appreciates-deepseek -- --library "Axios" --prompt ./scripts/my-prompt.txt
```

## 📂 输出文件

生成的报告保存在：

```
public/appreciates/{repo-name}.md
```

例如：

-   `public/appreciates/axios.md`
-   `public/appreciates/lodash.md`

## ⚙️ 配置参数

| 参数                    | 说明               | 默认值     |
| ----------------------- | ------------------ | ---------- |
| `--all`                 | 为所有库生成报告   | -          |
| `--range <start> <end>` | 为指定范围生成报告 | -          |
| `--library <名称>`      | 为指定库生成报告   | -          |
| `--list`                | 列出所有可用的库   | -          |
| `--prompt <文件>`       | 自定义提示词文件   | 默认提示词 |
| `--delay <毫秒>`        | API 请求延迟       | 3000ms     |

## 💡 使用建议

1. **先测试单个库**：批量生成前先测试单个库确保效果
2. **设置合理延迟**：批量生成时设置 5-10 秒延迟避免限流
3. **检查 API 配额**：注意 DeepSeek API 的使用配额
4. **自定义提示词**：根据需求调整提示词获得更好效果

## 🔍 完整示例

### 示例 1：生成 Axios 的报告

```bash
# 设置 API Key
$env:DEEPSEEK_API_KEY="sk-xxxxx"

# 生成报告
npm run generate-appreciates-deepseek -- --library "Axios"
```

### 示例 2：批量生成前 10 个库

```bash
npm run generate-appreciates-deepseek -- --range 0 9 --delay 5000
```

### 示例 3：使用自定义提示词生成所有报告

```bash
npm run generate-appreciates-deepseek -- --all --prompt ./scripts/my-prompt.txt --delay 8000
```

## ❓ 常见问题

### Q: API Key 无效？

A: 检查 API Key 是否正确设置：

```powershell
echo $env:DEEPSEEK_API_KEY
```

### Q: 找不到指定的库？

A: 使用 `--list` 查看所有可用库，库名称支持模糊匹配

### Q: API 请求失败？

A: 可能原因：

-   网络连接问题
-   API 配额不足
-   API Key 无效

### Q: 自定义提示词不生效？

A: 检查：

-   文件路径是否正确
-   文件编码是否为 UTF-8
-   控制台是否显示"已加载自定义提示词"

## 📚 更多文档

详细文档请查看：[README-deepseek.md](./README-deepseek.md)

## 🔗 相关链接

-   [DeepSeek 官网](https://www.deepseek.com/)
-   [DeepSeek 开放平台](https://platform.deepseek.com/)
-   [DeepSeek API 文档](https://platform.deepseek.com/api-docs/)
