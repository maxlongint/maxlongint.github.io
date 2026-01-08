# Implementation Plan: GitHub Labels 同步标签云

## Overview

本实现计划分为三个阶段：
1. **标签体系重构** - 创建新标签映射配置，更新现有书签标签
2. **同步脚本开发** - 实现 GitHub Labels 与本地文件的双向同步
3. **GitHub Actions 集成** - 配置自动化工作流

## Tasks

- [x] 1. 创建标签映射配置文件
  - [x] 1.1 创建 `src/data/tag-mapping.json` 文件
    - 定义新标签体系（约 40 个标签）
    - 为每个现有库指定新标签映射
    - _Requirements: 0.1, 0.2, 0.4_
  - [x] 1.2 编写标签映射完整性验证脚本
    - 验证所有 84 个库都有映射
    - 验证每个库有 1-3 个标签
    - **Property 1: Tag Coverage Completeness**
    - **Property 9: Migration Mapping Completeness**
    - **Validates: Requirements 0.2, 0.4, 0.5**

- [x] 2. 实现颜色转换工具函数
  - [x] 2.1 创建 `scripts/lib/color-utils.cjs` 文件
    - 实现 `hexToHSL(hex)` 函数
    - 实现 `hslToHex(h, s, l)` 函数
    - 实现 `hexToTagConfig(hex)` 函数
    - 实现 `calculateTextColor(backgroundColor)` 函数
    - _Requirements: 2.2, 2.3, 7.3_
  - [x] 2.2 编写颜色转换单元测试
    - **Property 3: Color Conversion Round-Trip**
    - **Property 4: Text Color Contrast**
    - **Validates: Requirements 2.2, 2.3, 7.3**

- [x] 3. 实现标签名称处理函数
  - [x] 3.1 创建 `scripts/lib/label-utils.cjs` 文件
    - 实现 `addPrefix(tagName)` 函数
    - 实现 `removePrefix(labelName)` 函数
    - 实现 `filterCategoryLabels(labels)` 函数
    - 实现 `isValidTagName(name)` 函数
    - _Requirements: 1.2, 3.1, 3.2, 3.3_
  - [x] 3.2 编写标签名称处理单元测试
    - **Property 2: Label Prefix Filtering**
    - **Property 5: Label Name Round-Trip**
    - **Validates: Requirements 1.2, 3.1, 7.2**

- [x] 4. Checkpoint - 确保工具函数测试通过
  - 运行所有单元测试
  - 确认颜色转换和标签处理函数正常工作
  - 如有问题请咨询用户

- [x] 5. 实现标签迁移脚本
  - [x] 5.1 创建 `scripts/migrate-tags-to-github.cjs` 脚本
    - 读取 bookmarks.json 中的现有标签
    - 调用 GitHub API 创建 Labels（添加 `分类:` 前缀）
    - 转换颜色格式（HSL → Hex）
    - 支持 dry-run 模式预览
    - 跳过已存在的标签
    - 输出迁移统计信息
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 6. 实现标签同步脚本
  - [x] 6.1 创建 `scripts/sync-github-labels.cjs` 脚本
    - 从 GitHub API 获取所有 Labels
    - 过滤出 `分类:` 前缀的标签
    - 比较本地与远程标签差异
    - 更新 bookmarks.json 的 tags 对象
    - 保留 `All` 和 `__meta__` 不变
    - 检测被删除标签的使用情况并警告
    - 输出同步结果摘要
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 4.2, 4.3, 4.4, 4.5_
  - [x] 6.2 编写同步逻辑单元测试
    - **Property 6: Sync Consistency**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [x] 7. 更新 Issue 解析脚本
  - [x] 7.1 修改 `scripts/parse-and-merge-issue.cjs`
    - 验证提交的标签是否存在于 GitHub Labels
    - 如果标签不存在，自动创建新的 GitHub Label
    - 使用现有颜色生成算法
    - 在 Issue 上添加对应的 GitHub Labels
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 7.2 编写标签验证单元测试
    - **Property 7: Color Generation Determinism**
    - **Property 8: Tag Validation Consistency**
    - **Validates: Requirements 6.1, 6.3**

- [x] 8. Checkpoint - 确保脚本功能正常
  - 手动测试迁移脚本（dry-run 模式）
  - 手动测试同步脚本
  - 确认 Issue 解析脚本更新正确
  - 如有问题请咨询用户

- [x] 9. 创建 GitHub Actions 工作流
  - [x] 9.1 创建 `.github/workflows/sync-labels.yml`
    - 配置 label 事件触发（created, edited, deleted）
    - 配置 workflow_dispatch 手动触发
    - 执行同步脚本
    - 自动提交变更
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 9.2 更新 `.github/workflows/setup-labels.yml`
    - 添加新的分类标签定义
    - 保留现有系统标签
    - _Requirements: 7.2_

- [x] 10. 执行标签体系迁移
  - [x] 10.1 运行迁移脚本创建 GitHub Labels
    - 执行 `node scripts/migrate-tags-to-github.cjs`
    - 确认所有标签创建成功
    - 注：需要在 GitHub Actions 中运行或手动设置 GITHUB_TOKEN
  - [x] 10.2 更新 bookmarks.json 中的书签标签
    - 根据 tag-mapping.json 更新每个书签的 tags 数组
    - 运行同步脚本确保一致性
    - 创建并执行 `scripts/apply-tag-mapping.cjs`
  - [x] 10.3 清理旧标签
    - 删除不再使用的旧标签（已在 apply-tag-mapping.cjs 中自动完成）
    - 更新 `__meta__` 元数据

- [x] 11. 更新 Issue 模板
  - [x] 11.1 修改 `.github/ISSUE_TEMPLATE/tool-submission.yml`
    - 更新标签输入说明
    - 添加可用标签列表参考
    - _Requirements: 6.1_

- [x] 12. Final Checkpoint - 完整功能验证
  - 验证 GitHub Labels 与本地 tags 同步正确
  - 测试新建 Issue 的标签处理流程
  - 测试 Label 变更触发的自动同步
  - 确认所有测试通过（128 个测试全部通过）
  - 如有问题请咨询用户

## Notes

- 所有测试任务都是必须完成的
- 迁移过程建议先在测试分支进行，确认无误后再合并到主分支
- 颜色转换可能存在轻微误差，需要设置合理的容差值
- 删除标签前需要确认没有书签在使用该标签
