# 2026-08-03-workloads-detail-optimizations Workloads 页面细节优化（版本截断 / 弹窗默认选择 / Group 操作列表）

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-08-03（独立 draft review 通过 → 实现 → 独立 closure audit 通过）
> Source: docs/design/workloads-page-optimizations.md（req 1、req 3、req 4）

## Current Baseline

- **版本展示**：`src/pages/Workloads/PodContentArea/podCells.tsx:27-39` 的 `renderName` 在 detailed 模式下将 `pod.version` 以 `v{version}` 内联展示，无长度截断，version 过长会撑破列宽。
- **弹窗 Group 默认选择**：三个操作弹窗 machine（`operations/restart/machine.ts`、`operations/verticalScale/machine.ts`、`operations/horizontalScale/machine.ts`）在 `loadingGroups.onDone` 用 guard `!!context.groupId` 决定是否进入 `loadingWorkloads`；无 `defaultGroupId` 时停在 `ready`，Group 未选中。
- **弹窗容器默认选择**：`loadingWorkloads.onDone` 固定取 `containerNames[0]` 作为 `container`，不区分容器类型。
- **容器类型数据**：`RuntimeWorkloadContainer`（`src/interface/entities/workload.ts:105-111`）已含 `type: string`；`aggregateContainerNames`（`operations/shared/loader.ts:11-23`）当前仅返回 `string[]`，丢弃了 type。`WorkloadsBundle.containerNames` 为 `string[]`。
- **Group 操作列表**：`GroupHeader.buildMenu`（`PodContentArea/GroupHeader.tsx:38-49`）过滤 `targetKind === 'Workload' || 'None'`；`handleMenuClick`（:56-60）仅处理 `workload-yaml`，操作项点击无响应。`WorkloadsHeader.isHeaderOperation`（`WorkloadsHeader/index.tsx:36-38`）过滤 `targetKind === 'None' || 'Workload'`，两处都含 Workload。
- **操作数据源**：`useWorkloadsRuntime`（`useWorkloadsRuntime.ts:41`）经 `getOperations({ appEnvID })` 一次性拉全量操作，透传给每个 `PodGroupTable` → `GroupHeader`。
- **Workload 操作弹窗宿主**：目前仅 `WorkloadsHeader` 持有 `activeOp`/`activeOperationName` 并渲染 `WorkloadOperationModals`（`WorkloadsHeader/index.tsx:67-68,131-141`）。

## Goals

- req 1：Pod 名称列 version 超过 12 字符时按「前 5 + `...` + 后 4」截断展示，hover 显示完整 version。
- req 3：打开操作弹窗时 Group 默认选第一个（无 `defaultGroupId` 时），容器默认选 `type === 'MAIN'` 的容器。
- req 4：Workload Group 右上角操作列表展示 `targetKind === 'Workload'` 的操作；点击后打开对应弹窗并带入该 Group 的 `id` 作为 `defaultGroupId`。

## Non-Goals

- 不涉及 req 2（Drawer 操作列表 + 独立页面）及其前置的全局弹窗/抽屉机制（见另两份计划）。
- 不改动后端接口契约（req 3 的 `type` 字段、req 4 的 `/runtime/operations` 均已具备）。
- 不重构 Pod 行内/批量操作弹窗宿主。

## Task Route

- Type: app-layer design change / implementation-only change
- Owner Docs: docs/design/workloads-page-optimizations.md、docs/design/runtime-operation-capability-name-separation.md

## Execution Plan

### Phase 1 - Pod 版本号截断（req 1）

Status: completed

- Add：在 `podCells.tsx` 组件外新增纯函数 `truncateVersion(version: string)`，`length > 12` 返回 `slice(0,5)+'...'+slice(-4)`，否则原样返回。Skill: none
- Fix：`renderName` 中 version 文本改为截断展示；仅当发生截断时用 `Tooltip` 包裹显示完整 version。Skill: none
- Proof：若 `podCells` 已有测试文件则补 `truncateVersion` 单测（边界：12、13、超长）；否则在 `yarn start` 手动验证长/短 version 两种表现。

[x] Exit Criteria:

- 长 version 截断为 12 字符含省略号，hover 显示完整值；短 version 无 Tooltip、原样显示
- `yarn lint-type` 与 `yarn lint` 通过
- [x] `docs/logs/` updated

### Phase 2 - 操作弹窗 Group/容器默认选择（req 3）

Status: completed

- Fix：`aggregateContainerNames`（`loader.ts`）返回类型由 `string[]` 改为 `{ name: string; type: string }[]`，保留 type；`WorkloadsBundle.containerNames` 类型同步。Skill: none
- Fix：三个 machine 的 `loadingGroups.onDone` 增加分支——无 `context.groupId` 时取 `event.output[0]?.id` 作为默认 Group 并进入 `loadingWorkloads`。Skill: none
- Fix：三个 machine 的 `loadingWorkloads.onDone` 容器选择由 `[0]` 改为优先 `type === 'MAIN'`，无 MAIN 时 fallback 第一个。Skill: none
- Fix：三个 Modal 组件的容器 `<Select>` options 适配 `{ name, type }` 结构（label/value 用 name）。Skill: none
- Decision：MAIN 容器缺失时的兜底为「取第一个容器」。备选：不选中留空。选取前者以保证弹窗可直接提交，风险低。
- Proof：`yarn start` 手动验证——无 `defaultGroupId` 打开弹窗时 Group 落到第一个、容器落到 MAIN；含多容器且无 MAIN 时落到第一个。

[x] Exit Criteria:

- 三个弹窗（Restart / VerticalScale / HorizontalScale）默认选择行为一致且符合规则
- `yarn lint-type` 通过（返回类型变更无残留 `string[]` 假设）
- [x] `docs/logs/` updated

### Phase 3 - Workload Group 操作列表与弹窗传参（req 4）

Status: completed

- Fix：`GroupHeader.buildMenu` 过滤条件改为仅 `targetKind === 'Workload'`；保留末尾「工作负载 YAML」项。Skill: none
- Fix：`WorkloadsHeader.isHeaderOperation` 过滤条件改为仅 `targetKind === 'None'`。Skill: none
- Add：`GroupHeader` 新增 `onWorkloadOperation(operation)` 回调；`handleMenuClick` 命中 operation `name` 时调用之。回调经 `PodGroupTable` → `PodContentArea` 上传。Skill: none
- Add：为「从 Group 触发 Workload 操作弹窗」提供宿主，打开时传入 `defaultGroupId = group.id`。Skill: none
- Decision：Workload 操作弹窗宿主归属。方案 A：`PodContentArea` 自持一份 `WorkloadOperationModals`；方案 B：提升到 `Workloads/index.tsx` 与 Header 共享。选 A（降低跨组件耦合，改动内聚于 PodContentArea）；剩余风险：Header 与 Group 两处各持状态，后续若接入全局机制（Plan B）再统一。
- Proof：`yarn start` 手动验证——Group 下拉仅显示 Workload 操作；点击某操作打开对应弹窗且 Group 预选为当前 Group；Header 操作栏不再重复显示 Workload 操作。

[x] Exit Criteria:

- Group 操作列表与 Header 操作栏按 `targetKind` 正确分离，无重复
- Group 操作点击打开弹窗且默认带入该 Group
- `yarn lint-type` 与 `yarn lint` 通过
- [x] `docs/logs/` updated

## Closure Gates

- [x] in-scope behavior is complete（req 1/3/4 三阶段 Exit Criteria 全部 `[x]`）
- [x] relevant docs are aligned（design doc 与本计划状态一致）
- [x] verification has run（`yarn lint-type`、`yarn lint`、`yarn test`）
- [x] closure audit was independent

## Closure

> Closed: 2026-08-03 · Independent closure audit: PASS（实现实质与验证）· Auditor: 独立子代理（非实现方）

- req 1/3/4 的 live behavior 与 design doc 一致，独立审计逐文件核实（截断规则、MAIN 容器选择+fallback、Group 自动选择分支、`targetKind` 过滤拆分、`defaultGroupId` 透传链路）。
- 验证：`yarn lint-type` 通过（0 error）；变更涉及测试全绿（三个 `operations/*/__tests__/rows.test.ts` + `truncateVersion.test.ts`）；`yarn lint` 无新增 error（4 个预存 error 全在未改动文件）。独立审计复跑三条命令结论一致，未发现被掩盖的失败。
- 全量 `yarn test`：7 个测试文件失败（3 个套件级 axios Network Error + 4 个断言失败，共 6 例）+ 4 个 unhandled error（jsdom 缺 `ResizeObserver`），全部位于未改动模块或环境问题（navigation-context accountId、sidebar url、GPU 合并），与本切片无关。
- 残留风险（已接受）：
  - `PodContentArea/index.tsx`（约 177 行）及三个 operation machine 触发 eslint max-lines 警告；与仓库既有 max-lines 警告基线（MountVolumeList/ResourceLimit 等）同类，非阻塞。接入 Plan B 时可顺带把 workload-modal 宿主抽为 hook 拆分。
  - `WorkloadsHeader` 的 `WorkloadOperationModals` 宿主在本切片后对 Workload 操作不可达（仅 `None` 操作留在 Header，且当前无 None 弹窗能力）——为 Phase 3 方案 A 的既定取舍，待 Plan B 统一全局机制时清理。
- 代码变更尚未提交（working tree）；提交由用户决定，提交时应与本 plan/log 一并提交以保持记录一致。
