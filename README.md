# 前端工具库

一个现代化的前端工具收藏网站，帮助开发者快速找到优质的前端库、框架和工具。基于 Vite + React + Tailwind CSS 构建，提供流畅的浏览和搜索体验。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1-blue)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)](https://tailwindcss.com/)

## ✨ 功能特性

### 核心功能

-   🔍 **智能搜索**: 支持按标题、描述、URL、标签进行全文搜索，快速定位所需工具
-   📈 **每周趋势**: 自动抓取 GitHub Trending 前端项目，每周一更新
-   🏷️ **标签筛选**: 60+ 技术标签分类，一键筛选特定领域的工具
-   📊 **多维度排序**: 支持默认、名称、Stars、更新日期等多种排序方式
-   📱 **响应式设计**: 完美适配桌面端和移动端，提供一致的浏览体验
-   🎨 **双视图模式**: 支持列表视图和网格视图自由切换
-   📖 **项目详情页**: 点击卡片查看完整的 GitHub README 和项目统计信息
-   💬 **评论系统**: 集成 Giscus 评论功能，支持社区交流
-   📈 **GitHub 数据展示**: 实时显示仓库 Stars 数、Forks 数、更新时间等信息
-   📉 **数据可视化**: 使用图表展示 GitHub 数据趋势
-   ⚡ **性能优化**: 基于 Vite 的极速构建，懒加载和虚拟滚动优化
-   🔝 **便捷导航**: 固定搜索框、回到顶部按钮等贴心设计

### 用户体验

-   📍 **固定搜索框**: 滚动时自动固定到顶部，随时可搜索
-   💾 **状态持久化**: 自动保存视图模式等用户偏好设置
-   🎯 **流畅导航**: 点击卡片进入详情页，查看完整项目信息
-   📊 **数据统计**: 显示每个标签下的工具数量
-   🔄 **自动更新**: GitHub Actions 定时更新仓库数据
-   📖 **README 预览**: 自动渲染 GitHub README，支持 Markdown 格式

## 🛠️ 技术栈

### 前端框架

-   **React** 19.1.1 - 最新的 React 版本，提供更好的性能和开发体验
-   **React Router** 7.11.0 - 路由管理，支持单页应用导航
-   **TypeScript** 5.9.2 - 类型安全，提升代码质量

### 构建工具

-   **Vite** 6.0.5 - 下一代前端构建工具，极速的开发体验
-   **PostCSS** + **Autoprefixer** - CSS 后处理，自动添加浏览器前缀

### UI 样式

-   **Tailwind CSS** 3.4.17 - 实用优先的 CSS 框架
-   **Recharts** 3.6.0 - 数据可视化图表库
-   响应式设计，移动端优先

### Markdown 渲染

-   **Marked** 17.0.1 - GitHub README 内容渲染
-   **Highlight.js** 11.11.1 - 代码语法高亮
-   **github-markdown-css** - GitHub 风格样式

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

# 抓取 GitHub Trending 数据
npm run fetch-trending
```

## 📁 项目结构

### 文件结构

```
.
├── .github/
│   ├── ISSUE_TEMPLATE/         # GitHub Issue 模板
│   │   └── tool-submission.yml # 工具提交表单模板
│   └── workflows/             # GitHub Actions 工作流
│       ├── setup-labels.yml    # 创建 Issues 标签
│       ├── deploy.yml          # 部署工作流
│       ├── update-trending.yml # Trending 更新工作流
│       └── auto-merge-submission.yml # 自动审核工作流
├── public/                    # 静态资源
│   ├── github-stats.json      # GitHub 仓库统计数据
│   ├── github-readmes.json    # GitHub README 内容
│   ├── trending.json          # GitHub Trending 数据
│   ├── robots.txt            # SEO 爬虫协议
│   └── sitemap.xml           # 站点地图
├── scripts/                   # 脚本文件
│   ├── update-github-data.js # GitHub 数据更新脚本
│   └── fetch-trending.js     # Trending 数据抓取脚本
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
│   ├── pages/                # 页面组件
│   │   ├── Home.tsx          # 首页（书签列表）
│   │   ├── Trending.tsx      # 每日趋势页面
│   │   ├── Submit.tsx        # 提交新工具页面
│   │   └── BookmarkDetail.tsx # 书签详情页
│   ├── types/                # TypeScript 类型定义
│   │   └── index.ts          # 通用类型
│   ├── utils/                # 工具函数
│   │   └── github.ts         # GitHub API 工具
│   ├── main.tsx              # 应用入口
│   ├── index.css             # 全局样式
│   └── vite-env.d.ts         # Vite 类型定义
├── index.html                # HTML 模板
├── vite.config.ts            # Vite 配置
├── tailwind.config.ts        # Tailwind CSS 配置
├── tsconfig.json             # TypeScript 配置
└── package.json              # 项目依赖
```

## 📊 每日趋势功能

### 自动抓取 GitHub Trending

项目配置了自动抓取 GitHub Trending 数据的功能：

-   ⏰ **定时更新**: 每天 UTC 0:00（北京时间 8:00）自动抓取最新数据
-   🌍 **多语言支持**: 支持 JavaScript, TypeScript, Vue, React, HTML, CSS 等前端相关语言
-   🔝 **智能去重**: 自动去除重复项目，按本周 Stars 增量排序
-   🏆 **Top 25 精选**: 每日展示 25 个最热门前端项目
-   💾 **自动同步**: 数据更新后自动提交到仓库

### 手动抓取

```bash
# 抓取最新 Trending 数据
npm run fetch-trending
```

### 数据结构

生成的 `public/trending.json` 包含：

```json
{
    "updated_at": "2025-12-24T03:34:10.064Z",
    "data": {
        "weekStart": "2025-12-22",
        "weekEnd": "2025-12-28",
        "repos": [
            {
                "rank": 1,
                "name": "项目名称",
                "author": "作者",
                "url": "GitHub URL",
                "description": "项目描述",
                "language": "编程语言",
                "stars": 85432,
                "forks": 4521,
                "starsThisWeek": 1234,
                "builtBy": [
                    /* 贡献者列表 */
                ]
            }
        ]
    }
}
```

## 🤖 GitHub Actions 自动化任务

项目配置了多个 GitHub Actions 工作流，实现全自动化的数据更新、审核和部署流程。

### 1️⃣ Setup Repository Labels

**文件**: `.github/workflows/setup-labels.yml`

**功能**: 自动创建和更新 GitHub Issues 所需的标签

**触发条件**:

-   👆 手动触发 (`workflow_dispatch`)
-   📤 推送到 `main` 分支且修改了 `setup-labels.yml` 文件

**创建的标签**:

-   🟢 **收录申请** (绿色 `#0E8A16`) - 新工具收录申请
-   🟡 **待审核** (黄色 `#FBCA04`) - 等待审核的收录申请
-   ✅ **收录通过** (绿色 `#0E8A16`) - 审核通过，将自动收录
-   ✅ **approved** (绿色 `#0E8A16`) - Approved for inclusion
-   🟪 **已收录** (紫色 `#5319E7`) - 已成功收录到工具库
-   ⚠️ **需要修改** (橙色 `#D93F0B`) - 需要修改后重新提交
-   ❌ **拒绝收录** (红色 `#B60205`) - 不符合收录标准

**手动执行**:

```bash
# 访问 GitHub Actions 页面
https://github.com/maxlongint/maxlongint.github.io/actions

# 选择 "Setup Repository Labels" 工作流
# 点击 "Run workflow" 按钮
# 选择 main 分支，点击绿色确认按钮
```

---

### 2️⃣ Deploy to GitHub Pages

**文件**: `.github/workflows/deploy.yml`

**功能**: 自动构建项目并部署到 GitHub Pages，同时更新 GitHub 数据

**触发条件**:

-   ⏰ **定时任务**: 每天 UTC 0:00（北京时间 8:00）自动执行
-   📤 **推送触发**: 推送到 `master` 分支时自动执行
-   👆 **手动触发**: 支持手动运行

**执行步骤**:

1. 📚 Checkout 代码仓库
2. 🛠️ 安装 Node.js 18
3. 📦 安装项目依赖
4. 🔄 **更新 GitHub 数据** (执行 `update-github-data.js`)
    - 获取所有仓库的 Stars、Forks、更新时间等数据
    - 获取仓库 README 内容
    - 生成 `public/github-stats.json` 和 `public/github-readmes.json`
5. 🛠️ 构建生产版本 (`npm run build`)
6. 📤 上传构建产物
7. 🚀 部署到 GitHub Pages

**手动执行**:

```bash
# 访问 GitHub Actions 页面
https://github.com/maxlongint/maxlongint.github.io/actions/workflows/deploy.yml

# 点击 "Run workflow" 按钮手动触发
```

---

### 3️⃣ Update Daily Trending

**文件**: `.github/workflows/update-trending.yml`

**功能**: 自动抓取 GitHub Trending 数据，获取每日最热门的前端项目

**触发条件**:

-   ⏰ **定时任务**: 每天 UTC 0:00（北京时间 8:00）自动执行
-   👆 **手动触发**: 支持手动运行

**执行步骤**:

1. 📚 Checkout 代码仓库
2. 🛠️ 安装 Node.js 18
3. 📦 安装项目依赖
4. 🔥 **抓取 Trending 数据** (`npm run fetch-trending`)
    - 抓取 JavaScript, TypeScript, Vue, React, HTML, CSS 等语言
    - 智能去重，按本周 Stars 增量排序
    - 只保留 Top 25 项目
    - 生成 `public/trending.json`
5. 💾 提交并推送更新 (如有变化)

**手动执行**:

```bash
# 方法 1: 本地执行
npm run fetch-trending

# 方法 2: GitHub Actions 手动触发
https://github.com/maxlongint/maxlongint.github.io/actions/workflows/update-trending.yml
```

---

### 4️⃣ Auto Merge Submission

**文件**: `.github/workflows/auto-merge-submission.yml`

**功能**: 自动审核并合并新工具提交，实现全自动化收录流程

**触发条件**:

-   🏷️ **Issue 标签**: 当 Issue 被添加 **"收录通过"** 或 **"approved"** 标签时自动执行

**工作流程**:

1. 👤 **用户提交**: 用户通过网站表单提交新工具，自动创建 GitHub Issue
2. 👁️ **管理员审核**: 管理员查看 Issue，确认信息完整性
3. ✅ **添加标签**: 管理员添加 "收录通过" 或 "approved" 标签
4. 🤖 **自动处理**: GitHub Actions 自动执行：
    - 📝 解析 Issue 内容（工具名称、GitHub URL、描述、标签）
    - ✔️ 验证必填字段
    - 🔍 检查是否已存在
    - ➕ 添加到 `src/data/bookmarks.json` 文件开头
    - 💾 提交并推送代码
    - 🏷️ 添加 "已收录" 标签
    - 💬 评论通知用户
    - 🔒 关闭 Issue

**特殊情况处理**:

-   ⚠️ **工具已存在**: 评论提示，不重复添加
-   ❌ **信息不完整**: 任务失败，需人工处理

**审核操作指南**:

```bash
# 步骤 1: 访问 Issues 页面
https://github.com/maxlongint/maxlongint.github.io/issues

# 步骤 2: 选择带有 "待审核" 标签的 Issue

# 步骤 3: 检查信息是否完整
# - 工具名称
# - GitHub 仓库地址
# - 工具描述
# - 标签
# - 确认事项均已勾选

# 步骤 4: 做出审核决定
# ✅ 通过: 添加 "收录通过" 或 "approved" 标签
# ⚠️ 需修改: 添加 "需要修改" 标签 + 评论说明
# ❌ 拒绝: 添加 "拒绝收录" 标签 + 评论说明原因 + 手动关闭 Issue

# 步骤 5: 等待自动化处理（如果添加了通过标签）
```

---

### 📊 任务运行频率

| 任务                    | 频率               | 说明                     |
| ----------------------- | ------------------ | ------------------------ |
| Setup Repository Labels | 手动 / 修改时      | 一次性设置，无需频繁执行 |
| Deploy to GitHub Pages  | 每天 8:00 / 推送时 | 自动更新数据并部署       |
| Update Daily Trending   | 每天 8:00          | 每日更新热门项目         |
| Auto Merge Submission   | Issue 标签时       | 实时自动审核             |

### 🛠️ 监控与日志

所有任务的执行情况和日志可在 GitHub Actions 页面查看：

```bash
https://github.com/maxlongint/maxlongint.github.io/actions
```

每个任务都会显示：

-   ✅ 执行状态（成功/失败）
-   ⏱️ 运行时长
-   📝 详细日志
-   📅 执行时间

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

项目配置了 GitHub Actions，定时更新以下数据：

-   **GitHub Stats**: 每日 UTC 0:00（北京时间 8:00）自动更新仓库 Stars、更新时间等数据
-   **GitHub Trending**: 每日 UTC 0:00（北京时间 8:00）自动抓取最热门项目

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
