# maxlongint.github.io

一个基于 Next.js 构建的静态书签网站，专注于前端开发工具与资源的收集与展示。简洁、高效的界面让你轻松浏览、分类和访问各类前端利器。

## ✨ 特性

-   📚 **书签展示**: 清晰展示从 JSON 文件加载的书签数据
-   🏷️ **分类管理**: 支持按类别组织书签，便于查找
-   📱 **响应式设计**: 使用 Tailwind CSS 实现多设备完美适配
-   ⚡ **静态生成**: 基于 Next.js SSG，加载速度快
-   🎨 **现代 UI**: 简洁美观的用户界面
-   🔧 **易于维护**: 书签数据集中管理，更新方便

## 🛠️ 技术栈

-   **前端框架**: React 19.1.1 + Next.js 15.5.2
-   **类型检查**: TypeScript 5.9.2
-   **样式**: Tailwind CSS 3.4.17
-   **构建工具**: Next.js 内置构建工具
-   **包管理**: npm

## 📦 安装

确保你已安装 Node.js 18.x 或更高版本。

```bash
# 克隆项目
git clone https://github.com/maxlongint/maxlongint.github.io.git
cd maxlongint.github.io

# 安装依赖
npm install
```

## 🚀 使用

### 开发环境

```bash
# 启动开发服务器
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 查看效果。

### 构建

```bash
# 构建生产版本（自动禁用 Clarity）
npm run build

# 构建生产版本（自动启用 Clarity）
npm run build:prod

# Windows 系统下构建生产版本（自动启用 Clarity）
npm run build:prod:win

# 启动生产服务器
npm run start
```

### 静态导出

```bash
# 生成静态文件
npm run build
npm run export
```

静态文件将生成在 `out` 目录中。

### 代码检查

```bash
# 运行 ESLint
npm run lint
```

## 📝 配置书签

编辑 `src/data/bookmarks.json` 文件来管理你的书签：

```json
{
    "categories": [
        {
            "name": "开发工具",
            "bookmarks": [
                {
                    "title": "GitHub",
                    "url": "https://github.com",
                    "description": "代码托管平台"
                }
            ]
        }
    ]
}
```

## 📊 分析配置

### Microsoft Clarity

项目已集成 Microsoft Clarity 用于网站分析。要启用 Clarity 分析：

1. 访问 [Microsoft Clarity](https://clarity.microsoft.com/) 注册账号
2. 创建新项目并获取项目 ID
3. 创建 `.env.local` 文件并添加配置：

```bash
# Microsoft Clarity 项目 ID
NEXT_PUBLIC_CLARITY_PROJECT_ID=your_clarity_project_id_here

# 在开发环境中启用 Clarity（可选）
NEXT_PUBLIC_CLARITY_ENABLE_DEV=true
```

4. 重启开发服务器，Clarity 将自动开始收集数据

#### 常见问题解决

**网络连接错误** (`net::ERR_CONNECTION_CLOSED`)：

-   检查网络连接是否正常
-   确认防火墙或代理设置未阻止 `clarity.ms` 域名
-   检查浏览器广告屏蔽插件是否阻止了 Clarity
-   验证项目 ID 是否正确（应为 10 位字母数字组合）
-   在开发环境下可以设置 `NEXT_PUBLIC_CLARITY_ENABLE_DEV=false` 禁用 Clarity

**自动部署配置**：

-   GitHub Actions 自动部署时会自动启用 Microsoft Clarity
-   本地构建生产版本时使用 `npm run build:prod` 命令
-   生产环境下 Clarity 会自动启用，无需手动配置

**注意**: 环境变量名必须以 `NEXT_PUBLIC_` 开头才能在客户端使用。

## 📁 项目结构

```
├── src/
│   ├── app/
│   │   ├── globals.css      # 全局样式
│   │   ├── layout.tsx       # 页面布局
│   │   └── page.tsx         # 首页组件
│   └── data/
│       └── bookmarks.json   # 书签数据
├── DEPLOYMENT.md            # 部署说明
├── next.config.js           # Next.js 配置
├── package.json             # 项目依赖
├── tailwind.config.ts       # Tailwind 配置
└── tsconfig.json           # TypeScript 配置
```

## 🚀 部署

本项目支持多种部署方式：

### GitHub Pages

项目已配置 GitHub Actions 自动部署。只需推送代码到 `main` 分支即可自动构建和部署。

详细部署说明请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)。

### 其他平台

-   **Vercel**: 直接连接 GitHub 仓库，自动部署
-   **Netlify**: 上传 `out` 目录或连接 Git 仓库
-   **静态服务器**: 将 `out` 目录内容部署到任何静态文件服务器

## 🔧 开发指南

### 添加新书签

1. 编辑 `src/data/bookmarks.json`
2. 在相应类别下添加书签对象
3. 保存文件，开发服务器会自动刷新

### 自定义样式

-   修改 `src/app/globals.css` 添加全局样式
-   使用 Tailwind CSS 类名进行快速样式调整
-   配置 `tailwind.config.ts` 自定义主题

### 添加新功能

1. 在 `src/app` 目录下创建新页面
2. 使用 TypeScript 确保类型安全
3. 遵循 Next.js App Router 约定

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系

如有问题或建议，请通过以下方式联系：

-   GitHub Issues: [提交问题](https://github.com/maxlongint/maxlongint.github.io/issues)
-   项目主页: [maxlongint.github.io](https://maxlongint.github.io)

---

⭐ 如果这个项目对你有帮助，请给个 Star！
