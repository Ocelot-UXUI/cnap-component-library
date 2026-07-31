# App Overview

## Purpose

Stable app-layer baseline for CNAP 前端控制台.

## Application Identity

- **Name**: CNAP (Cloud Native Application Platform) 控制台
- **Type**: 单页 Web 应用 (SPA)，内嵌于百度 iCloud 平台
- **Basename**: `/devops/cnap`
- **Primary Users**: 百度内部开发者、DevOps 工程师
- **Key Capability**: 内建 AI Agent 系统，支持通过自然语言驱动页面操作

## App Surfaces

### 1. 全局外壳 (AppLayout)

- 顶栏：logo、搜索入口、页面面包屑、用户头像下拉
- 可折叠侧边栏/移动端抽屉菜单
- 侧边栏菜单项: 首页、应用管理、部署、环境、集群、账号、流水线、AI 助手、收藏、最近访问、设置
- AppLayout 的 WorkspaceLayout 使用水平布局承接一级导航、二级导航和内容区；WorkspaceContentLayout 作为 flex 剩余空间承载路由页面，不再通过 fixed 和手算 left 定位
- WorkspaceContentLayout 负责路由页面内容区的默认内边距、滚动画布和内容区背景；内容区间隙只由内层 padding 承担，按视觉稿使用上下 24px、左右 32px，具体页面只负责卡片、表格、筛选器、表单等局部排布
- 标准路由页面不再自带页面级 padding/background wrapper；如 AIChat 这类沉浸式页面需要 full-bleed，应在 WorkspaceContentLayout 的路由级规则中声明例外，而不是在页面内用负 margin 抵消全局内边距

### 2. 主要页面

| 页面         | 路由                                  | 说明                            |
| ------------ | ------------------------------------- | ------------------------------- |
| 应用列表     | `/applications`                       | 应用的 CRUD 管理入口            |
| 应用详情     | `/applications/:appId/overview`       | 应用概览，含子 Tab 导航         |
| 应用部署     | `/applications/:appId/deployments`    | 部署管理                        |
| 应用运行配置 | `/applications/:appId/runtime-config` | CNAP 2.0 运行配置               |
| 应用启动配置 | `/applications/:appId/startup-config` | CNAP 2.0 启动配置 (scheme 驱动) |
| 应用设置     | `/applications/:appId/settings`       | 应用级别设置                    |
| 账号管理     | `/accounts`                           | 账号 CRUD                       |
| 环境管理     | `/environments`                       | 环境 CRUD                       |
| 集群管理     | `/clusters`                           | 集群 CRUD                       |
| 流水线       | `/pipelines`                          | CI/CD 流水线                    |
| AI 对话      | `/ai-chat`                            | AI Agent 对话助手               |
| AI 调试      | `/ai-debug`                           | AI 执行器调试面板               |
| 首页         | `/home`                               | 仪表板                          |
| 设置         | `/settings`                           | 用户偏好设置                    |
| 收藏         | `/favorites`                          | 收藏的资源                      |
| 最近访问     | `/recent`                             | 最近访问的资源                  |
| 更新日志     | `/changelog`                          | 版本变更记录                    |

## Core Workflows

### AI Agent 工作流

1. 用户输入自然语言指令
2. AI 通过 SSE 流式响应返回 tool_calls
3. AIExecutorProvider 解析 tool_calls → TaskPlan
4. 逐步执行: navigate → input → action → wait
5. 执行结果反馈回 LLM 进行下一轮推理
6. 最多 5 轮循环

### 页面操作模式

- 所有交互组件通过 Semantic Locator 属性 (data-ai-*) 暴露给 AI
- AI 可通过 DOM 查询找到元素并模拟用户操作
- 高优先级操作通过 Capability 层直接调用业务函数

## Authentication

- 依赖百度 UUAP 统一认证平台
- 启动时调用 `/api/home/v2/login-info` 获取用户名
- iCloud 框架内优先使用框架注入的 `window.__icloud__.username`
- 会话超时时弹窗提示用户刷新

## Theme System

7 个预设主题，通过 ThemeContext 管理:

- blue (默认), linear, liquidGlass, pixelRetro, pinkCute, minimalist, luxuryGold
- 主题选择持久化到 localStorage
