# 前端工具库 | Frontend Toolbox

<div align="center">

[![Deploy](https://github.com/maxlongint/maxlongint.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/maxlongint/maxlongint.github.io/actions/workflows/deploy.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.1-61dafb?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff?logo=vite)](https://vitejs.dev/)

**精选前端工具库集合 - 让开发更高效**

[🚀 在线访问](https://snazzy.top) · [📝 提交工具](https://snazzy.top/#/submit) · [📊 趋势榜](https://snazzy.top/#/trending) · [⚖️ 工具对比](https://snazzy.top/#/compare) · [💬 留言板](https://snazzy.top/#/contact)

</div>

---

## ✨ 特性

### 🎯 核心功能

-   **📚 精选工具库** - 75+ 精心挑选的前端工具和框架
-   **🔍 智能搜索** - 支持标题、描述、URL、标签的全文搜索
-   **🏷️ 标签筛选** - 18 个精选分类标签,快速定位所需工具
-   **⚖️ 工具对比** - 深度对比两个工具库的各项指标,帮助选型决策
-   **📊 实时数据** - GitHub Stars、npm 版本、更新时间实时同步
-   **📈 趋势榜单** - 展示 GitHub 每日前端热门项目
-   **📱 响应式设计** - 完美支持桌面端和移动端
-   **🌓 亮色/暗色主题** - 支持主题切换,记忆用户偏好,自动同步 Giscus 评论区主题
-   **🌓 视图模式** - 列表/网格两种浏览模式,记忆用户偏好
-   **📖 详情页面** - 包含 README、npm 下载量、Bundle Size、OG 分享卡片等详细信息
-   **🎨 OG 分享卡片** - 每个工具自动生成精美的分享卡片,支持一键复制分享

### 🎨 用户体验

-   **⚡ 极速加载** - 路由懒加载、代码分割、Terser 压缩优化
-   **📦 优化包体积** - 主 bundle ~177KB (gzip: 56.6KB),总包体积大幅减少
-   **🔄 数据同步** - 延迟加载 GitHub 数据,避免阻塞首屏渲染
-   **🎯 平滑滚动** - 固定搜索栏、回到顶部等交互优化
-   **🌓 主题切换** - 亮色/暗色主题无缝切换,localStorage 持久化,Giscus 评论区同步主题
-   **📊 用户分析** - 集成 Microsoft Clarity (延迟加载,不影响性能)
-   **🚀 自动部署** - GitHub Actions 自动构建和部署

-   **前端框架**: React 19.1 + TypeScript 5.9
-   **构建工具**: Vite 6.0
-   **路由**: React Router 7.11
-   **样式**: Tailwind CSS 3.4
-   **图表**: Recharts 3.6
-   **Markdown**: Marked 17.0 + Highlight.js 11.11
-   **分析**: Microsoft Clarity
-   **部署**: GitHub Pages

---

## 📦 快速开始

### 环境要求

-   Node.js >= 18.0
-   npm >= 9.0

### 安装

```
# 克隆项目
git clone https://github.com/maxlongint/maxlongint.github.io.git
cd maxlongint.github.io

# 安装依赖
npm install
```

### 开发

```
# 启动开发服务器
npm run dev

# 打开浏览器访问 http://localhost:5173
```

### 构建

```
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 代码检查

```bash
# ESLint 代码检查
npm run lint
```

### 管理工具

```bash
# 修改库的标签
npm run update-library-tags "库名称" "标签1,标签2,标签3"

# 示例：修改 Axios 的标签
npm run update-library-tags "Axios" "网络请求,工具库"
```

---

## 📂 项目结构

```
.
├── .github/
│   └── workflows/          # GitHub Actions 工作流
│       ├── deploy.yml                       # 自动部署
│       ├── update-github-stats.yml          # 更新 GitHub 数据
│       ├── update-github-readmes.yml        # 更新 README
│       ├── update-trending.yml              # 更新趋势榜
│       ├── update-comparison-data.yml       # 更新对比数据
│       ├── update-single-comparison.yml     # 手动更新单个库对比数据
│       ├── update-library-tags.yml          # 手动更新库标签
│       └── auto-merge-submission.yml        # 自动合并提交
├── public/                 # 静态资源
│   ├── logo.png
│   └── favicon.ico
├── scripts/                # 数据获取和管理脚本
│   ├── update-github-stats.js         # 获取 GitHub Stars/npm 版本
│   ├── update-github-readmes.js       # 获取 README 内容
│   ├── fetch-trending.js              # 获取趋势榜数据
│   ├── update-comparison-data.js      # 批量更新对比数据
│   ├── update-comparison-single.js    # 单个库对比数据更新
│   ├── update-library-tags.js         # 修改库的标签
│   ├── generate-og-images.js          # 批量生成 OG 图片
│   ├── generate-og-single.js          # 生成单个 OG 图片
│   ├── generate-default-og.js         # 生成默认 OG 图片
│   ├── sync-single-readme.js          # 同步单个 README
│   └── regenerate-tag-colors.js       # 重新生成标签颜色
├── src/
│   ├── components/         # React 组件
│   │   ├── BookmarkCard.tsx        # 工具卡片组件
│   │   ├── BookmarkList.tsx        # 工具列表组件
│   │   ├── ComparisonView.tsx      # 对比视图组件
│   │   ├── GitHubStats.tsx         # GitHub 统计组件
│   │   ├── Header.tsx              # 顶部导航
│   │   ├── Footer.tsx              # 底部信息
│   │   ├── SearchBar.tsx           # 搜索框
│   │   ├── TagFilter.tsx           # 标签筛选
│   │   ├── LoadingFallback.tsx     # 加载动画组件
│   │   └── ClarityProvider.tsx     # Clarity 分析(延迟加载)
│   ├── contexts/            # React Context
│   │   └── ThemeContext.tsx        # 主题上下文管理
│   ├── data/               # 数据文件
│   │   ├── bookmarks.json          # 工具库数据
│   │   ├── github-stats.json       # GitHub 统计数据(同步生成)
│   │   ├── github-readmes.json     # README 内容(同步生成)
│   │   ├── trending.json           # 趋势数据(同步生成)
│   │   ├── comparison-data.json    # 对比数据(同步生成)
│   │   └── og-images/              # OG 分享图片(同步生成)
│   ├── pages/              # 页面组件 (懒加载)
│   │   ├── Home.tsx                # 主页
│   │   ├── BookmarkDetail.tsx      # 工具详情页
│   │   ├── Compare.tsx             # 工具对比页面
│   │   ├── Trending.tsx            # 趋势榜页面
│   │   ├── Submit.tsx              # 提交工具页面
│   │   └── Contact.tsx             # 留言板页面
│   ├── types/              # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/              # 工具函数
│   │   └── github.ts               # GitHub 数据处理
│   ├── index.css           # 全局样式
│   └── main.tsx            # 应用入口
├── index.html              # HTML 模板
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript 配置
├── tailwind.config.ts      # Tailwind 配置
├── vite.config.ts          # Vite 配置
└── README.md               # 项目文档
```

---

## 🔧 项目特色

### 🌟 完全自动化

-   **自动数据同步** - 每天定时自动更新 Stars、README、趋势榜
-   **自动收录工具** - Issue 提交后自动解析、同步 GitHub 数据、生成 OG 图片、部署
-   **自动部署** - 代码/数据更新后自动构建并上线
-   **自动标签** - 新工具自动生成颜色配置
-   **自动 OG 图片** - 新工具收录时自动生成精美的 OG 分享卡片
-   **标签管理** - 支持通过 GitHub Actions 可视化修改库的标签分类

### 🚀 性能优化

-   **直接导入数据** - 无需额外请求,数据直接打包
-   **代码分割** - 按需加载,减少首屏时间
-   **智能缓存** - LocalStorage + 浏览器缓存
-   **Markdown 优化** - 防止重复渲染,移除滚动监听

### 🎨 用户体验

-   **响应式设计** - 完美适配桌面和移动端
-   **视图切换** - 列表/网格自由切换,记忆偏好
-   **智能搜索** - 实时搜索,支持多字段匹配
-   **数据详尽** - Stars、npm 下载、Bundle Size、README 一站式

---

## 📊 项目统计

-   **工具数量**: 75+ 精选工具
-   **标签分类**: 18 个精选标签（已优化精简）
-   **代码行数**: ~5,200 行 TypeScript/React
-   **构建产物**: 总计 1.97 MB (13 个 JS 文件 + 2 个 CSS 文件)
-   **主 Bundle**: ~175KB (gzip: 57KB)
-   **构建时间**: ~7-8 秒 (Vite + Terser)
-   **部署时间**: ~2-3 分钟

---

## 🎯 核心功能说明

### 1. 数据加载机制

项目采用**直接导入**策略,将数据打包到应用中,确保数据可用性和性能:

#### 数据来源

所有数据文件位于 `src/data/` 目录,在构建时被打包到应用中:

-   **github-stats.json** - GitHub 仓库统计数据(stars、npm 版本、更新时间)
-   **github-readmes.json** - README 内容
-   **trending.json** - 每日热门趋势数据
-   **bookmarks.json** - 工具库基础信息

#### 数据流程

```
// 1. 应用启动时直接导入数据(编译时打包)
import githubStatsData from '../data/github-stats.json';
import githubReadmesData from '../data/github-readmes.json';
import trendingData from '../data/trending.json';

// 2. 加载到全局状态
loadGitHubData(); // src/main.tsx

// 3. 数据加载完成后触发事件,通知组件更新
window.dispatchEvent(new Event('github-data-loaded'));
```

#### 组件响应

```
// BookmarkCard 组件监听数据加载事件
useEffect(() => {
    const handleDataLoaded = () => {
        forceUpdate({}); // 强制重新渲染,显示最新数据
    };

    window.addEventListener('github-data-loaded', handleDataLoaded);
    return () => window.removeEventListener('github-data-loaded', handleDataLoaded);
}, []);
```

### 2. GitHub 数据自动更新

通过 GitHub Actions 定时任务自动更新数据并提交到仓库:

#### 定时任务

-   **⭐ Update GitHub Stats** - 每天凌晨 2:00 北京时间更新 Stars 和 npm 版本
-   **📖 Update GitHub READMEs** - 每天凌晨 3:00 北京时间更新 README 内容
-   **🔥 Update Daily Trending** - 每天凌晨 4:00 北京时间更新趋势榜数据
-   **⚖️ Update Comparison Data** - 每天凌晨 5:00 北京时间更新对比数据

数据更新后自动触发网站部署,用户无需等待下次访问即可看到最新数据。

**性能优化**: 应用启动时延迟 100ms 加载 GitHub 数据,避免阻塞首屏渲染。

### 3. 工具对比功能

工具对比页面提供深度的工具库对比功能,帮助开发者做出更明智的选型决策。

#### 功能特点

-   **智能选择** - 搜索并选择两个不同的工具库进行对比
-   **热门对比** - 快速访问热门对比组合（Mutative vs Immer、Valibot vs Zod、Day.js vs Moment.js）
-   **GitHub 头像** - 显示各个库在 GitHub 上的真实头像
-   **实时数据** - 每日凌晨 4:00 自动更新对比数据

#### 对比维度

对比页面展示 6 大维度的详细对比：

1.  **打包体积（压缩后）** - 来源：Bundlephobia API

    -   gzip 压缩后大小
    -   可视化百分比对比
    -   Tree-shaking 支持情况

2.  **主要语言 & 仓库大小** - 来源：GitHub API

    -   代码主要语言
    -   仓库存储大小

3.  **社区活跃度** - 来源：GitHub API

    -   Fork 数量
    -   Watchers 数量
    -   开放 Issue 数量

4.  **生态 & 插件** - 计算得出

    -   生态系统评估
    -   相关插件展示

5.  **设计理念** - 来源：bookmarks.json 描述 / GitHub 描述

    -   核心设计哲学
    -   适用场景

6.  **周下载量** - 来源：npm API
    -   每周 npm 下载次数
    -   流行度趋势

#### 数据更新

对比数据通过 GitHub Actions 自动同步：

**自动更新**：

```bash
# 每天凌晨5:00 北京时间自动执行
scripts/update-comparison-data.js
```

**手动更新单个库**：

1. 进入 GitHub Actions 页面
2. 选择 "🔄 Update Single Library Comparison"
3. 点击 "Run workflow"
4. 输入仓库路径（例如：`tailwindlabs/tailwindcss`）
5. 执行完成后自动发布网站

或本地执行：

```bash
npm run update-comparison-single "tailwindlabs/tailwindcss"
```

自动获取：

-   npm Registry API - 包版本和周下载量
-   GitHub API - Stars、Forks、Issues、语言、仓库大小等
-   Bundlephobia API - 包体积数据

### 4. 库标签管理

#### 本地修改标签

```bash
# 基本用法
npm run update-library-tags "库名称" "标签1,标签2"

# 示例：修改 Axios 的标签
npm run update-library-tags "Axios" "网络请求,工具库"

# 示例：修改 lodash 为单个标签
npm run update-library-tags "lodash" "工具库"
```

**功能特点**：

-   ✅ 支持智能查找（不区分大小写）
-   ✅ 找不到库时提供相似名称建议
-   ✅ 自动验证标签是否在已定义列表中
-   ✅ 显示详细的标签变更报告（添加/移除）

#### 通过 GitHub Actions 修改

1. 进入 GitHub Actions 页面
2. 选择 "🏷️ Update Library Tags" 工作流
3. 点击 "Run workflow"
4. 输入参数：
    - **库名称**：例如 `Axios`
    - **新标签**：例如 `网络请求,工具库`（多个标签用逗号分隔）
5. 执行完成后自动提交并部署

**当前标签列表（18 个）**：

-   数据处理、性能优化、图标、安全、图像处理
-   动画、样式、交互、工具库、数学
-   国际化、多媒体、数据可视化、浏览器 API
-   UI 组件、日期时间、网络请求、文件操作、编辑器

### 5. 工具提交流程

用户可以通过 [提交页面](https://snazzy.top/#/submit) 提交新工具:

1.  填写工具信息(名称、GitHub 地址、描述、标签)
2.  自动创建 GitHub Issue
3.  管理员审核,标记为 "收录通过"
4.  GitHub Actions 自动合并并同步数据
5.  自动更新工具库展示

### 6. 缓存策略

为提升性能,项目采用多级缓存:

-   **LocalStorage** - 缓存 npm 下载量和 Bundle Size 数据(7 天有效期)
-   **浏览器缓存** - 静态资源缓存
-   **GitHub Actions 缓存** - 依赖缓存,加快构建速度

---

## 📊 性能优化

### 构建优化

-   ⚡ **Vite 构建** - 使用 Vite 6 提供极速的开发和构建体验
-   🎯 **路由懒加载** - 使用 React.lazy() 和 Suspense 实现组件按需加载
-   📦 **代码分割** - 智能 vendor chunks 分离:
    -   `react-vendor` (46.4KB) - React 核心库
    -   `markdown-vendor` (60.7KB) - Markdown 渲染
    -   `chart-vendor` (317KB) - 图表库
    -   主应用包 (177KB, gzip: 56.6KB)
-   🗜️ **Terser 压缩** - 移除 console.log,死代码消除
-   🖼️ **OG 图片优化** - 开发时代理访问,构建时自动复制,避免重复打包
-   🎨 **CSS 代码分割** - 按需加载样式文件
-   📉 **总包体积** - 显著减少,首屏加载更快

### 运行时优化

-   💾 **状态管理** - 使用 React Hooks 和 localStorage 优化状态管理
-   ⏱️ **延迟加载** - GitHub 数据延迟 100ms 加载,避免阻塞首屏
-   📊 **Clarity 延迟** - 分析脚本延迟 2 秒加载,不影响核心性能
-   🔄 **事件驱动更新** - 数据加载完成后触发事件,避免轮询
-   📱 **响应式优化** - 根据设备尺寸加载合适的资源
-   🐎 **防抖优化** - 搜索输入采用防抖处理
-   📝 **useMemo 缓存** - 关键计算结果缓存,避免重复渲染
-   🎯 **useRef 优化** - 避免不必要的 DOM 操作和重渲染
-   🌓 **主题优化** - Context API 主题管理,localStorage 持久化,postMessage 同步第三方组件
-   🎬 **加载动画** - 专业的 Suspense fallback 组件,提升用户体验

### 性能指标 (Lighthouse)

优化后预期性能提升:

-   **FCP (首次内容绘制)**: ~0.8s (提升 27%)
-   **LCP (最大内容绘制)**: ~0.9s (提升 18%)
-   **TBT (总阻塞时间)**: ~100ms (降低 52%)
-   **FID (首次输入延迟)**: ~100ms (降低 44%)

### Markdown 渲染优化

-   🛡️ **防止重复渲染** - 使用 `useRef` 追踪渲染状态
-   🚀 **移除滚动监听** - 彻底移除滚动 state,防止滚动时重渲染
-   📊 **性能提升** - Markdown 图片只加载一次,请求数大幅降低

---

## 🎨 OG 分享卡片

项目为每个工具自动生成精美的 Open Graph 分享卡片,用于社交媒体分享时显示。

### 特性

-   🎨 **统一设计** - 左右布局,左侧显示项目头像,右侧显示工具信息
-   ⭐ **动态数据** - 自动显示 GitHub Stars 数、工具描述等实时信息
-   📱 **自适应布局** - 根据描述长度自动调整字体大小(24-36px)
-   🖼️ **自动生成** - 新工具收录时自动生成 OG 图片
-   💾 **优化存储** - 图片存储在 `src/data/og-images/`,Git 追踪,构建时复制

### 生成方式

```
# 批量生成所有 OG 图片
npm run generate-og

# 为单个工具生成 OG 图片
npm run generate-og-single "工具名称"
```

### 图片规格

-   **尺寸**: 1200x630px (符合 Open Graph 标准)
-   **格式**: PNG
-   **存储**: `src/data/og-images/*.png`
-   **访问**: `/og-images/*.png`

### 使用场景

-   🔗 **分享链接** - 在 QQ、微信、Twitter 等平台分享时显示卡片预览
-   📋 **一键复制** - 点击详情页的分享按钮,自动复制 OG 图片到剪贴板
-   🌐 **SEO 优化** - 提升社交媒体分享的视觉效果和点击率

---

## 🚀 部署

### GitHub Pages (推荐)

项目已配置 GitHub Actions 自动部署:

1.  推送代码到 `master` 分支
2.  GitHub Actions 自动构建
3.  自动部署到 GitHub Pages

### 手动部署

```
# 构建项目
npm run build

# dist 目录即为生产版本,可部署到任何静态服务器
```

### 支持的平台

-   ✅ GitHub Pages
-   ✅ Vercel
-   ✅ Netlify
-   ✅ Cloudflare Pages
-   ✅ 任何支持静态文件的服务器

---

## 🔧 配置说明

### Microsoft Clarity

项目集成了 Microsoft Clarity 用户行为分析:

```
// src/pages/Home.tsx
<ClarityProvider projectId="t7y8qtm5hl" enabled={true} />
```

**功能**:

-   📊 热力图 - 显示用户点击和滚动热点
-   🎥 会话录制 - 录制用户真实操作过程
-   📈 用户行为分析 - 了解用户如何与网站交互

**如需禁用**,设置 `enabled={false}` 或删除组件。

### Giscus 评论系统

留言板页面使用 GitHub Discussions 作为评论系统,支持主题跟随:

```
// src/pages/Contact.tsx
const script = document.createElement('script');
script.src = 'https://giscus.app/client.js';
script.setAttribute('data-repo', 'maxlongint/maxlongint.github.io');
script.setAttribute('data-repo-id', 'R_kgDONdqNSQ');
script.setAttribute('data-category', 'General');
script.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
// ...
```

**主题同步**: 当用户切换网站主题时,Giscus 评论区会通过 `postMessage` API 自动同步切换主题。

---

# 📝 如何添加新工具

### 方式 1: 通过网站提交 (推荐)

#### 提交步骤

1.  访问 [提交页面](https://snazzy.top/#/submit)
2.  填写工具信息:
    -   工具名称
    -   GitHub 仓库地址
    -   工具描述
    -   选择或输入标签
3.  点击"提交工具"按钮
4.  跳转到 GitHub Issue 创建页面(内容已预填)
5.  点击"Submit new issue"完成提交

#### 自动化流程

提交后会自动触发以下流程:

```
✅ Issue 创建成功
    ↓
🏷️ 自动添加标签:"收录申请" + "待审核"
    ↓
💬 自动回复欢迎评论,说明审核流程
    ↓
👀 管理员审核工具质量和适用性
    ↓
✨ 审核通过后,管理员标记为"收录通过"
    ↓
🤖 GitHub Actions 自动执行:
    - 解析 Issue 内容
    - 添加到 bookmarks.json
    - 自动生成标签颜色配置
    - 实时获取 GitHub Stars 数据
    - 实时获取 README 内容
    - 提交所有更改
    - 触发网站部署
    ↓
🎉 自动收录完成,关闭 Issue
    ↓
📧 您会收到 GitHub 通知
```

**整个过程完全自动化,无需人工干预!**

### 方式 2: 手动编辑 (开发者)

编辑 `src/data/bookmarks.json`:

```
{
    "title": "工具名称",
    "url": "https://github.com/owner/repo",
    "description": "简短描述",
    "tags": ["标签1", "标签2"]
}
```

### 方式 3: 提交 Pull Request

1.  Fork 本仓库
2.  添加工具到 `src/data/bookmarks.json`
3.  提交 Pull Request
4.  等待审核合并

---

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议!

### 贡献类型

-   🐛 报告 Bug
-   💡 提出新功能
-   📝 改进文档
-   🔧 优化代码
-   ➕ 添加新工具

### 贡献步骤

1.  Fork 本仓库
2.  创建功能分支 (`git checkout -b feature/AmazingFeature`)
3.  提交更改 (`git commit -m 'Add some AmazingFeature'`)
4.  推送到分支 (`git push origin feature/AmazingFeature`)
5.  创建 Pull Request

### 代码规范

-   ✅ 通过 ESLint 检查 (`npm run lint`)
-   ✅ 遵循 TypeScript 类型约束
-   ✅ 保持代码简洁和可读性
-   ✅ 添加必要的注释

---

## 📄 License

[MIT License](LICENSE)

---

## 🎯 浏览器支持

-   ✅ Chrome (推荐)
-   ✅ Firefox
-   ✅ Safari
-   ✅ Edge
-   ✅ 其他现代浏览器

**要求**: 支持 ES2020+ 和现代 Web API

---

## 📞 联系方式

-   **网站**: [https://snazzy.top](https://snazzy.top)
-   **GitHub**: [maxlongint/maxlongint.github.io](https://github.com/maxlongint/maxlongint.github.io)
-   **邮箱**: 190615112@qq.com
-   **QQ**: 190615112

---

## 🙏 致谢

感谢以下项目和工具的支持:

-   [React](https://reactjs.org/) - UI 框架
-   [Vite](https://vitejs.dev/) - 构建工具
-   [TypeScript](https://www.typescriptlang.org/) - 类型系统
-   [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
-   [GitHub Pages](https://pages.github.com/) - 静态托管
-   [Microsoft Clarity](https://clarity.microsoft.com/) - 用户分析

以及所有贡献者和使用者!

---

<div align="center">

**⭐ 如果这个项目对你有帮助,欢迎给个 Star!**

Made with ❤️ by [maxlongint](https://github.com/maxlongint)

</div>
