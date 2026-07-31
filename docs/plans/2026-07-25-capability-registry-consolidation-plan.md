# 2026-07-25-capability-registry-consolidation 能力注册表落地与消费方收敛

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-25
> Draft Review: 2026-07-25 独立审计（General subagent）初版 FAIL；已修正 B1（批量成员派生会误删 block/unblock 占位→改为 targetKind==='Pod' 成员派生 + supportsBatch 仅表"是否已实现"）并采纳 3 项建议后收敛为 planned
> Closure Audit: 2026-07-25 独立关闭审计（General subagent）PASS，无 Blocking（行为等价、验证全绿、文档对齐、Non-Goals 守住）
> Source: docs/architecture/workload-domain-model.md（L3 能力层 Capability Registry，L66-68/L91-92/L130-145 目标设计）

## Current Baseline

- `capabilityRegistry`（`src/domain/workload/capability.ts` L21）仅登记 `VerticalScale`，`CapabilityDef = {capability, targetKind, supportsBatch}`；`buildVerticalScaleCommand` 存在且被 `verticalScale/submit.ts` 使用，但**注册表本身除单测 + index 导出外无任何运行时消费方**。
- 标题栏 `OperationModals.tsx`：`MODAL_CAPABILITIES` 集合 `{VerticalScale,HorizontalScale,Restart}` + capability→弹窗 `if` 链；`WorkloadsHeader` 点击 gate 用 `MODAL_CAPABILITIES.has()`。
- 批量栏 `BatchActionBar/batchActions.ts`：`BATCH_ACTIONS` 硬编码 5 项（restart/delete/**block**/**unblock**/force-delete，含 label/danger/placeholder），block/unblock 为**可见占位**（仍渲染、`aggregateAction` 仍跑，仅点击不触发）；`aggregateAction` 读后端 `pod.operations`。
- `OperationCapability` 共 9 值，`OperationTargetKind = None|Pod|Workload`；`RuntimeOperation` 带 `displayName` 与可选 `supportsBatch`。

## Problem / Motivation

架构文档把 Capability Registry 定位为**统一调度/元数据源**：「以 `OperationCapability` 为 key 的注册表，声明 `targetKind / supportsBatch / dialog / buildTargets / buildParams`。行内操作、批量栏、标题栏、弹窗提交统一读取，替代散落 switch」（`workload-domain-model.md` L66-68）。

但实现已偏离该基线：

- `capabilityRegistry`（`src/domain/workload/capability.ts`）仅登记 `VerticalScale`，且**除单测外无任何运行时消费方**。
- 实际路由/成员判断散落且硬编码：
  - 标题栏 `OperationModals.tsx` 的 `MODAL_CAPABILITIES` 集合 + capability→弹窗的 `if` 链；
  - 批量栏 `BatchActionBar/batchActions.ts` 的 `BATCH_ACTIONS` 固定 5 项（能力成员、顺序、danger、placeholder 全硬编码）。

这正是注册表本应消灭的「散落 switch」。**本切片让注册表兑现价值**：成为标题栏与批量栏的单一元数据/调度源，并登记全部已实现达标能力；消除硬编码能力清单。

## Goals

- 扩展 `CapabilityDef` 并登记全部已实现达标能力：`VerticalScale` / `HorizontalScale` / `Restart`（targetKind Workload）、`PodRestart` / `PodDelete` / `PodDeleteForce`（targetKind Pod，已实现批量）。同时登记 `PodBlock` / `PodUnblock`（targetKind Pod，`supportsBatch:false`、`dialog:undefined` = 批量占位）与 `ApplicationUninstall`（占位）。
- 标题栏（`OperationModals` / `WorkloadsHeader`）的「哪些 capability 打开弹窗、打开哪个弹窗」改为**从注册表派生**（`listModalCapabilities()`），删除 `MODAL_CAPABILITIES` 与 `if` 链。
- 批量栏（`batchActions` / `BatchActionBar`）的「批量按钮成员」改为**从注册表派生**（`listBatchCapabilities() = targetKind==='Pod'`，保留现有 5 项含 block/unblock 占位），删除硬编码能力清单；顺序/icon/danger/label/placeholder 留 UI presentation 表。
- 行为零变化（纯内部收敛），以既有 + 新增单测锁定等价性（标题栏 3 弹窗、批量栏 5 按钮集合/顺序/danger/placeholder 逐一对齐）。
- 同步 `docs/architecture/workload-domain-model.md`，使注册表由"目标设计/雏形"转为"当前基线"。

## Non-Goals

- **不统一提交路径到 `OperationCommand`**：Horizontal/Restart/批量/Pod 操作维持各自 `submit.ts` 的 rows→API 直接映射；`buildVerticalScaleCommand` 保持现状。是否为每个能力补 `buildTargets/buildParams` 收敛到 `OperationCommand`，列为后续可选切片（见 Open Questions）。
- **不实现屏蔽/解除屏蔽（PodBlock/PodUnblock）与删除部署资源（ApplicationUninstall）的业务**：这些可在注册表中声明（含 `dialog: undefined` 占位标记），但不接弹窗/提交。
- Pod 列表行内「详情」图标（前端固定动作，非后端 capability）不纳入注册表。
- 不改 `runtimeOperation` / `runtimeResource` API 契约；不改弹窗内部 UI 与提交逻辑。
- 不合并 `PodOperation` 与 `RuntimeOperation`（架构文档另一项，独立切片）。

## Task Route

- Type: architecture change（跨标题栏 + 批量栏的共享调度行为，触碰 domain 公共契约 `CapabilityDef`）
- Owner Docs: `docs/architecture/workload-domain-model.md`（本切片直接更新的基线）
- 关联：`docs/plans/2026-07-24-workload-domain-model-vertical-scale-pilot-plan.md`（注册表雏形来源）

## Design Notes（影响范围的关键决策）

- **注册表只存纯数据/纯函数，不持有 React 组件**（架构文档 L137/L189）。`CapabilityDef` 扩展为 `{capability, targetKind, supportsBatch, dialog?}`，其中 `dialog` 是**字符串 key**（如 `'verticalScale' | 'horizontalScale' | 'restart' | 'batchRestart' | 'batchDelete' | 'batchForceDelete'`）；capability→React 组件的映射留在 pages/UI 层的一张小表，按 `dialog` key 取组件。
- **展示信息归属**：标题栏按钮 `displayName` 取后端 `RuntimeOperation.displayName`（标题栏本就有 operations 列表）；批量栏只拿到 `Pod[]`、无 operations 列表，故批量按钮的 `key/label/icon/danger/order/placeholder` 全部留在 UI presentation 表（静态），**按 capability 键并与注册表交叉校验**（注册表决定"有哪些"，UI 表决定"长什么样"）。注意批量 `danger`（仅 force-delete）与标题栏 `dangerousCapabilities`（还含 PodDelete/ApplicationUninstall）是两套语义，故 danger 不进注册表。
- **派生选择器**：domain 加纯函数 `listModalCapabilities()`（targetKind∈{Workload,None} 且 `dialog` 存在 → 恰为 Vertical/Horizontal/Restart）、`listBatchCapabilities()`（`targetKind==='Pod'` → 恰为 restart/delete/block/unblock/force-delete 现有 5 项）。批量成员**只按 targetKind==='Pod' 派生**，不按 `supportsBatch`——否则会误删 block/unblock 占位（B1）；`supportsBatch` 仅表"批量是否已实现"（block/unblock=false），占位性由 `dialog:undefined` + UI 表 `placeholder` 承载。
- **单一结果面**：本切片的唯一结果是「注册表派生的成员/路由选择器」这一机制，标题栏弹窗路由与批量成员是共享该机制的两个只读消费方。
- **等价性优先**：本切片不改任何可见行为；标题栏弹窗集合、批量按钮集合/顺序/danger/placeholder 与现状逐一对齐（PodBlock/PodUnblock 仍占位、force-delete 仍 danger+分隔线）。

## Execution Plan

### Phase 1 - 扩展并填充注册表 + 派生选择器（Add/Fix）

Status: done

- Fix：`CapabilityDef` 增加可选 `dialog?: string`；`capabilityRegistry` 登记：Vertical/Horizontal/Restart（targetKind Workload，dialog=对应弹窗 key）、PodRestart/PodDelete/PodDeleteForce（targetKind Pod，supportsBatch:true，dialog=对应批量弹窗 key）、PodBlock/PodUnblock（targetKind Pod，supportsBatch:false，dialog:undefined 占位）、ApplicationUninstall（targetKind Workload，dialog:undefined 占位）。在 `capability.ts` 顶部注释写入"批量能力前端写死"的理由（见下 Decision）。Skill: none
- Add：domain 纯函数 `listModalCapabilities()`（targetKind∈{Workload,None} 且 dialog 存在）/ `listBatchCapabilities()`（targetKind==='Pod'）（+ 从 index 导出）。Skill: none
- Decision：**批量能力集合在前端写死，不读后端 `operation.supportsBatch`**。理由：虽然接口按 operation 动态返回 `supportsBatch`，但当前实际支持的批量操作是**固定的 5 个**——重启（PodRestart）、删除重建（PodDelete）、屏蔽（PodBlock）、解除屏蔽（PodUnblock）、强制删除（PodDeleteForce）；写死更简单稳定，避免"注册表 vs 后端"双源不一致。后端 `RuntimeOperation.supportsBatch`/`PodOperation.supportsBatch` 目前也无任何消费方。备选（以后端 supportsBatch 驱动批量成员）拒绝——当前集合固定、收益低且引入双源。剩余风险：若未来后端扩展批量能力集合，需回来改注册表（届时可再评估是否切到后端驱动）。**此理由须同步写入 `capability.ts` 注释。** Skill: none
- Decision：批量成员按 **`targetKind==='Pod'`** 派生，而非 `targetKind==='Pod' && supportsBatch`。理由：现有批量栏含 block/unblock 可见占位，按 supportsBatch 过滤会把 5 项误删为 3 项、破坏零行为变化（B1）。`supportsBatch` 语义定为"批量是否已实现"（block/unblock=false），占位性由 `dialog:undefined` + UI 表 `placeholder` 表达。备选（成员按 supportsBatch）拒绝——语义过载且改变可见行为。剩余风险：低（成员集合与现状逐一对齐由单测锁定）。Skill: none
- Decision：`dialog` 存字符串 key 而非组件引用（domain 不依赖 React）；展示属性（icon/danger/顺序/label）留 UI 层。备选：registry 直接持组件（拒绝——domain 依赖 React，违背架构文档 L189）。剩余风险：UI 层需维护 dialog-key→组件 小表，与 registry 双表，靠交叉校验测试约束。Skill: none
- Proof：`capability.test.ts` 扩充：注册表条目、`listModalCapabilities()`/`listBatchCapabilities()` 输出集合与顺序（后者含 block/unblock）。Skill: none

[x] Exit Criteria:

- [x] 6 能力登记 + 占位声明；派生选择器有单测
- [x] `yarn lint-type` / `yarn test` 通过
- [x] `docs/logs/` updated

### Phase 2 - 标题栏消费方收敛（Fix）

Status: done

- Fix：`OperationModals.tsx` 删除 `MODAL_CAPABILITIES` 硬编码集合与 capability→弹窗 `if` 链，改为按 `dialog` key 从 UI 映射表取组件；能力成员由 `listModalCapabilities()` 决定。`WorkloadsHeader.handleActionClick` 相应改为「capability 在可弹窗集合内→打开」。Skill: none
- Proof：标题栏三能力（Vertical/Horizontal/Restart）点击打开对应弹窗的行为不变；以类型 + 构建 + 现有交互为准。Skill: none

[x] Exit Criteria:

- [x] 标题栏弹窗路由完全由注册表 + dialog-key 表驱动，无硬编码 capability 清单
- [x] 三弹窗打开行为与改造前一致
- [x] `docs/logs/` updated

### Phase 3 - 批量栏消费方收敛（Fix）

Status: done

- Fix：`batchActions.ts` 的批量按钮成员由 `listBatchCapabilities()` 派生；`BATCH_ACTIONS` 退化为「capability→{key, label, icon, danger, order, placeholder}」的 UI presentation 表（保留静态 label/key，供 ICONS 查找与 onAction 使用）并与注册表交叉校验；`aggregateAction`（读后端 operations）保持不变。Skill: none
- Proof：`batchActions.test.ts` 更新：批量按钮集合/顺序/danger/placeholder 与现状等价（5 项含 block/unblock）；缺能力兜底与原因聚合不变。Skill: none

[x] Exit Criteria:

- [x] 批量按钮集合/顺序/危险样式/占位与改造前逐一等价，成员来源为注册表
- [x] `yarn test` 批量相关用例通过
- [x] `docs/logs/` updated

### Phase 4 - 验证与文档收口（Proof）

Status: done

- Proof：`yarn lint-type` / `yarn lint`（改动文件无告警）/ `yarn test` / `yarn build`。Skill: none
- Fix：更新 `docs/architecture/workload-domain-model.md`——Capability Registry 由"目标设计/雏形"改为"当前基线"，标注已登记能力与消费方；同步 L131-138 的 `CapabilityDef` 草图（补 `dialog?`，将 `buildTargets/buildParams` 标为后续）；`docs/logs/2026/07-25.md` 追加记录。Skill: none

[x] Exit Criteria:

- [x] 四项验证通过
- [x] 架构文档反映注册表当前基线，plan/log 一致
- [x] `docs/logs/` updated

## Closure Gates

- [x] in-scope behavior is complete（注册表成为标题栏 + 批量栏单一元数据/调度源，能力登记齐全，行为等价）
- [x] relevant docs are aligned（架构文档更新为基线 + plan/log 一致）
- [x] verification has run（lint-type / lint / test / build）
- [x] closure audit was independent（2026-07-25 General subagent PASS，无阻塞项）

## Risks & Open Questions

- **纯重构、零可见行为变化**：主要风险是路由/批量成员回归。以「集合/顺序/danger/placeholder 逐一等价」单测 + 现有弹窗测试兜底。
- **双表（registry 数据 + UI presentation）**：icon/danger/顺序留 UI 层与 registry 分离，靠交叉校验测试防止漂移；若未来 presentation 也想入 registry，需另评估 domain 是否引入 UI 语义。
- **OperationCommand 统一（Open Question）**：是否给 Horizontal/Restart/Pod 操作补 `buildTargets/buildParams` 收敛到 `OperationCommand`、让提交路径也统一——本切片不做；收益（一致写模型）与成本（样板 + 重写 submit）需单独权衡，留作后续切片。
- **架构文档为真源**：本切片会把注册表从"提案"转"基线"，属 owner doc 更新，需在关闭审计中确认文档与实现一致。
- 本 plan 已由独立 draft review（初版 FAIL：批量成员派生 B1 → 修正为 targetKind==='Pod' 派生）收敛为 `planned`；关闭前需 independent closure audit。
