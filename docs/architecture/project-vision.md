# Project Vision

## Purpose

描述 CNAP 前端项目的长期产品和工程方向。

## Product Goal

打造百度内部一站式的云原生应用管理控制台，让开发者和 DevOps 工程师能够：

- 以声明式方式管理应用的全生命周期
- 通过 AI Agent 自然语言交互完成日常操作
- 在统一的界面中管理多环境、多集群、多账户资源
- 接入云上百度生态（qiankun 微前端）

## Primary Users

- 百度内部开发者 — 日常应用部署、配置、调试
- DevOps 工程师 — 环境/集群/流水线管理
- 产品经理 — 通过 AI 助手快速查看应用状态

## Constraints That Must Stay True

- 必须在百度 iCloud 平台内以微前端方式运行 (`/devops/cnap`)
- 必须使用百度 UUAP 统一认证
- UI 组件必须使用 Ant Design 6.x
- AI Agent 的执行能力必须受限于 capabilities 层和页面可见区域
- 代码必须通过 TypeScript 严格类型检查

## Explicit Non-Goals

- 不替代百度内部已有的 CI/CD 流水线系统（仅做展示和触发）
- 不实现独立的用户权限管理系统（依赖 UUAP 和后端）
- 不支持离线模式
- 不支持移动端原生 App
- 不做数据分析和报表

## Success Criteria

- CNAP 2.0 运行配置和启动配置通过 scheme 驱动实现
- AI Agent 可完成常见页面操作（导航、创建、配置）的成功率 > 80%
- qiankun 微前端集成稳定运行于云上百度
- 所有页面通过 TypeScript 类型检查，无 any 类型滥用
