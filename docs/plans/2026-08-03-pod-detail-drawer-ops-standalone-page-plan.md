# 2026-08-03-pod-detail-drawer-ops-standalone-page Pod 详情 Drawer 操作列表与独立页面

> Plan Status: proposed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-08-03
> Source: docs/design/workloads-page-optimizations.md（req 2）

## Depends On

- `docs/plans/2026-08-03-global-modal-drawer-registry-plan.md`（前置：全局弹窗/抽屉机制）。本计划 Phase 1、Phase 3 依赖其提供的 `openModal` 调用能力；在前置计划关闭前，本计划保持 `proposed`，不得进入实现关闭。

## Current Baseline

- **Drawer extra**：`src/pages/Workloads/PodContentArea/PodDetailDrawer/index.tsx:90` 的 `extra` 仅渲染一个 `Standalone` 图标按钮，**无 `onClick`**（死按钮）。Drawer 已有 `appEnvID`、`clusterId`、`podName` props（:43-49）。
- **操作渲染**：`renderOperations(pod, onOperation)`（`PodContentArea/podCells.tsx:101-134`）依据 `pod.operations` 渲染动态操作按钮，目前仅被 Pod 表格操作列使用。
- **详情内容**：Drawer body 由 `OwnershipRow` + `BasicInfoCard` + `ContainerArea` 组成（`PodDetailDrawer/index.tsx:101-119`），详情数据经 `runtimeResourceApi.getPodDetail` + `getPodDetailUsage` 获取；返回的 `Pod` 含 `operations?: PodOperation[]`（`pod.ts:197`）。
- **路由**：`src/routers/index.tsx:153-156` 仅有扁平路由 `workloads`（`lazy` + `withSuspense`，:33,59-63）；无 Pod 详情子路由。`APP_BASENAME = '/devops/cnap'`（`src/constants/app.ts:17`）。代码库无 `window.open` 先例，`Standalone` 图标在 3 处均为死按钮。
- **弹窗宿主局限**：Pod 操作弹窗当前挂在 `Workloads/index.tsx`，独立路由页面无法复用——正是前置计划要解决的问题。

## Goals

- Drawer 右上角 `extra` 展示该 Pod 操作列表（复用 `renderOperations`），与保留的 `Standalone` 按钮并排。
- 操作点击经全局机制（前置计划）打开对应 Pod 操作弹窗，Drawer 与独立页面行为一致。
- `Standalone` 按钮点击在新浏览器标签页打开独立 Pod 详情路由，单页面展示与 Drawer 相同的详情内容。
- 独立页面在 `AppLayout` 内渲染（保留顶导航与侧边栏），不渲染 `WorkloadsHeader`。

## Non-Goals

- 不实现全局弹窗/抽屉机制本身（见前置计划）。
- 不覆盖 req 1/3/4（见 workloads-detail-optimizations 计划）。
- 独立页面不引入独立的鉴权流程，沿用现有 `AppLayout` 会话上下文。

## Task Route

- Type: app-layer design change（新增路由 + 页面）
- Owner Docs: docs/design/workloads-page-optimizations.md、docs/context/codebase-map.md（新增页面/路由后更新）

## Execution Plan

### Phase 1 - Drawer 操作列表

Status: planned

- Add：`PodDetailDrawer` 的 `extra` 内以 `renderOperations(pod, onOperation)` 渲染操作列表，与 `Standalone` 按钮并排；Drawer 场景不含「详情 / 查看 YAML」前置按钮。Skill: none
- Fix：`renderOperations` 抽为可被表格与 Drawer 共用的公共入口（避免重复实现）。Skill: none
- Add：操作点击经前置计划的 `openModal` 打开对应 Pod 操作弹窗。Skill: none
- Proof：`yarn start` 手动验证——Drawer 操作列表与表格操作列表项一致；点击可打开对应弹窗。

[ ] Exit Criteria:

- Drawer `extra` 显示操作列表 + 保留 `Standalone` 按钮
- 操作触发的弹窗与表格入口一致（同一注册弹窗）
- `yarn lint-type` 通过
- [ ] `docs/logs/` updated

### Phase 2 - 独立 Pod 详情页面与路由

Status: planned

- Fix：将 Drawer 详情内容（`OwnershipRow` + `BasicInfoCard` + `ContainerArea` 及数据获取）抽为可独立于 Drawer 渲染的共享内容组件，供 Drawer 与独立页面共用。Skill: none
- Add：新增 `src/pages/Workloads/PodDetailPage/`，以全页面布局承载共享详情内容，右上角复用同一 `renderOperations`。Skill: none
- Add：在 `src/routers/index.tsx` 注册独立路由（如 `workloads/pods/:appEnvID/:clusterId/:podName`），`lazy` + `withSuspense`，位于 `AppLayout` 下、不含 `WorkloadsHeader`。Skill: none
- Decision：独立页面在 `AppLayout` 内渲染（保留顶导航/侧边栏），不渲染 `WorkloadsHeader`。备选：全裸页面（否决，丢失导航一致性）。已由需求方确认。
- Proof：`yarn start` 直接访问独立路由 URL，详情内容与 Drawer 一致渲染。

[ ] Exit Criteria:

- 独立路由可直接访问并渲染完整 Pod 详情
- Drawer 与独立页面共用同一详情内容组件，无重复实现
- `yarn lint-type` 通过
- [ ] `docs/context/codebase-map.md` 与 `docs/logs/` updated

### Phase 3 - Standalone 按钮新页面打开

Status: planned

- Add：`Standalone` 按钮 `onClick` 用 `appEnvID`/`clusterId`/`podName` 构建独立路由 URL 并 `window.open(url, '_blank')`（`podName` 需 `encodeURIComponent`）。Skill: none
- Proof：`yarn start` 从 Drawer 点击 `Standalone`，新标签页打开对应 Pod 独立详情页；操作列表在独立页面可正常打开弹窗（依赖前置计划）。

[ ] Exit Criteria:

- `Standalone` 按钮在新标签页打开正确 Pod 详情
- 独立页面操作列表可经全局机制打开弹窗
- `yarn lint-type` 与 `yarn lint` 通过
- [ ] `docs/logs/` updated

## Closure Gates

- [ ] 前置计划（全局机制）已关闭
- [ ] in-scope behavior is complete（三阶段 Exit Criteria 全部 `[x]`）
- [ ] relevant docs are aligned（design doc、codebase-map、本计划一致）
- [ ] verification has run（`yarn lint-type`、`yarn lint`）
- [ ] closure audit was independent
