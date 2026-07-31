# Feature: 批量操作栏（BatchActionBar）

> 状态：已实现（2026-07-25，plan `docs/plans/2026-07-25-workload-batch-operations-plan.md`；屏蔽/解除屏蔽占位）
> 来源：Figma 设计稿「Frame 824 — 批量操作栏」+ 用户指令
> 父需求：`docs/requirements/workloads-page.md`（子需求 3 — H 区域业务逻辑）

## Goal

实现工作负载页面底部悬浮批量操作栏（H 区域）的业务逻辑。当用户在 Pod 列表选中任意 Pod 时，该栏从页面底部浮现并显示已选实例数量；栏内**固定写死** 5 个批量操作按钮（固定顺序，不随 Pod 数据动态增删），每个按钮的可用性由所选 Pod 的 `operations` 字段聚合决定——任一所选 Pod 上该操作不存在或被禁用（`disabled=true`）时，对应按钮置灰，hover 显示禁用原因。

> **操作集合以用户指令为准**：本需求只覆盖 删除重建 / 重启 / 屏蔽 / 解除屏蔽 / 强制删除 共 5 个批量操作。Figma Frame 824 中出现的 接流 / 临时授权 / 删除并缩容 不在本期范围内（接流与解除屏蔽为同一能力 `PodUnblock` 的不同展示名，本期统一使用"解除屏蔽"）。Figma 仅作为视觉与布局参考。

## In Scope

- BatchActionBar 业务内容渲染（替换现有占位壳子）：选中计数、5 个固定批量操作按钮、关闭按钮
- 显隐机制：至少选中 1 个 Pod 时浮现，清空选中或点击关闭按钮时消失（保留现有 `AnimatePresence` 动画与 portal 目标容器机制）
- 选中计数：跨工作负载组（group）累计，格式"已选择 N 个实例"
- **固定按钮集**：5 个批量操作按钮按固定顺序写死在栏中，不依赖 Pod `operations` 动态决定是否渲染或排序。Pod `operations` 仅用于决定按钮的启用/禁用态
- 批量按钮可用性聚合规则：按操作能力（capability）维度聚合所选 Pod 的 `operations`，任一 Pod 缺少该 capability 的操作项 或 该操作 `disabled=true` → 对应按钮置灰
- 禁用原因展示：hover 置灰按钮时 Tooltip 显示禁用原因
- 强制删除为危险操作，文字红色，与左侧操作之间有分隔线
- 显隐经页面级选中态提升 + `AnimatePresence` 驱动（实现采用状态提升而非 createPortal，行为等价，见 plan `2026-07-25-workload-batch-operations` Phase 5 决策）

## Out Of Scope

- 各批量操作点击后弹出的确认/配置弹窗本身的具体实现（详见各子需求文档）
- 批量操作的进度追踪/状态轮询/撤销回滚
- Pod 行内单个操作（非批量）的具体业务逻辑
- Tab 切换区（C 区域）、底部信息栏（G 区域）
- 接流 / 临时授权 / 删除并缩容 等未列入操作集合的批量操作
- 操作历史/审计日志
- 权限的前端级控制（由后端 `operations` 字段驱动）

## Main User Flows

### 流程 1：选中 Pod 触发批量栏浮现

```
用户在 Pod 列表（任意 group）勾选 1 个或多个 Pod 复选框
  → BatchActionBar 从页面底部浮现（AnimatePresence height/opacity 动画）
  → 栏左侧显示"已选择 N 个实例"（N 跨 group 累计）
  → 栏中部展示 5 个固定批量操作按钮，按所选 Pod 的 operations 聚合各按钮启用/禁用态
  → 栏右侧显示关闭按钮（X 图标）
```

### 流程 2：执行可用批量操作

```
用户点击一个处于可用态的批量操作按钮（如"重启"）
  → 触发对应操作弹窗（如批量重启 Pod 弹窗），弹窗带入所选 Pod 列表
  → 弹窗内完成配置并提交
  → 提交成功后关闭弹窗，清空选中，BatchActionBar 消失
```

### 流程 3：hover 查看禁用原因

```
所选 Pod 中存在某操作被禁用的 Pod（如某 Pod 正在终止，其"重启"操作 disabled=true）
  → 批量栏"重启"按钮置灰
  → 用户 hover 该置灰按钮
  → Tooltip 显示禁用原因（如"Pod正在终止"）
```

### 流程 4：关闭批量栏

```
用户点击栏右侧关闭按钮（X）
  → 清空所有已选 Pod
  → BatchActionBar 消失（exit 动画）
用户也可通过取消勾选所有 Pod 达到同样效果
```

## Business Rules

### 1. 显隐规则

- 至少选中 1 个 Pod 时批量栏可见；选中数为 0 时批量栏消失
- 保留现有显隐机制：通过检测 portal 目标容器是否有子元素控制可见性，`AnimatePresence` 驱动 height/opacity 动画，出现时挤压内容区高度（flex 子项）
- 关闭按钮（X）点击 = 清空全部选中 = 触发批量栏消失

### 2. 选中计数规则

- 计数跨所有工作负载组累计（group A 选中 2 + group B 选中 1 = "已选择 3 个实例"）
- 计数为实时响应：勾选/取消勾选立即更新

### 3. 批量操作集合与能力映射

| 批量按钮展示名 | capability       | operation name（API 路径） | 说明                                                                        |
| -------------- | ---------------- | -------------------------- | --------------------------------------------------------------------------- |
| 重启           | `PodRestart`     | `pod.restart`              | 弹窗见 `batch-restart-pod-modal.md`                                         |
| 删除重建       | `PodDelete`      | `pod.delete`               | 弹窗见 `batch-pod-delete-rebuild-dialog.md`                                 |
| 屏蔽           | `PodBlock`       | （待后端实现）             | 弹窗待后续补充                                                              |
| 解除屏蔽       | `PodUnblock`     | （待后端实现）             | 弹窗待后续补充；等价于 Figma 中的"接流"                                     |
| 强制删除       | `PodDeleteForce` | `pod.delete-force`         | 危险操作，红色文字，左侧有分隔线；弹窗见 `batch-pod-force-delete-dialog.md` |

- 按钮顺序（从左到右，固定写死）：重启 → 删除重建 → 屏蔽 → 解除屏蔽 → [分隔线] → 强制删除
- 按钮集与顺序为前端常量配置，不随所选 Pod 的 `operations` 动态增删或重排；Pod `operations` 仅决定每个按钮的启用/禁用态

### 4. 按钮可用性聚合规则

5 个按钮始终全部渲染（固定顺序），仅启用/禁用态随所选 Pod 变化。对每个按钮，按其 `capability` 在**所有所选 Pod** 的 `operations` 数组中查找同名操作：

- 所选 Pod 中**任一** Pod 缺少该 capability 的操作项 → 该按钮置灰，禁用原因为"部分所选 Pod 不支持此操作"（前端兜底文案）
- 所选 Pod 中**任一** Pod 该操作 `disabled=true` → 该按钮置灰
- 否则按钮可用

> 该规则与 `pod-list-content-area.md` 的 Roles/Permissions 中"批量操作按钮置灰规则"一致。

### 5. 禁用原因展示规则

- hover 置灰按钮时显示 Tooltip，内容为禁用原因
- 当多个所选 Pod 对同一操作有**不同**禁用原因时：展示原因聚合（去重后逐条列出，或展示第一条并附带"等 N 条原因"）——具体聚合方式见 Open Questions
- 当禁用原因是前端兜底（缺少操作项）时，使用前端默认文案，不与后端 reason 混合

### 6. 强制删除的危险样式

- 强制删除按钮文字使用红色（`semantic.state.error.default` 或对应 danger token）
- 强制删除左侧有 1px 竖向分隔线，与普通操作视觉区隔（对应 Figma 中 删除并缩容 前的分隔线 + image_10.png 分隔图标）

### 7. 按钮图标

- 每个批量按钮由"图标 + 文字"组成，图标 16×16px，与文字间距 4-6px
- 图标对应关系参照 Figma Frame 824：重启=Power 开关、删除重建=铁锤、屏蔽=屏蔽图标、解除屏蔽=流水线/接流图标、强制删除=对应删除图标
- 禁用态图标与文字同色置灰

## Roles / Permissions

- 不做前端级权限控制，操作可用性完全由后端返回的 Pod `operations` 字段驱动
- `operations[].disabled=true` 的操作在批量栏置灰，`reason` 通过 Tooltip 展示
- 角色差异不影响批量栏 UI，权限校验由后端 API 在提交时进行

## Edge Cases

| 场景                               | 处理                                                                             |
| ---------------------------------- | -------------------------------------------------------------------------------- |
| 仅选中 1 个 Pod                    | 计数显示"已选择 1 个实例"，按钮可用性按该 Pod 的 operations 聚合                 |
| 跨 group 选中 Pod                  | 计数跨组累计；按钮可用性跨所有所选 Pod 聚合                                      |
| 所选 Pod 中某 Pod 缺少某操作项     | 该操作按钮置灰，Tooltip 显示前端兜底文案                                         |
| 所选 Pod 对同一操作有不同禁用原因  | Tooltip 聚合展示（见 Open Questions）                                            |
| 所选 Pod 全部使某操作 disabled     | 按钮置灰                                                                         |
| 所选 Pod 全部使某操作 enabled      | 按钮可用                                                                         |
| 批量栏可见时取消勾选至 0 个        | 批量栏 exit 动画消失                                                             |
| 操作弹窗提交中（loading）          | 对应弹窗内按钮 loading，批量栏自身不进入 loading；批量栏保持可见直到弹窗成功关闭 |
| 操作弹窗提交成功                   | 关闭弹窗 + 清空选中 + 批量栏消失                                                 |
| 操作弹窗提交失败                   | 弹窗保持打开，批量栏保持可见，选中状态保留                                       |
| 翻页/筛选导致已选 Pod 不在当前视图 | 选中状态保留（选中不依赖可见性），批量栏仍显示累计计数                           |

## Open Questions

1. **[非阻塞] 多 Pod 禁用原因聚合方式**：当所选多个 Pod 对同一操作返回不同的 `reason`，Tooltip 应如何展示？方案 A：去重后逐条列出；方案 B：展示第一条 + "等 N 条原因"；方案 C：仅展示第一条。倾向方案 A（信息完整）。
2. **[非阻塞] 屏蔽 / 解除屏蔽 弹窗**：当前无对应需求文档，待后续补充。本期这两个按钮点击后的行为是占位还是阻塞实现？倾向占位（点击暂不触发弹窗，后续补充）。
3. ~~强制删除按钮点击后的交互~~（已确认）：点击后打开「批量强制删除 Pod 弹窗」，独立需求文档见 `batch-pod-force-delete-dialog.md`。本需求不关心该弹窗的组件实现方式（是否复用删除重建弹窗代码）。
4. **[非阻塞] 关闭按钮是否需要二次确认**：点击 X 清空选中时是否提示"将清空 N 个选中"？倾向不需要二次确认（直接清空）。

## Acceptance Criteria

- [ ] 至少选中 1 个 Pod 时 BatchActionBar 浮现，保留现有 `AnimatePresence` 动画与挤压内容区效果
- [ ] 选中数为 0 时批量栏消失
- [ ] 栏左侧显示"已选择 N 个实例"，N 跨 group 累计且实时更新
- [ ] 栏内**固定渲染** 5 个批量操作按钮，顺序为 重启 → 删除重建 → 屏蔽 → 解除屏蔽 → [分隔线] → 强制删除，按钮集与顺序不随所选 Pod 动态变化
- [ ] Pod `operations` 仅决定按钮启用/禁用态，不参与按钮的渲染或排序
- [ ] 任一所选 Pod 上某操作 `disabled=true` 时，对应批量按钮置灰
- [ ] 任一所选 Pod 缺少某操作项时，对应批量按钮置灰且 Tooltip 显示前端兜底文案
- [ ] hover 置灰按钮时 Tooltip 显示禁用原因
- [ ] 强制删除按钮文字红色，左侧有分隔线
- [ ] 点击关闭按钮（X）清空全部选中并触发批量栏消失
- [ ] 点击可用态"重启"按钮打开批量重启 Pod 弹窗（`batch-restart-pod-modal.md`）
- [ ] 点击可用态"删除重建"按钮打开批量删除重建 Pod 弹窗（`batch-pod-delete-rebuild-dialog.md`）
- [ ] 点击可用态"强制删除"按钮打开批量强制删除 Pod 弹窗（`batch-pod-force-delete-dialog.md`）
- [ ] 操作弹窗提交成功后关闭弹窗 + 清空选中 + 批量栏消失
- [ ] 操作弹窗提交失败时弹窗保持打开，批量栏与选中状态保留
- [ ] 翻页/筛选使已选 Pod 不可见时，选中状态与累计计数保留
- [ ] 使用 design tokens（semantic / spacing / radius / typography / shadow），禁止 hex 字面量
- [ ] 通过 `yarn lint-type` 和 `yarn lint` 检查

## Implementation Notes

### 视觉规范（来自 Figma Frame 824）

| 元素             | 规范                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| 容器             | 圆角 `radius.xl`（12px），背景 `semantic.button.primary.bg`（#1C202B），高度 48px，左右内边距 `spacing.m`~`spacing.l` |
| 选中计数文字     | `semantic.text.inverse`（#FFFFFF），14px medium                                                                       |
| 普通操作按钮文字 | 浅灰（对应 Figma #CCCCCC），14px regular，图标 16×16px                                                                |
| 强制删除按钮文字 | 红色（`semantic.state.error.default` 或对应 danger token），14px regular                                              |
| 分隔线           | 1px 竖线，`semantic.border.divider` 或对应深色场景分隔 token                                                          |
| 关闭按钮         | 16×16px Close 图标，`semantic.text.inverse`                                                                           |
| 按钮 hover       | 可用态 hover 有浅色高亮反馈；禁用态无 hover 反馈，仅 Tooltip                                                          |

### 操作→能力→弹窗映射

```
批量按钮点击 → 根据 capability 路由到对应弹窗
  PodRestart    → BatchRestartPodModal（带入 selectedPods）
  PodDelete      → BatchPodDeleteRebuildModal
  PodBlock       → 占位（后续补充）
  PodUnblock     → 占位（后续补充）
  PodDeleteForce → BatchPodForceDeleteModal
```

### 数据来源

- 所选 Pod 列表：PodContentArea 表格多选状态（跨 group）
- 每个 Pod 的 `operations`：`PodOperation[]`（见 `src/interface/entities/pod.ts`），含 `capability` / `disabled` / `reason`（`supportsBatch` 字段本期不用于按钮过滤）
- 聚合逻辑：5 个按钮为前端固定常量配置；按 capability 遍历所选 Pod 的 operations 匹配同名 capability，任一 Pod 缺少该操作或 disabled 即置灰

### Portal 机制

- 保留现有显隐机制：BatchActionBar 作为 flex 子项，通过 portal 目标容器是否有子元素控制可见性
- PodContentArea 选中 Pod 后通过 `createPortal` 将批量操作内容渲染到页面级 portal 目标容器（见 `workloads-page.md` 子需求 1 技术决策）

### 复用现有组件

- 复用现有 `BatchActionBar` 壳子与 `BatchActionBar.style.ts` 的 `BatchBarWrapper`
- 复用现有 `WorkloadsPage` 中的 `AnimatePresence` + `BatchBarSlot` 动画结构
- 仅替换 `BatchActionBarPlaceholder` 占位内容为真实业务按钮区
