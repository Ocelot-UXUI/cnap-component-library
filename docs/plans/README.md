# Plans Index

使用此目录存放非平凡实现计划。

- 从 `00-plan-authoring-and-execution-guide.md` 开始
- 每个计划聚焦一个结果面
- 按状态归档或替换计划，而不是通过删除历史
- 小中型项目优先使用 `docs/plans/YYYY-MM-DD-topic-plan.md`

每个创建的 plan 在实现前需要独立审查，在完成前需要独立关闭审计。

推荐文件名:

- `2026-06-10-cnap-runtime-config-plan.md`
- `2026-06-10-pipeline-management-plan.md`

## Active Plans

- `2026-08-03-workloads-detail-optimizations-plan.md` - proposed; Workloads 细节优化（版本截断 / 弹窗默认选择 / Group 操作列表），req 1+3+4
- `2026-08-03-global-modal-drawer-registry-plan.md` - proposed; 全局弹窗/抽屉注册与调用机制（req 2 前置）
- `2026-08-03-pod-detail-drawer-ops-standalone-page-plan.md` - proposed; Pod 详情 Drawer 操作列表 + 独立页面（req 2，依赖全局机制）
- `2026-07-25-cnap2-cluster-selector-plan.md` - planned; 集群选择器 + appEnvID 解析贯通（分阶段授权：P1-2 可启动，P3-5 gated 于评审门）
- `2026-07-24-workload-domain-model-vertical-scale-pilot-plan.md` - partially completed; Workload 领域模型（纵向扩缩试点），待独立关闭审计
- `2026-07-02-cnap2-application-layout-navigation-plan.md` - in progress; CNAP 2.0 应用外壳和导航交互实现
- `2026-07-03-cnap2-breadcrumb-context-selectors-plan.md` - in progress; CNAP 2.0 面包屑账号/应用/环境选择器实现计划

## Completed Plans

- `2026-07-01-agent-navigation-context-capabilities-plan.md` - completed; Agent 导航上下文能力
- `2026-07-01-mock-navigation-context-api-plan.md` - completed; 导航上下文 Mock 接口
- `2026-06-30-remove-navigation-fallback-plan.md` - completed; 移除导航 fallback 自动回退
