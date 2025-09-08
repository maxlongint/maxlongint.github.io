# GitHub Pages 自动部署配置

## 概述

本项目已配置 GitHub Actions 工作流，可以自动将 Next.js 应用构建并部署到 GitHub Pages。

## 设置步骤

### 1. 启用 GitHub Pages

1. 进入您的 GitHub 仓库页面
2. 点击 **Settings** 标签
3. 在左侧菜单中选择 **Pages**
4. 在 "Source" 部分选择 **GitHub Actions**

### 2. 确保分支设置

-   确保您的默认分支是 `main`
-   或者修改 `.github/workflows/deploy.yml` 中的分支名称

### 3. 推送代码

当您推送代码到 `main` 分支时，GitHub Actions 会自动：

1. 检出代码
2. 设置 Node.js 环境
3. 安装依赖
4. 构建 Next.js 应用
5. 部署到 GitHub Pages

## 工作流文件说明

### `.github/workflows/deploy.yml`

-   **触发条件**: 推送到 main 分支或手动触发
-   **Node.js 版本**: 18
-   **构建命令**: `npm run build`
-   **部署目标**: GitHub Pages

### `next.config.js` 修改

-   `output: 'export'`: 启用静态导出
-   `trailingSlash: true`: 添加尾部斜杠以兼容静态托管
-   `images: { unoptimized: true }`: 禁用图片优化以支持静态导出

## 部署后访问

部署完成后，您可以通过以下 URL 访问您的网站：

```
https://[您的用户名].github.io/[仓库名]
```

例如：`https://maxlongint.github.io/maxlongint.github.io`

## 故障排除

### 常见问题

1. **部署失败**: 检查 GitHub Actions 日志
2. **页面 404**: 确认 GitHub Pages 设置正确
3. **样式丢失**: 检查资源路径配置

### 查看部署状态

1. 进入仓库的 **Actions** 标签
2. 查看最新的工作流运行状态
3. 点击具体的运行查看详细日志

## 本地测试

在推送前，您可以本地测试构建：

```bash
npm run build
npm run export  # 如果使用export脚本
```

构建产物会在 `out` 目录中生成。
