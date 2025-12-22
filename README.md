# 前端工具库

一个现代化的前端工具收藏网站，帮助开发者快速找到优质的前端库、框架和工具。基于 Vite + React + Tailwind CSS 构建，提供流畅的浏览和搜索体验。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1-blue)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)](https://tailwindcss.com/)

## ✨ 功能特性

### 核心功能

-   🔍 **智能搜索**: 支持按标题、描述、URL、标签进行全文搜索，快速定位所需工具
-   🏷️ **标签筛选**: 60+ 技术标签分类，一键筛选特定领域的工具
-   📊 **多维度排序**: 支持默认、名称、Stars、更新日期等多种排序方式
-   📱 **响应式设计**: 完美适配桌面端和移动端，提供一致的浏览体验
-   🎨 **双视图模式**: 支持列表视图和网格视图自由切换
-   💬 **评论系统**: 集成 Giscus 评论功能，支持社区交流
-   📈 **GitHub 数据展示**: 实时显示仓库 Stars 数、更新时间等信息
-   ⚡ **性能优化**: 基于 Vite 的极速构建，懒加载和虚拟滚动优化
-   🔝 **便捷导航**: 固定搜索框、回到顶部按钮等贴心设计

### 用户体验

-   📍 **固定搜索框**: 滚动时自动固定到顶部，随时可搜索
-   💾 **状态持久化**: 自动保存视图模式等用户偏好设置
-   🎯 **外链提示**: 点击卡片时提供视觉反馈和跳转提示
-   📊 **数据统计**: 显示每个标签下的工具数量
-   🔄 **自动更新**: GitHub Actions 定时更新仓库数据

## 🛠️ 技术栈

### 前端框架

-   **React** 19.1.1 - 最新的 React 版本，提供更好的性能和开发体验
-   **TypeScript** 5.9.2 - 类型安全，提升代码质量

### 构建工具

-   **Vite** 6.0.5 - 下一代前端构建工具，极速的开发体验
-   **PostCSS** + **Autoprefixer** - CSS 后处理，自动添加浏览器前缀

### UI 样式

-   **Tailwind CSS** 3.4.17 - 实用优先的 CSS 框架
-   响应式设计，移动端优先

### 代码质量

-   **ESLint** 9.35.0 - 代码规范检查
-   **TypeScript ESLint** - TypeScript 代码规范

### 第三方集成

-   **Microsoft Clarity** - 用户行为分析
-   **Giscus** - GitHub Discussions 评论系统

## 🚀 快速开始

### 环境要求

-   Node.js >= 18.0.0
-   npm >= 9.0.0

### 安装

```bash
# 克隆项目
git clone https://github.com/maxlongint/maxlongint.github.io.git
cd maxlongint.github.io

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器（默认运行在 http://localhost:5173）
npm run dev
```

### 构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 代码检查

```bash
# 运行 ESLint 检查
npm run lint
```

## 📁 项目结构

```
.
├── public/                    # 静态资源
│   ├── robots.txt            # SEO 爬虫协议
│   └── sitemap.xml           # 站点地图
├── scripts/                   # 脚本文件
│   └── update-github-data.js # GitHub 数据更新脚本
├── src/
│   ├── components/           # React 组件
│   │   ├── BookmarkCard.tsx   # 书签卡片组件
│   │   ├── BookmarkList.tsx   # 书签列表组件
│   │   ├── ClarityProvider.tsx # Microsoft Clarity 分析
│   │   ├── Comments.tsx       # 评论抽屉组件
│   │   ├── Footer.tsx         # 页脚组件
│   │   ├── GitHubStats.tsx    # GitHub 数据展示组件
│   │   ├── Header.tsx         # 头部导航组件
│   │   ├── SearchBar.tsx      # 搜索栏组件
│   │   └── TagFilter.tsx      # 标签筛选组件
│   ├── data/
│   │   └── bookmarks.json    # 书签数据（500+ 前端工具）
│   ├── App.tsx               # 主应用组件
│   ├── main.tsx              # 应用入口
│   ├── index.css             # 全局样式
│   └── vite-env.d.ts         # Vite 类型定义
├── .github/
│   └── workflows/            # GitHub Actions 工作流
├── index.html                # HTML 模板
├── vite.config.ts            # Vite 配置
├── tailwind.config.ts        # Tailwind CSS 配置
├── tsconfig.json             # TypeScript 配置
└── package.json              # 项目依赖
```

## 📝 数据管理

### 添加新工具

编辑 `src/data/bookmarks.json` 文件，按以下格式添加新工具：

```json
{
    "title": "工具名称",
    "url": "https://github.com/user/repo",
    "description": "工具的详细描述",
    "tags": ["标签1", "标签2"]
}
```

### 标签配置

在 `bookmarks.json` 的 `tags` 对象中配置标签样式：

```json
"tags": {
    "标签名": {
        "className": "bg-blue-100 text-blue-800",
        "color": "#3498db"
    }
}
```

### GitHub 数据自动更新

项目配置了 GitHub Actions，每天 UTC 0:00 自动更新 GitHub 仓库的 Stars、更新时间等数据。

## 📊 性能优化

-   ⚡ **Vite 构建**: 使用 Vite 6 提供极速的开发和构建体验
-   🎯 **代码分割**: 组件按需加载，减少首屏加载时间
-   💾 **状态管理**: 使用 React Hooks 和 localStorage 优化状态管理
-   🔄 **空闲时更新**: 在浏览器空闲时更新 GitHub 数据，不影响用户体验
-   📱 **响应式图片**: 根据设备尺寸加载合适的资源

## 🚢 部署

### GitHub Pages（推荐）

项目已配置 GitHub Actions 自动部署，推送到主分支即可自动部署到 GitHub Pages。

### 手动部署

```bash
# 构建项目
npm run build

# dist 目录即为生产版本，可部署到任何静态服务器
```

### 支持的平台

-   ✅ GitHub Pages
-   ✅ Vercel
-   ✅ Netlify
-   ✅ Cloudflare Pages
-   ✅ 任何支持静态文件的服务器

## 🎯 浏览器支持

-   Chrome（推荐）
-   Firefox
-   Safari
-   Edge
-   其他现代浏览器

## 📈 项目演进

### 技术栈迁移

本项目已从 Next.js 重构为 Vite + React，主要变更：

-   ✅ 使用 Vite 替代 Next.js，提供更快的开发体验
-   ✅ 采用标准的 React SPA 架构，简化项目结构
-   ✅ 保留了所有核心功能和 500+ 工具数据
-   ✅ 优化了组件结构和代码组织
-   ✅ 改进了性能和用户体验

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 贡献流程

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

### 提交规范

-   feat: 新功能
-   fix: 修复 bug
-   docs: 文档更新
-   style: 代码格式调整
-   refactor: 重构
-   perf: 性能优化
-   test: 测试相关
-   chore: 构建/工具链相关

## 📄 License

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

感谢所有开源项目的贡献者，让前端开发变得更加美好！

## 📮 联系方式

如有问题或建议，欢迎：

-   提交 [Issue](https://github.com/maxlongint/maxlongint.github.io/issues)
-   在网站评论区留言
-   通过 GitHub Discussions 交流

---

⭐ 如果这个项目对你有帮助，欢迎给个 Star！
