# 2026-07-31-runtime-operation-dynamic-name 运行时操作 name 动态化改造

> Plan Status: proposed
> Owner: <gitname>
> Last Reviewed: 2026-07-31
> Source: docs/design/runtime-operation-capability-name-separation.md（设计原则）+ 用户需求

## Current Baseline

- `src/api/runtimeOperation.ts` 导出 5 个业务包装函数（`restartWorkload` / `horizontalScale` / `verticalScale` / `restartPod` / `deletePod`），每个函数内部**硬编码**了 `operation` 字符串值（如 `'workload-restart'`, `'pod.restart'` 等）。
- Workload 级弹窗路由链路：`WorkloadsHeader.handleActionClick(operation)` → 仅提取 `operation.capability` 存入 state → `OperationModals` 按 capability 路由到弹窗 → 弹窗 **不接收** operation name → machine submit actor 调用 API 包装函数时使用硬编码值。
- Pod 级弹窗路由链路：`WorkloadsPage` 中 `setModal({ key, pods })` → 弹窗 **不接收** operation name → 组件内直接调用 API 包装函数使用硬编码值。
- 设计原则文档已落位：`docs/design/runtime-operation-capability-name-separation.md`，定义了 capability（前端路由）与 name（后端实现标识）的职责分离。

## Goals

- 所有运行时操作触发路径中，operation name 均从接口返回的 `RuntimeOperation.name` 动态传入，不再硬编码在 API 层。
- `operation` 参数为**必填**，不提供默认值——强制所有调用方显式传入，杜绝遗漏时静默降级到旧硬编码值的风险。

## Non-Goals

- 不修改 `RuntimeOperation` 类型定义或接口契约。
- 不改动 capability registry 的路由逻辑（仍以 capability 为 key）。
- 不新增弹窗类型或改变弹窗 UI 行为。
- 不涉及后端接口变更。
- **不为 `operation` 参数提供默认值兜底**（本次改造为原子操作，全链路同步完成，不存在中间状态）。

## Task Route

- Type: implementation-only change（设计原则已定稿，改动手感明确，无架构/契约变更）
- Owner Docs: `docs/design/runtime-operation-capability-name-separation.md`
- 关联真源：`src/interface/entities/runtimeOperation.ts`、`src/api/runtimeOperation.ts`

## Execution Plan

### Phase 1 - API 层：5 个包装函数接受动态 operation 参数

Status: planned

- Fix：`src/api/runtimeOperation.ts` 中 5 个包装函数签名新增 `operation: string` **必填**参数，移除内部硬编码值。具体变更：
  - `restartWorkload(input, operation)` — 移除硬编码 `'workload-restart'`
  - `horizontalScale(input, operation)` — 移除硬编码 `'workload-horizontal-scale'`
  - `verticalScale(input, operation)` — 移除硬编码 `'workload-vertical-scale'`
  - `restartPod(input, operation)` — 移除硬编码 `'pod.restart'`
  - `deletePod(input, operation)` — 移除硬编码 `'pod-delete'`（force 分支移除 `'pod.delete-force'`）
- Skill: none

[ ] Exit Criteria:

- 5 个函数均接受必填 `operation` 参数，原硬编码值已清除
- 所有既有调用方同步更新传入 operation（否则 lint-type 报错）
- `yarn lint-type` 通过
- [ ] `docs/logs/` updated

### Phase 2 - Workload 级弹窗：从 Header 到 Machine 全链路透传 operationName

Status: planned

- Fix：`WorkloadsHeader/index.tsx` — `handleActionClick` 或等价状态管理逻辑，将 `operation.name` 连同 `capability` 一并向下传递。需要确认当前是用单个 state（如 `activeOp: OperationCapability | null`）还是对象；若为单值则扩展为 `{ capability, operationName }` 或新增并行 state。
- Fix：`WorkloadsHeader/OperationModals.tsx` — Props 接口 `OperationModalProps` 新增 `operationName?: string`；将值透传给各子弹窗组件。
- Fix：`operations/restart/machine.ts` — machine input/context 新增 `operationName`；submit actor 将其传入 `restartWorkload(input, operationName)`。
- Fix：`operations/horizontalScale/machine.ts` — 同上模式，传入 `horizontalScale(input, operationName)`。
- Fix：`operations/verticalScale/machine.ts` — 同上模式，传入 `verticalScale(input, operationName)`。
- Skill: none

[ ] Exit Criteria:

- 从 Header 按钮点击到 API 调用的完整链路中，operationName 逐层透传
- 各弹窗 machine 的 submit 使用动态 operationName 而非硬编码
- `yarn lint-type` 通过（任何遗漏调用点会导致编译报错，符合预期）
- [ ] `docs/logs/` updated

### Phase 3 - Pod 级弹窗：从 WorkloadsPage 到组件透传 operationName

Status: planned

- Fix：定位 Pod 弹窗的父级渲染方（`WorkloadsPage/index.tsx` 或等效文件），找到 `setModal({ key, pods })` 的调用处。确认该处是否有 `RuntimeOperation` 对象可用（通常来自 `handlePodOperation(pod, operation)` 回调）。将 `operation.name` 存入 modal state。
- Fix：`BatchRestartPodModal/index.tsx` — Props 新增 `operationName?: string`；handleSubmit 中将 `operationName` 传入 `restartPod({...}, operationName)`。
- Fix：`DeleteModalBase.tsx` — Props 新增 `operationName?: string`；handleSubmit 中将 `operationName` 传入 `deletePod({...}, operationName)`。（force 变体同理）
- Skill: none

[ ] Exit Criteria:

- Pod 批量重启/删除/强删三个弹窗均能接收并使用动态 operationName
- `yarn lint-type` 通过（任何遗漏调用点会导致编译报错，符合预期）
- [ ] `docs/logs/` updated

### Phase 4 - 验证与收口

Status: planned

- Proof：运行 `yarn lint-type` / `yarn lint` / `yarn build`。
- Fix：更新设计原则文档状态（如有需要）；追加日志。

[ ] Exit Criteria:

- `yarn lint-type` / `yarn build` 通过
- 全部 3 个 Phase 的 Exit Criteria 已满足
- [ ] `docs/logs/2026/07-31.md` updated

## Closure Gates

- [ ] in-scope behavior is complete（5 个 API 函数 + 3 个 Workload 弹窗 + 3 个 Pod 弹窗全部支持动态 operationName）
- [ ] relevant docs are aligned（设计原则文档 + 日志一致）
- [ ] verification has run（lint-type / build 通过）
- [ ] closure audit was independent

## Risks & Open Questions

- **state 结构变更影响面**：`WorkloadsHeader` 当前 `activeOp` 若是单值 `OperationCapability | null`，扩展为对象可能影响所有读取该 state 的地方。需精确评估引用范围。备选方案：保持原 state 不变，新增一个并行的 `activeOperationName` state，仅在打开弹窗时同步设置。
- **Pod 弹窗调用方多样性**：Pod 操作入口可能有多个（行内操作菜单 + 批量操作栏），每个都需要检查是否持有 `RuntimeOperation` 对象以获取 `.name`。
- 本 plan 需经独立 draft review 收敛为 `planned` 后方可进入实现（AGENTS.md 规则 7）。
