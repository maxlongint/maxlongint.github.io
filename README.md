# 前端利器库

一个基于 Vite + React + Tailwind CSS 构建的前端工具收藏网站。

## 技术栈

-   **框架**: React 19
-   **构建工具**: Vite 6
-   **样式**: Tailwind CSS 3
-   **语言**: TypeScript 5
-   **代码规范**: ESLint

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 项目结构

```
.
├── public/              # 静态资源
├── src/
│   ├── components/      # React 组件
│   ├── data/           # 数据文件
│   ├── App.tsx         # 主应用组件
│   ├── main.tsx        # 应用入口
│   └── index.css       # 全局样式
├── index.html          # HTML 模板
└── vite.config.ts      # Vite 配置
```

## 功能特性

-   🔍 **智能搜索**: 支持按标题、描述、URL、标签搜索
-   🏷️ **标签筛选**: 快速按技术栈分类浏览
-   📱 **响应式设计**: 完美适配移动端和桌面端
-   🎨 **双视图模式**: 支持列表和网格两种浏览模式
-   ⚡ **性能优化**: 基于 Vite 的极速开发体验

## 重构说明

本项目已从 Next.js 重构为 Vite + React，主要变更:

1. ✅ 移除了 Next.js 框架依赖
2. ✅ 使用 Vite 作为构建工具，提供更快的开发体验
3. ✅ 采用标准的 React SPA 架构
4. ✅ 保留了所有核心功能和书签数据
5. ✅ 优化了组件结构，提高代码可维护性
6. ✅ 移除了分页功能，所有内容在单页中展示

## License

MIT
