# 2026-07-25-workload-batch-operations 工作负载页批量操作栏 + 批量 Pod 弹窗

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-25
> Draft Review: 2026-07-25 独立审计（General subagent）PASS-WITH-NOTES；2 项 Blocking（批量重启部分失败、selections 下拉与对象 map 同步）与建议已在本版闭环
> Closure Audit: 2026-07-25 独立关闭审计（General subagent）PASS，无 Blocking
> Source: docs/requirements/batch-action-bar.md + batch-restart-pod-modal.md + batch-pod-delete-rebuild-dialog.md + batch-pod-force-delete-dialog.md + workloads-page.md（子需求 3 — H 区业务逻辑）

## Current Baseline

- H 区 `BatchActionBar`（`src/pages/Workloads/BatchActionBar/index.tsx`）当前仅展示"已选择 N 个实例"，无操作按钮；`Workloads/index.tsx` 由 `selectedCount>0` 经 `AnimatePresence` 浮现该栏。
- `PodContentArea`（`index.tsx`）持有选中态 `selection: Record<groupId, string[]>`（键为 `${clusterId}/${name}`），仅上报 `totalSelected` 计数；**未保留所选 Pod 对象**（无 operations/workloadName/status）。`PodGroupTable` 用 antd `rowSelection.onChange(keys)` 回填。
- `selection.ts` 提供 `podKey` / `setGroupSelection` / `totalSelected`（纯逻辑）。
- API 封装已就绪，本切片直接使用、无契约变更：
  - `runtimeOperationApi.restartPod({appEnvID, targets[], clusters[{clusterId,maxUnavailable}], exitTimeoutSeconds})`（`pod.restart`）。
  - `runtimeOperationApi.deletePod({appEnvID, targets[], force?})`（`pod.delete` / `force=true`→`pod.delete-force`）。
  - `runtimeResourceApi.getWorkloadGroups` / `getRuntimeWorkloads`（集群参数数据链）。
- `Pod` 实体含 `operations: PodOperation[]`（capability/disabled/reason）、`workloadName`、`clusterName`、`clusterId`、`name`、`status`。
- 已有可复用件：重启弹窗 `operations/restart/`（结构参考）、`operations/shared/loader.ts`（loadWorkloads = getRuntimeWorkloads + 容器聚合）、Pod 状态映射 `PodContentArea/podStatus.ts`。

## Goals

- H 区 `BatchActionBar` 落地业务内容：跨组累计计数、5 个固定顺序按钮（重启 / 删除重建 / 屏蔽 / 解除屏蔽 / [分隔线] 强制删除）、关闭按钮；按钮启用/禁用态由所选 Pod 的 `operations` 按 capability 聚合决定，置灰 hover 显示原因；强制删除危险样式。
- 选中态携带 Pod 对象（跨组、跨页累计），供批量栏聚合与各弹窗带入。
- 三个批量弹窗可用并满足各自需求可测标准：批量重启（`restartPod`）、批量删除重建（`deletePod`）、批量强制删除（`deletePod force`）。
- 屏蔽 / 解除屏蔽按钮：本期**占位**（渲染 + 按 operations 置灰，点击暂不触发弹窗，后端能力/弹窗待补充）。

## Non-Goals

- 屏蔽 / 解除屏蔽的弹窗与提交（后端能力未就绪，按需求占位）。
- 批量操作进度追踪 / 轮询 / 撤销回滚 / 审计。
- Pod 行内单个操作的业务逻辑；Tab C / 底部栏 G / Pod 详情抽屉。
- "查看执行详情"链接真实跳转（文字占位）。
- **批量重启"部分集群失败"的行级失败详情 UI**：`restartPod` 为异步订单创建（订单生成即提交成功，与其余操作弹窗一致），逐集群执行结果为异步状态，触发响应不表达；本切片仅区分"提交成功/提交失败"，部分失败详情随执行状态追踪切片后置（已同步更新 `batch-restart-pod-modal.md`）。
- 修改 `runtimeOperation` / `runtimeResource` / `pod` 契约。

## Task Route

- Type: implementation-only change（需求定稿、API 与实体就绪、无契约变更）
- Owner Docs: 上述 4 份 batch 需求 + `workloads-page.md` + `docs/design/design-tokens.md`
- 关联真源：`docs/input/source-api-runtime-workloads.md`

## Design Notes（影响范围的关键决策）

- **选中态携带 Pod 对象**：`selection.ts` 由 `Record<groupId,string[]>` 升级为 `Record<podKey, Pod>` 累计 map（跨组跨页持久）。`PodGroupTable` 保留 antd 内置 `rowSelection.selections` 下拉（全选本页/反选/取消），并用 `onChange(keys, rows)` + `preserveSelectedRowKeys` 上报；`PodContentArea` 按组 reconcile：`该组新 map = (旧 map 中 key∈keys 的已知对象) ∪ rows`（rows 提供当前页真实对象、旧 map 兜底跨页保留的对象），从而兼容内置 selections 下拉（其只触发 onChange，不触发 onSelect/onSelectAll）。
- **数据链匹配键**：`useClusterParams` 用 Pod.`workloadName` 匹配 `WorkloadGroup.workloads[].name` 求 groupId（非 `WorkloadGroup.name`），再 `getRuntimeWorkloads(groupId)` 按 `clusterId` 取参数。
- **弹窗 Pod 预览数据源**：直接用批量栏带入的已选 Pod 对象（含 name/workloadName/clusterName/status），不再二次 `getPods()`（需求 Implementation Notes 为参考，携带对象等价且更省一次请求）。
- **暖色提示 token**：温馨提示 / Alert 暖底走 `semantic.state.warning.light`（= `#FFF3E0`），不写 hex。
- **按钮聚合纯逻辑**：`batchActions.ts` 定义 5 按钮常量（capability + 展示名 + danger 标记）与 `aggregateAction(pods, capability) → {enabled, reason}`（任一 Pod 缺该能力→兜底文案；任一 disabled→取其 reason 聚合去重）。
- **集群参数数据链**：三弹窗共用 hook `useClusterParams(appEnvID, pods)`：Pod.workloadName → getWorkloadGroups 匹配 groupId → getRuntimeWorkloads(groupId) → 按 clusterId 取 `updateStrategy`/`availabilityTarget`；跨组多次拉取合并。
- **弹窗组件**：`operations/batchRestart/`、`operations/batchDelete/`（删除重建 + 强制删除，按需求"复制为起点"以两个薄组件复用同一只读布局子组件 `PodPreviewTable` + `ClusterParamsTable`，文案/接口/force 作差异参数）。文件均 ≤150 行。

## Execution Plan

### Phase 1 - 选中态携带 Pod 对象 + 批量按钮聚合逻辑（Add/Fix）

Status: done

- Fix：`selection.ts` 改为 `SelectedPods = Record<podKey, Pod>`；提供 `addPods/removePods/removeByKeys/toKeys/toList/totalSelected`（纯逻辑）。Skill: none
- Fix：`PodGroupTable` 保留内置 selections 下拉，改用 `onChange(keys, rows)` + `preserveSelectedRowKeys` 上报；`PodContentArea` 持有 `SelectedPods`，按组 reconcile 后 `onSelectionChange(pods)`（替换仅计数）。Skill: none
- Add：`batchActions.ts` — 5 按钮常量 + `aggregateAction(pods, capability)` 聚合启用/禁用与原因。Skill: none
- Decision：选中态由 key 升级为携带 Pod 对象（map）。理由：批量栏聚合与弹窗带入需要 operations/workloadName/status。备选（继续仅存 key，用时反查）拒绝——跨页/跨组 Pod 已不在当前 dataSource，无法反查。采用 `onChange+preserveSelectedRowKeys+reconcile` 而非 `onSelect/onSelectAll`，以兼容内置 selections 下拉（仅触发 onChange）。剩余风险：低（内部状态，无对外契约）。Skill: none
- Decision：禁用原因聚合采用方案 A（多 Pod 不同 reason 去重后逐条列出）。备选 B（首条+等N条）/C（仅首条）拒绝——信息不完整。剩余风险：极端多原因时 Tooltip 偏长，可接受。Skill: none
- Proof：`selection.ts` 与 `batchActions.ts` 纯逻辑单测（增删/跨组累计、缺能力兜底、disabled 原因聚合去重、全可用）。Skill: none

[x] Exit Criteria:

- [x] 选中态携带 Pod 对象，跨组/跨页累计正确
- [x] 聚合逻辑有单测
- [x] `yarn lint-type` / `yarn test` 通过
- [x] `docs/logs/` updated

### Phase 2 - BatchActionBar 业务内容（Add）

Status: done

- Add：替换占位为业务栏——计数 + 5 固定按钮（图标+文字，禁用置灰 + Tooltip 原因，强制删除红字 + 左分隔线）+ 关闭按钮（清空选中）。点击可用按钮路由到对应弹窗（重启/删除重建/强制删除）；屏蔽/解除屏蔽占位。保留 `AnimatePresence` 显隐。Skill: none
- Fix：`Workloads/index.tsx` 由选中 Pod 列表（>0）驱动显隐并把所选 Pod 传入栏与弹窗；关闭/提交成功后清空选中。Skill: none
- Proof：聚合驱动的启用/禁用已由 Phase 1 单测覆盖；此阶段以类型 + 构建为准。Skill: none

[x] Exit Criteria:

- [x] 选中≥1 浮现、=0 消失、关闭按钮清空；计数跨组实时
- [x] 5 按钮固定顺序渲染，operations 仅决定启用/禁用；置灰 Tooltip 原因；强制删除危险样式
- [x] 可用"重启/删除重建/强制删除"点击打开对应弹窗；屏蔽/解除屏蔽占位不报错
- [x] design tokens（无 hex）
- [x] `docs/logs/` updated

### Phase 3 - 集群参数数据链 + 批量重启弹窗（Add）

Status: done

- Add：`operations/batch/useClusterParams.ts`（Pod[] → 集群去重 + 每集群 Workload 参数；loading/error/降级）+ 只读 `PodPreviewTable` / `ClusterParamsTable` 子组件。Skill: none
- Add：`operations/batchRestart/BatchRestartPodModal`（800×756、温馨提示、超时时间 5~3600 默认 60、待重启 Pod 预览、集群参数含可编辑最大不可用 1%~100%、可用度为空显示"未启用"、提交 `restartPod`；成功提示含"查看执行详情"占位；提交成功/失败二态，不含部分失败 UI）。Skill: none
- Proof：最大不可用/超时校验 + 选中 Pod/集群 → `restartPod` 入参映射纯逻辑单测。Skill: none

[x] Exit Criteria:

- [x] 批量重启弹窗行为落地（Pod 预览、集群参数数据链、校验、提交、成功/失败）
- [x] 参数映射有单测
- [x] `docs/logs/` updated

### Phase 4 - 批量删除重建 + 强制删除弹窗（Add）

Status: done

- Add：`operations/batchDelete/BatchPodDeleteRebuildModal`（宽 800 高度自适应、Alert warning、只读 Pod 预览 + 只读集群参数、Evicted 状态 Tag、提交 `deletePod({force:false})`）。Skill: none
- Add：`operations/batchDelete/BatchPodForceDeleteModal`（宽 800 高度自适应，复用只读布局，文案/标题差异，提交 `deletePod({force:true})`）。Skill: none
- Proof：选中 Pod → `deletePod` targets 映射 + force 标记单测；`podStatus` 的 `Evicted → 已驱逐` 映射校验。Skill: none

[x] Exit Criteria:

- [x] 两弹窗行为落地（只读预览/参数、Evicted Tag、提交、成功/失败、权限提示）
- [x] 映射有单测
- [x] `docs/logs/` updated

### Phase 5 - 验证与收口（Proof）

Status: done

- Proof：`yarn lint-type` / `yarn lint`（新增文件无告警）/ `yarn test` / `yarn build`。Skill: none
- Fix：4 份 batch 需求状态 → 已实现（屏蔽/解除屏蔽标注占位）；`docs/logs/2026/07-25.md` 追加记录。Skill: none

[x] Exit Criteria:

- [x] 四项验证通过
- [x] 需求状态与日志一致
- [x] `docs/logs/` updated

## Closure Gates

- [x] in-scope behavior is complete（批量栏 + 三弹窗按需求可测标准落地；屏蔽/解除屏蔽占位）
- [x] relevant docs are aligned（需求状态 + plan/log 一致）
- [x] verification has run（lint-type / lint / test / build）
- [x] closure audit was independent（2026-07-25 General subagent PASS，无阻塞项）

## Risks & Open Questions

- **单 plan 覆盖批量栏 + 3 弹窗**：同一结果面（H 区批量操作），按 Phase 分段验证；沿用前两切片的单 plan + 末尾一次提交节奏。
- **选中态模型变更**：由 key 升级为携带 Pod 对象，触及 `selection.ts` / `PodGroupTable` / `PodContentArea` / `Workloads/index.tsx`；为内部状态，无对外契约变更。
- **禁用原因聚合**（batch-action-bar Open Q1）：采用方案 A（去重逐条），非阻塞。
- **屏蔽/解除屏蔽占位**（Open Q2）：点击暂不触发弹窗，后端能力就绪后补充。
- **集群参数跨组多次请求**：所选 Pod 跨组时并发 getRuntimeWorkloads；按需触发、失败降级。
- 本 plan 已由独立 draft review 收敛为 `planned`（2026-07-25）；关闭前需 independent closure audit。
