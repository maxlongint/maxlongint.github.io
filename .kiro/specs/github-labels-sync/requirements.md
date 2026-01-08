# Requirements Document

## Introduction

本功能包含两个阶段：
1. **标签体系重构** - 对现有的 24 个标签进行整理和优化，设计一套更精准、多样化的标签分类方案
2. **GitHub Labels 同步** - 将标签云管理从本地 `bookmarks.json` 文件迁移到 GitHub Issues 标签系统

通过 GitHub Labels 作为标签的单一数据源（Single Source of Truth），实现标签的集中管理、自动同步和一致性维护。

## 现有标签分析

### 当前标签列表（24个）
数据处理、性能优化、图标、安全、图像处理、动画、样式、拖拽、滚动、手势、快捷键、工具库、数学、国际化、多媒体、数据可视化、浏览器API、UI组件、日期时间、网络请求、文件操作、编辑器、实时协作、文本操作

### 现有问题
1. **分类粒度不一致** - "工具库"过于宽泛（包含 uuid、lodash、radash、reveal.js 等完全不同类型的库）
2. **功能描述不精准** - "数据处理"混合了状态管理（Immer/Mutative）和数据校验（Zod/Valibot）
3. **缺少重要分类** - 缺少"表单"、"状态管理"、"数据校验"、"富文本"、"Canvas"等常见分类
4. **标签重叠** - "文件操作"包含了 Markdown 解析（Marked）、文档预览（docxjs）、文件上传（FilePond）等不同场景
5. **缺少技术栈标签** - 没有区分纯 CSS 库、纯 JS 库、TypeScript 优先等

## Glossary

- **Tag_Cloud**: 项目中用于分类工具/书签的标签集合，包含标签名称和样式配置
- **GitHub_Label**: GitHub 仓库中的 Issue 标签，包含名称、颜色和描述
- **Sync_Script**: 用于同步 GitHub Labels 到本地 `bookmarks.json` 的脚本
- **Label_Color**: 标签的十六进制颜色值（如 `#FF5733`）
- **Bookmarks_JSON**: 存储工具书签和标签配置的本地 JSON 文件 (`src/data/bookmarks.json`)
- **Category_Label**: 以特定前缀（如 `分类:`）标识的工具分类标签
- **System_Label**: 用于 Issue 工作流管理的系统标签（如 `待审核`、`已收录`）
- **Primary_Tag**: 描述库核心功能的主要标签（每个库必须有 1-2 个）
- **Secondary_Tag**: 描述库特性或适用场景的次要标签（可选）

## 新标签体系设计

### 设计原则
1. **精准性** - 标签能准确描述库的核心功能
2. **互斥性** - 同一维度的标签尽量不重叠
3. **完备性** - 覆盖前端开发的主要场景
4. **实用性** - 便于用户快速筛选和查找

### 新标签分类方案（建议 30-35 个标签）

#### 🎯 核心功能类（描述库做什么）

| 标签名 | 描述 | 适用库示例 |
|--------|------|-----------|
| 状态管理 | 不可变数据、状态更新 | Immer, Mutative |
| 数据校验 | Schema 验证、类型检查 | Zod, Valibot, class-validator |
| 表单处理 | 表单验证、表单状态 | （待收录） |
| 动画效果 | CSS/JS 动画库 | Anime.js, GSAP, Animate.css, CountUp.js |
| 图表可视化 | 数据图表、统计图 | ECharts, Wavesurfer.js |
| 流程图 | 流程图、关系图绘制 | bpmn-js |
| 富文本编辑 | 所见即所得编辑器 | Milkdown |
| 代码编辑 | 代码编辑器、语法高亮 | Monaco Editor, CodeMirror, Highlight.js |
| 终端模拟 | 终端/命令行界面 | xterm.js |
| 视频播放 | 视频播放器 | Video.js, Plyr, HLS.js |
| 音频处理 | 音频播放、波形 | Wavesurfer.js |
| 图片处理 | 裁剪、编辑、查看 | Cropper.js, Viewer.js, tui.image-editor |
| 图片生成 | 截图、二维码、Canvas | SnapDOM, QRCode.js |
| 文件上传 | 文件选择、上传 | FilePond, Uppy |
| 文件解析 | 文档预览、格式转换 | docxjs, Marked, Turndown, jszip |
| 文件检测 | 文件类型、MIME | file-type, mime |
| 拖拽排序 | 拖放、排序 | SortableJS, Swapy, interact.js |
| 滚动交互 | 滚动条、滚动动画 | OverlayScrollbars, Scrollama, GSAP |
| 手势识别 | 触摸、手势 | Hammer.js, interact.js |
| 网络请求 | HTTP 客户端、SSE | Axios, Socket.IO, fetch-event-source |
| 实时协作 | CRDT、多人编辑 | Yjs |
| 日期时间 | 日期解析、格式化 | Day.js, Moment.js |
| 数学计算 | 精度计算、货币 | Bignumber.js, decimal.js, Dinero.js, Numeral.js |
| 公式渲染 | 数学公式展示 | KaTeX |
| 国际化 | 多语言、拼音 | pinyin-pro, Nzh |
| 安全防护 | XSS 防护、加密 | DOMPurify, crypto-js |
| 本地存储 | Cookie、Storage | Store.js, js-cookie |
| 剪贴板 | 复制粘贴 | clipboard.js |
| 快捷键 | 键盘绑定 | tinykeys |
| 用户引导 | 新手引导、提示 | Intro.js, driver.js |

#### 🎨 UI 组件类（具体 UI 元素）

| 标签名 | 描述 | 适用库示例 |
|--------|------|-----------|
| 图标库 | 图标集合 | Lucide, Iconoir, Mage Icons |
| 颜色选择 | 拾色器 | iro.js, Pickr, TinyColor |
| 轮播组件 | 幻灯片、走马灯 | Swiper |
| 日历组件 | 日历、日程 | FullCalendar |
| 提示组件 | Tooltip、Popover | Tippy.js |
| 签名组件 | 手写签名 | Signature Pad |
| 虚拟键盘 | 软键盘 | simple-keyboard |
| 加载动画 | Loading、Spinner | Loaders.css |
| JSON编辑 | JSON 查看/编辑 | JSON Editor |

#### 🛠️ 工具类（通用工具函数）

| 标签名 | 描述 | 适用库示例 |
|--------|------|-----------|
| 工具函数 | 通用工具集 | lodash, radash |
| 唯一标识 | UUID、ID 生成 | uuid |
| 模糊搜索 | 搜索、匹配 | Fuse.js |
| 模拟数据 | Mock、假数据 | Mock.js |
| 编码转换 | Base64 等 | js-base64 |
| DOM操作 | DOM diff、操作 | morphdom |
| 演示文稿 | PPT、幻灯片 | reveal.js |

#### 🎨 样式类

| 标签名 | 描述 | 适用库示例 |
|--------|------|-----------|
| CSS框架 | 原子化 CSS、样式框架 | Tailwind CSS, UnoCSS |
| CSS重置 | 样式重置、规范化 | Normalize.css |

### 标签映射方案（现有库 → 新标签）

以下是部分库的标签重新分配建议：

| 库名 | 原标签 | 新标签建议 |
|------|--------|-----------|
| Immer | 数据处理 | 状态管理 |
| Mutative | 数据处理 | 状态管理 |
| Zod | 数据处理 | 数据校验 |
| Valibot | 数据处理 | 数据校验 |
| class-validator | 数据处理 | 数据校验 |
| lodash | 工具库 | 工具函数 |
| radash | 工具库 | 工具函数 |
| uuid | 工具库 | 唯一标识 |
| Fuse.js | 工具库 | 模糊搜索 |
| Mock.js | 工具库 | 模拟数据 |
| reveal.js | 工具库 | 演示文稿 |
| TinyColor | 工具库 | 颜色选择 |
| js-base64 | 工具库 | 编码转换 |
| fetch-event-source | 工具库, 浏览器API | 网络请求 |
| Marked | 文件操作 | 文件解析 |
| docxjs | 文件操作 | 文件解析 |
| Turndown | 文本操作, 文件操作 | 文件解析 |
| jszip | 文件操作 | 文件解析 |
| FilePond | 文件操作 | 文件上传 |
| Uppy | 文件操作 | 文件上传 |
| file-type | 文件操作 | 文件检测 |
| mime | 文件操作 | 文件检测 |
| Video.js | 多媒体 | 视频播放 |
| HLS.js | 多媒体 | 视频播放 |
| Plyr | 多媒体 | 视频播放 |
| Wavesurfer.js | 多媒体, 数据可视化 | 音频处理, 图表可视化 |
| ECharts | 数据可视化 | 图表可视化 |
| bpmn-js | 数据可视化 | 流程图 |
| Cropper.js | 图像处理 | 图片处理 |
| Viewer.js | 图像处理 | 图片处理 |
| tui.image-editor | 图像处理 | 图片处理 |
| SnapDOM | 图像处理 | 图片生成 |
| QRCode.js | 图像处理 | 图片生成 |
| Monaco Editor | 编辑器 | 代码编辑 |
| CodeMirror 5 | 编辑器 | 代码编辑 |
| Highlight.js | 编辑器 | 代码编辑 |
| Milkdown | 编辑器 | 富文本编辑 |
| JSON Editor | 编辑器 | JSON编辑 |
| xterm.js | 编辑器 | 终端模拟 |
| KaTeX | 数学 | 公式渲染 |
| Bignumber.js | 数学 | 数学计算 |
| decimal.js | 数学 | 数学计算 |
| Dinero.js | 数学 | 数学计算 |
| Numeral.js | 数学 | 数学计算 |
| Tailwind CSS | 样式 | CSS框架 |
| UnoCSS | 样式 | CSS框架 |
| Normalize.css | 样式 | CSS重置 |
| Animate.css | 样式, 动画 | 动画效果, CSS框架 |
| Loaders.css | 样式, 动画 | 加载动画 |

## Requirements

### Requirement 0: 标签体系重构

**User Story:** As a 项目维护者, I want to 重新设计标签分类体系, so that 用户能更精准地查找和筛选工具库。

#### Acceptance Criteria

1. THE New_Tag_System SHALL 包含 30-40 个精准的分类标签
2. THE New_Tag_System SHALL 覆盖所有现有 84 个工具库的分类需求
3. WHEN 设计标签时, THE New_Tag_System SHALL 遵循精准性、互斥性、完备性、实用性原则
4. THE Migration_Plan SHALL 为每个现有工具库指定新的标签映射
5. WHEN 一个库有多个功能时, THE New_Tag_System SHALL 允许分配 1-3 个标签

### Requirement 1: GitHub Labels 作为标签数据源

**User Story:** As a 项目维护者, I want to 在 GitHub 仓库中管理所有工具分类标签, so that 我可以通过 GitHub 界面直观地管理标签而无需修改代码。

#### Acceptance Criteria

1. THE Sync_Script SHALL 从 GitHub API 获取仓库的所有 Labels
2. WHEN 获取 Labels 时, THE Sync_Script SHALL 过滤出以 `分类:` 前缀开头的 Category_Labels
3. THE Sync_Script SHALL 忽略 System_Labels（如 `待审核`、`收录通过`、`已收录` 等）
4. WHEN GitHub API 请求失败时, THE Sync_Script SHALL 输出错误信息并以非零状态码退出

### Requirement 2: 标签颜色同步

**User Story:** As a 项目维护者, I want to 在 GitHub 上设置标签颜色后自动同步到项目中, so that 标签在网站上的显示颜色与 GitHub 保持一致。

#### Acceptance Criteria

1. WHEN 同步 Category_Label 时, THE Sync_Script SHALL 读取 GitHub Label 的十六进制颜色值
2. THE Sync_Script SHALL 将十六进制颜色转换为 HSL 格式的 backgroundColor 和 textColor
3. THE Sync_Script SHALL 根据背景色亮度自动计算合适的文字颜色以确保可读性
4. WHEN Label 颜色更新时, THE Sync_Script SHALL 更新 Bookmarks_JSON 中对应标签的颜色配置

### Requirement 3: 标签名称映射

**User Story:** As a 项目维护者, I want to GitHub Label 名称自动映射为网站显示的标签名, so that 我可以使用前缀区分不同类型的标签。

#### Acceptance Criteria

1. WHEN 处理 Category_Label 时, THE Sync_Script SHALL 移除 `分类:` 前缀作为显示名称
2. THE Sync_Script SHALL 保留原始标签名称中的中文和英文字符
3. IF Category_Label 名称去除前缀后为空, THEN THE Sync_Script SHALL 跳过该标签并输出警告

### Requirement 4: 增量同步与删除处理

**User Story:** As a 项目维护者, I want to 同步脚本能够处理标签的增删改, so that 本地标签配置始终与 GitHub 保持一致。

#### Acceptance Criteria

1. WHEN GitHub 新增 Category_Label 时, THE Sync_Script SHALL 在 Bookmarks_JSON 中添加新标签配置
2. WHEN GitHub 删除 Category_Label 时, THE Sync_Script SHALL 从 Bookmarks_JSON 的 tags 对象中移除对应标签
3. WHEN GitHub 修改 Category_Label 颜色时, THE Sync_Script SHALL 更新 Bookmarks_JSON 中的颜色配置
4. THE Sync_Script SHALL 保留 `All` 标签和 `__meta__` 元数据不受同步影响
5. WHEN 删除标签时, THE Sync_Script SHALL 检查是否有书签使用该标签并输出警告

### Requirement 5: GitHub Actions 自动同步

**User Story:** As a 项目维护者, I want to 标签变更时自动触发同步, so that 我无需手动运行同步脚本。

#### Acceptance Criteria

1. WHEN GitHub Label 被创建、更新或删除时, THE GitHub_Actions_Workflow SHALL 自动触发同步脚本
2. THE GitHub_Actions_Workflow SHALL 支持手动触发（workflow_dispatch）
3. WHEN 同步完成且有变更时, THE GitHub_Actions_Workflow SHALL 自动提交更改到仓库
4. THE GitHub_Actions_Workflow SHALL 在 PR 中显示同步结果摘要

### Requirement 6: Issue 提交时的标签处理

**User Story:** As a 工具提交者, I want to 在提交 Issue 时选择已有的分类标签, so that 我的工具能被正确分类。

#### Acceptance Criteria

1. WHEN 解析 Issue 提交时, THE Parse_Script SHALL 验证提交的标签是否存在于 Category_Labels 中
2. IF 提交的标签不存在, THEN THE Parse_Script SHALL 自动创建新的 GitHub Label 并添加 `分类:` 前缀
3. WHEN 创建新标签时, THE Parse_Script SHALL 使用现有的颜色生成算法生成标签颜色
4. THE Parse_Script SHALL 在 Issue 上添加对应的 GitHub Labels

### Requirement 7: 标签初始化迁移

**User Story:** As a 项目维护者, I want to 将现有的本地标签迁移到 GitHub Labels, so that 我可以开始使用新的标签管理方式。

#### Acceptance Criteria

1. THE Migration_Script SHALL 读取 Bookmarks_JSON 中现有的所有标签
2. THE Migration_Script SHALL 为每个标签创建对应的 GitHub Label（添加 `分类:` 前缀）
3. THE Migration_Script SHALL 将标签的现有颜色转换为 GitHub Label 的十六进制颜色
4. IF GitHub Label 已存在, THEN THE Migration_Script SHALL 跳过创建并输出提示
5. WHEN 迁移完成时, THE Migration_Script SHALL 输出迁移统计信息

