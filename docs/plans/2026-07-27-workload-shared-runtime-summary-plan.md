# 2026-07-27-workload-shared-runtime-summary Workloads 运行时 summary 与分组选择共享化

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-27
> Source: request（用户提出 summary 数据上提共享 + 随分组选择联动）

## Current Baseline

- `WorkloadGroupSelector` 的 `groupId` 是 `WorkloadsHeader` 私有 local state（`src/pages/Workloads/WorkloadsHeader/index.tsx:64`），仅透传给操作弹窗；`appEnvID/clusterId` 变化时重置为 `undefined`（`:75-83`）。
- `getRuntimeSummary` 支持 `groupId` 入参（`src/api/runtimeResource.ts:89-96`），返回 `{ resourceRequirements, podStatistics }`。
- 该接口当前被请求两次：`ResourceCard` 经 `useRuntimeSummary` 取 `resourceRequirements`；`PodContentArea` 经 `usePodGroups` 取 `podStatistics`。
- `getWorkloadGroups`（仅接受 `appEnvID/clusterId`，不支持 `groupId`）与 `getOperations` 各被请求两次（`WorkloadsHeader` + `usePodGroups`）。
- `WorkloadsPage`（`src/pages/Workloads/index.tsx`）同级渲染 `WorkloadsHeader` / `WorkloadsOverview` / `PodContentArea`，三者之间无共享运行时状态。
- 项目已依赖 `constate@^4.0.0`，但 src 中尚无任何 constate 使用。

## Goals

- `groupId` 与运行时 `RuntimeSummary` 提升为 Workloads 页面级共享状态，`WorkloadsOverview`（含 `ResourceCard`）与 `PodContentArea` 共享同一份 summary。
- summary 随 `WorkloadGroupSelector` 选择变化：请求带上 `groupId`，`ResourceCard` 的 CPU/内存/GPU 与 `PodContentArea` 的快捷筛选计数/状态下拉均随组切换。
- `PodContentArea` 展示的 groups 按选中组做前端过滤（接口不支持 `groupId`，保留全量数据自行 `filter`）。
- 使用 constate 承载共享状态，去除对 `getRuntimeSummary` 的重复请求。

## Non-Goals

- 不改动 `getRuntimeSummary` / `getWorkloadGroups` 的后端契约。
- 不改动 Pod 行内/批量操作、`PodGroupTable` 内部的 `getPods` 分页与筛选逻辑。
- 不引入 region-react/jotai 等其它状态方案（本次统一用 constate）。
- 不做 UI 视觉改版；无新增样式 token。

## Task Route

- Type: app-layer design change（跨模块共享行为）
- Owner Docs: `docs/design/`（Workloads 运行时数据流）、`AGENTS.md`（状态/组件分层约定）、`docs/context/codebase-map.md`
- Skill: none

## Open Risks / Decisions

- Decision（已确认 2026-07-27）：`resourceRequirements` 随 `groupId` 缩放的产品语义与后端行为，用户已确认。ResourceCard 在选中组时展示该组资源。此前列为关闭前风险，现已消除。
- Decision（已确认）：groups 存在两义——选择器下拉必须吃**全量** groups，`PodContentArea` 展示的是**按 `groupId` 过滤后**的 groups；共享层只存全量，过滤在消费侧完成。
- Decision（已确认）：loading/error 不合并成单一门控——summary 与 groups 各自的加载态相互独立，避免一个慢请求阻塞另一区域。
- Decision（已确认）：状态方案用 constate 而非 XState。理由：groupId/summary 短期内不作为 AI 能力对外暴露，仅在 React/UI 层消费；XState 保留给需 React 外部/AI 可观测的状态。若日后需外露再重构为 XState。替代方案：直接上 XState actor（被否，短期无外露需求，成本更高）。剩余风险：constate→XState 迁移非机械替换。
- Decision（已确认）：此选择与既有 `docs/context/conventions.md` 的 "XState As Data Authority"（原文要求所有数据生命周期必须在 XState）冲突。已将该节改写为 "State Management: XState vs constate"，按"是否需 React 外部/AI 可观测"划分两套工具的适用边界。

## Execution Plan

### Phase 1 - 建立 constate 共享容器

Status: done

- Add: 新增 Workloads 运行时共享容器（constate），持有 `groupId` + `setGroupId`、全量 `groups`、原始 `RuntimeSummary`、`operations`，入参依赖 `appEnvID/clusterId/groupId`。
- Fix: 迁移并保留"切 `appEnvID/clusterId` 时重置 `groupId`"逻辑到共享层。
- Fix: 保留请求 `cancelled` 竞态守卫，`groupId` 变化时不被旧响应覆盖。
- Add: 在 `WorkloadsPage` 用 Provider 包裹三个子组件。
- Skill: none

[x] Exit Criteria:

- 共享容器可提供 `groupId`/`setGroupId`/全量 groups/summary/operations，且随三个依赖正确刷新。
- 切集群会重置选中组。

### Phase 2 - 接入消费方并去重

Status: done

- Fix: `WorkloadsHeader` 选择器改为消费共享 `groupId`/`setGroupId` 与全量 groups，删除其本地 `groupId` state 及本地 groups/operations 请求。
- Fix: `ResourceCard` 改为消费共享 summary 的 `resourceRequirements`，删除 `useRuntimeSummary`（整文件已移除）。
- Fix: `PodContentArea` 改为消费共享 summary 的 `podStatistics`、共享 operations，并对共享 groups 按 `groupId` 前端过滤；`usePodGroups` 已整体移除。
- Proof: `getRuntimeSummary` 全页仅一处发起；`getWorkloadGroups`/`getOperations` 收敛为一处。
- Skill: none

[x] Exit Criteria:

- 切换 `WorkloadGroupSelector` 时，资源卡、快捷筛选计数、展示的分组表同步联动（构建/类型通过；运行时联动待手动 QA）。
- 默认（未选组）行为与改造前一致（展示全量）。
- 重复请求已从代码层消除（三处 fetch 收敛到共享容器）。

### Phase 3 - 验证与文档

Status: done

- Proof: 已运行 `yarn lint-type`(pass)、`yarn build`(pass)、`yarn lint`、`yarn test`（见下方一致性说明）。
- Decision: 后端在传 `groupId` 时对 `resourceRequirements` 的缩放语义由用户确认；无本地 live 后端，运行时校验留待手动 QA。
- Add: 已改写 `docs/context/conventions.md` 状态管理边界；已追加 `docs/logs/2026/07-27.md`。（无 Workloads 运行时数据流独立 owner doc，架构性说明收敛于 conventions。）
- Skill: none

[x] Exit Criteria:

- lint-type / build 通过；lint / test 的失败项均为既有且与本次改动无关（日志已记录）。
- 文档已对齐。
- [x] `docs/logs/` updated

## Closure Gates

- [x] in-scope behavior is complete（共享 + 联动 + 前端过滤 + 去重）
- [x] `resourceRequirements` 随 `groupId` 的产品语义/后端行为已由用户确认（Open Risk 消除）
- [x] relevant docs are aligned（conventions 状态管理边界 + 日志）
- [x] verification has run（lint-type/build 通过；lint/test 仅存既有无关失败）
- [x] closure audit was independent（用户已完成运行时 QA 并确认关闭）
