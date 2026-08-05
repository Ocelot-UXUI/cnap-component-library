# 2026-08-05-horizontal-scale-remove-container-selector 横向扩缩去除容器选择器 + 共享选择器重构

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-08-05（实现完成 → 独立 closure audit 通过）
> Source: 用户请求（横向扩缩弹窗去除容器选择器，并重构三弹窗共用的选择器复用代码）

## Current Baseline

- **共享选择器**：`operations/shared/WorkloadContainerSelector/index.tsx` 渲染「工作负载 + 容器」两个 `Form.Item`，由纵向扩缩 / 横向扩缩 / 重启三个弹窗共用（`VerticalScaleModal/index.tsx:6,83`、`HorizontalScaleModal/index.tsx:6,83`、`RestartModal/index.tsx:6,97`）。
- **横向扩缩里容器的实际作用**：容器仅用于「过滤集群行」，不进入 API。`horizontalScale/rows.ts:26-41` 的 `buildRows(workloads, container)` 用 `w.podContainers.some(c => c.name === container)` 过滤；`toHorizontalScaleTargets`（:73-82）提交 target 已不含 `container`。
- **横向扩缩 machine**：`horizontalScale/machine.ts` context 持有 `containerNames`、`container`（:20-21）；`loadingWorkloads.onDone` 计算 MAIN 容器并 `buildRows(workloads, container)`（:104-115）；`ready` 上有 `SELECT_CONTAINER` 事件重建行（:126-131）。
- **对比（保持不变）**：重启的 target 含 `container`（restart 提交依赖容器），纵向扩缩按容器读取资源规格，两者仍需容器选择。
- **测试**：`horizontalScale/__tests__/rows.test.ts` 覆盖 `buildRows` 的容器过滤行为。

## Goals

- 横向扩缩弹窗不再显示容器选择器，仅保留「工作负载」选择（在弹窗内内联实现，不新建组件）。
- 保留横向扩缩现有 XState machine 架构（与纵向/重启一致），仅剥离容器相关状态/事件/过滤，不改写为组件内自管理。
- 改动完全隔离在横向扩缩自有文件内，不触碰任何共享模块，确保纵向扩缩 / 重启零影响。

## Non-Goals

- 不改动纵向扩缩、重启的容器选择行为与提交契约。
- 不改动 `runtimeOperation` 的 `horizontalScale` API 契约（本就不含 container）。
- 不改动 `shared/loader.ts` 的 `loadGroups`/`loadWorkloads`/`aggregateContainerNames`（继续返回 `containerNames`，横向侧忽略即可）。
- 不改动 `shared/WorkloadContainerSelector`（保留给纵向/重启原样使用；横向改为弹窗内联工作负载 Select，不新建 `WorkloadSelector` 组件）。
- 不将横向扩缩改写为组件内 useState/useEffect 自管理（保留 machine 架构）。

## Task Route

- Type: app-layer design change / implementation-only change（跨横向扩缩模块 + 共享组件，影响多个弹窗调用点）
- Owner Docs: docs/design/workloads-page-optimizations.md（操作弹窗形态）、`operations/shared/*`
- 触发 Full plan 条件：改共享行为、跨模块、预计 >5 文件。

## Execution Plan

### Phase 1 - 横向扩缩弹窗内联工作负载选择（不动共享组件）

Status: completed

- Fix：`HorizontalScaleModal/index.tsx` 移除对 `WorkloadContainerSelector` 的引用，改为内联一个仅含「工作负载」`Form.Item + Select` 的表单，`value=context.groupId`、`onChange` 派发 `SELECT_GROUP`；删除容器相关传参与 `SELECT_CONTAINER` 派发。Skill: none
- Decision：选「弹窗内联工作负载 Select」而非「新建 `WorkloadSelector` + 重构 `WorkloadContainerSelector`」。理由：横向是唯一需要「无容器」形态的调用方，为单一消费者抽公共组件属过度抽象；内联仅重复约 8 行 `Select` 标记，成本低于维护新组件目录。关键收益：`WorkloadContainerSelector` 保持零改动，纵向/重启完全不受影响。剩余风险：与另两弹窗的工作负载 Select 存在极小重复，接受。
- Proof：`yarn lint-type` 通过；`yarn start` 目测纵向/重启弹窗表单形态与行为不变（仍「工作负载 + 容器」）。

[x] Exit Criteria:

- 横向扩缩弹窗只剩「工作负载」选择，不再 import `WorkloadContainerSelector`
- `WorkloadContainerSelector` 文件无改动；纵向扩缩 / 重启弹窗形态与行为不变
- `yarn lint-type` 通过
- [x] `docs/logs/` updated

### Phase 2 - 横向扩缩去除容器（machine / rows / 弹窗）

Status: completed

- Fix：`horizontalScale/rows.ts` — `buildRows(workloads)` 移除 `container` 形参与 `podContainers` 过滤，改为映射全部 workload；更新文件顶部与函数注释（去掉「以选中容器过滤」表述）。`toHorizontalScaleTargets` 无需改动。Skill: none
- Fix：`horizontalScale/machine.ts` — 从 context 删除 `containerNames`、`container`；删除 `SELECT_CONTAINER` 事件；`loadingWorkloads.onDone` 不再计算 MAIN 容器，直接 `buildRows(bundle.workloads)`；移除不再使用的 `ContainerOption` 导入（`WorkloadsBundle` 仍用于取 `workloads`）。Skill: none
- Fix：`HorizontalScaleModal/index.tsx` — 移除 `WorkloadContainerSelector`，内联仅含「工作负载」的 `Form.Item + Select`（`value=context.groupId`、`onChange` 派发 `SELECT_GROUP`）；删除容器相关传参与 `SELECT_CONTAINER` 派发。Skill: none
- Decision：去掉容器过滤后横向扩缩展示该 Group 下**全部集群工作负载**，而非「含 MAIN 容器」子集。理由：副本数是 workload 级属性，与容器无关，展示全量更契合语义；实际同一 Group 各集群 workload 容器集合通常一致，可见集合基本不变。剩余风险（已接受）：极端场景下某 workload 缺 MAIN 容器时，之前被隐藏、现在会出现——属预期修正。
- Proof：`yarn start` 手动验证——横向扩缩弹窗只剩「工作负载」选择，切换 Group 正常刷新集群表，勾选 + 改副本数 + 提交链路正常。

[x] Exit Criteria:

- 横向扩缩弹窗不再有容器选择器；Group 切换、集群勾选、副本数编辑、提交均正常
- machine 中无 `container`/`containerNames`/`SELECT_CONTAINER` 残留
- `yarn lint-type` 通过
- [x] `docs/logs/` updated

### Phase 3 - 测试与验证收敛

Status: completed

- Fix：`horizontalScale/__tests__/rows.test.ts` — 删除/改写依赖容器过滤的 `buildRows` 用例，补「返回全部 workload 行」断言；保留副本数校验、`toHorizontalScaleTargets` 用例。Skill: none
- Proof：`yarn test`（至少横向扩缩 rows 套件全绿）、`yarn lint-type`、`yarn lint` 无新增 error。
- Follow-up：如后续纵向 / 重启也需精简，可评估将容器 `Form.Item` 同样抽为 `ContainerSelector`；本计划不做。

[x] Exit Criteria:

- 横向扩缩 rows 测试与新行为一致且通过
- `yarn lint-type` / `yarn lint` 无新增 error
- [x] `docs/logs/` updated

## Closure Gates

- [x] in-scope behavior is complete
- [x] relevant docs are aligned
- [x] verification has run
- [x] closure audit was independent

## Closure

> Closed: 2026-08-05 · Independent closure audit: PASS · Auditor: 独立子代理（非实现方）

- 独立审计逐文件核实 6 项全 PASS：横向扩缩弹窗内联工作负载 Select 且无 `SELECT_CONTAINER`；machine/rows 无 `container`/`containerNames`/`ContainerOption`/过滤；测试改为「返回全部集群」。
- 非目标完整性：`shared/WorkloadContainerSelector` 与 `shared/loader.ts` 零改动（`git diff --stat` 中 `operations/**` 改动仅落在 `horizontalScale/`）；纵向扩缩 / 重启仍原样使用共享组件，契约与行为不变。
- 验证：`yarn lint-type` 通过（0 error）；`yarn test src/pages/Workloads/operations` 27/27 全绿（纵向 10 / 重启 8 无回归）；`yarn lint` 无新增问题（既有 4 error + 6 warning 全在未改动文件，horizontalScale/machine.ts 已不再触发 max-lines）。
- 残留（已接受）：行为上横向扩缩改为展示 Group 下全部集群工作负载（去容器过滤的预期修正）。
- 代码变更尚未提交；提交时应仅纳入横向扩缩 4 文件 + 本 plan/log，剔除工作区中与本计划无关的既存改动。
