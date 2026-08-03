# Requirements Index

使用此目录存放实现级需求合成文档。

不要直接将原始 PM 聊天、复制的文章或原型笔记放在这里。这些应首先放在 `docs/input/` 中。

## Rule

只在内容足够清晰、能够驱动设计或实现之后才移入此处。

## Current Files

### 产品范围 & 里程碑

- `product-scope.md` - 产品范围定义
- `mvp.md` - 当前 MVP 里程碑范围

### AI Agent

- `ai-agent-enhancement.md` - AI Agent 能力增强需求列表（基于现有机制分析的改进项）
- `route-link-management.md` - REQ-AI-06 统一路由链接管理（待审阅）
- `agent-navigation-context-capabilities.md` - Agent 与导航上下文能力的总需求
- `deepseek-api-integration.md` - REQ-AI-15 DeepSeek API 集成（已完成）
- `route-context-for-llm.md` - REQ-AI-14 路由上下文传递至 LLM（已完成）
- `remove-navigation-fallback.md` - 移除导航 fallback key / fallback node 自动回退能力

### 导航 & 布局

- `cnap2-application-layout-navigation.md` - CNAP 2.0 应用外壳和导航交互实现需求
- `cnap2-sidebar-navigation-mvp.md` - CNAP 2.0 导航系统 MVP
- `cnap2-breadcrumb-context-selectors.md` - CNAP 2.0 面包屑账号/应用/环境下拉 UI 与交互需求
- `cnap2-cluster-selector.md` - CNAP 2.0 集群选择器（面包屑第 4 维度）

### 工作负载（Workloads）

- `workloads-page.md` — 工作负载页面（父需求）
  - 子需求 1：整体页面布局 + 标题栏 + 概览卡片 + 批量操作栏壳子
  - 子需求 2+3：Pod 列表内容区域 → `pod-list-content-area.md`
- `pod-list-content-area.md` — Pod 列表内容区域（workloads-page 子需求 2+3）
  - `pod-detail-drawer.md` — Pod 详情抽屉（从 Pod 列表操作列"详情"打开）
  - `batch-pod-delete-rebuild-dialog.md` — 批量删除/重建 Pod 弹窗（从 Pod 列表批量操作打开）
  - `batch-restart-pod-modal.md` — 批量重启 Pod 弹窗（从 Pod 列表批量操作打开）
- `app-restart-modal.md` — 重启弹窗（从 workloads-page 标题栏操作按钮打开）
- `horizontal-scale-dialog.md` — 横向扩缩弹窗（从 workloads-page 标题栏操作按钮打开）
- `vertical-scale-dialog.md` — 纵向扩缩弹窗（从 workloads-page 标题栏操作按钮打开）
- `delete-deployment-resource-dialog.md` — 删除部署资源弹窗（从 workloads-page "更多"下拉打开）

### 组件规范工具

- `cnap2-component-playground.md` — 组件视觉规范 Playground（批量核验被改造 token / 全局样式的 antd 组件）
