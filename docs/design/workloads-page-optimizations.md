# 工作负载页面细节优化

> 应用层设计文档。记录 Workloads 页面的 4 项 UI/交互优化需求与实现方案。
> 创建日期：2026-08-03。

## 1. Pod 版本号截断展示

### 现状

`src/pages/Workloads/PodContentArea/podCells.tsx:34` — `renderName` 函数在 detailed 模式下将 `pod.version` 以 `v{version}` 内联展示在 Pod 名称下方，无截断逻辑。当 version 过长时会撑破列宽。

### 需求

- 当 `version.length > 12` 时，截取前 5 字符 + `...` + 后 4 字符展示（共 12 字符含省略号）。
- 用户 hover 截断后的 version 时，通过 antd `Tooltip` 展示完整 version。
- 当 `version.length <= 12` 时，正常展示 `v{version}`，无需 Tooltip。

### 涉及文件

- `src/pages/Workloads/PodContentArea/podCells.tsx` — `renderName` 函数

### 实现要点

1. 提取一个纯函数 `truncateVersion(version: string): string`，规则：`length > 12` 时返回 `slice(0,5) + '...' + slice(-4)`，否则原样返回。
2. 在 `renderName` 中，将 version 文本替换为 `<Tooltip title={fullVersion}>{truncatedVersion}</Tooltip>`（仅当截断时才加 Tooltip，避免短文本也弹浮层）。
3. 纯函数放在组件外部，可独立测试。

---

## 2. Pod 详情 Drawer 右上角操作列表与独立页面

### 前置需求（P0）：全局弹窗/抽屉注册与调用机制

独立 Pod 详情页面（本需求第二部分）是独立路由，脱离了主 Workloads 页面组件树，无法复用主页面 `Workloads/index.tsx` 的 Pod 操作弹窗宿主。要让独立页面也能打开 Pod 操作弹窗，这些弹窗必须以全局方式存在。因此本需求依赖一个前置能力：**构建全局的弹窗/抽屉注册与调用机制**。

- **全局注册**：弹窗、抽屉组件按 key 注册到全局宿主。
- **全局调用**：任意组件可通过命令式 API（如 `openModal` / `closeModal`、`openDrawer` / `closeDrawer`）打开或关闭已注册的弹窗/抽屉，无需自身持有 `open` 状态。
- **参数化（类型安全）**：打开时可传参；不同弹窗/抽屉各有不同参数类型，注册表按 key 关联各自 props 类型，`open*(key, props)` 按 key 强约束参数类型（编译期校验）。
- **互斥约束**：注册为全局的弹窗之间打开互斥（同一时刻至多一个弹窗）；抽屉之间打开互斥（同一时刻至多一个抽屉）。弹窗与抽屉是两条独立轴，可同时各存在一个。

该机制的详细设计与执行见独立计划 `docs/plans/2026-08-03-global-modal-drawer-registry-plan.md`（前置），本需求的执行见 `docs/plans/2026-08-03-pod-detail-drawer-ops-standalone-page-plan.md`（依赖前者）。

### 现状

`src/pages/Workloads/PodContentArea/PodDetailDrawer/index.tsx:90` — Drawer 的 `extra` 仅渲染一个 `Standalone` 图标按钮，该按钮**无 `onClick`**，是死按钮。

Pod Table 操作列（`podCells.tsx:101-134`，`renderOperations`）根据 `pod.operations` 渲染动态操作按钮（>3 个时前 2 直显 + 更多下拉），每行还固定前置"详情"和"查看 YAML"按钮。

路由现状：`src/routers/index.tsx:153-156` 仅有扁平路由 `workloads`，无 Pod 详情子路由。代码库中无 `window.open` 使用先例，`Standalone` 图标在 3 处均为死按钮。

### 需求

- Pod 详情 Drawer 右上角应展示该 Pod 对应的操作列表，渲染逻辑与 Pod Table 操作列一致（同一 `renderOperations` 函数）。
- 原有 `Standalone` 图标按钮保留，其功能为：在新页面（新浏览器标签页）打开当前 Pod 详情。即在一个独立的 Pod 详情路由下渲染与 Drawer 相同的 Pod 详情内容，使用户可以从单页面查看完整 Pod 详情。
- 操作列表与 `Standalone` 按钮并排排列在 `extra` 中。

### 涉及文件

- `src/pages/Workloads/PodContentArea/PodDetailDrawer/index.tsx` — 修改 `extra` prop，接入操作列表和 `Standalone` 按钮的 `window.open`
- `src/pages/Workloads/PodContentArea/podCells.tsx` — `renderOperations` 抽离为可共享入口
- `src/routers/index.tsx` — 新增 Pod 详情独立路由
- `src/pages/Workloads/PodDetailPage/`（新增）— Pod 详情独立页面组件
- `src/constants/app.ts` — 可能需要导出路由路径常量

### 实现要点

**操作列表**：

1. Pod 详情通过 `runtimeResourceApi.getPodDetail` 获取，返回的 `Pod` 实体已包含 `operations?: PodOperation[]` 字段（`pod.ts:197`），无需额外接口。
2. 在 Drawer 的 `extra` 中调用 `renderOperations(pod, onPodOperation)`，与操作列表并排放置 `Standalone` 按钮。
3. `PodDetailDrawer` 需要接收 `onPodOperation` 回调（与 Pod Table 的 `onPodOperation` 一致），由 `PodContentArea` 透传。
4. Drawer 场景不需要"详情"和"查看 YAML"前置按钮（用户已在详情中），只渲染 `renderOperations` 部分。

**Standalone 按钮 — 新页面打开**：

1. 新增 Pod 详情独立路由，路径模式如 `workloads/pods/:appEnvID/:clusterId/:podName`。在 `src/routers/index.tsx` 中注册，使用 `lazy` + `withSuspense` 懒加载。
2. 新增页面组件 `PodDetailPage`，复用 `PodDetailDrawer` 内部的详情获取与渲染逻辑（`OwnershipRow`、`BasicInfoCard`、`ContainerArea`），但以全页面布局而非 Drawer 形式展示。`PodDetailDrawer` 内部需重构使详情内容可独立于 Drawer 渲染。
3. `Standalone` 按钮的 `onClick` 调用 `window.open` 构建目标 URL：
   ```ts
   const url = `${APP_BASENAME}/workloads/pods/${appEnvID}/${clusterId}/${encodeURIComponent(podName)}`;
   window.open(url, '_blank');
   ```
4. `PodDetailDrawer` 已有 `appEnvID`、`clusterId`、`podName` 三个 prop（`:43-49`），可直接用于构建 URL。
5. 独立页面同样需要操作列表（右上角），复用同一 `renderOperations`。

### 决策

- 独立 Pod 详情页面在 `AppLayout` 内渲染（保留顶导航和侧边栏），不渲染 `WorkloadsHeader`。

---

## 3. 操作弹窗 Group/容器默认选择

### 现状

三个操作弹窗（Restart / VerticalScale / HorizontalScale）的 XState machine 共享相同初始化逻辑：

- **Group**：接受 `defaultGroupId` 参数（来自 `WorkloadsHeader` 的 `groupId`）。当 `defaultGroupId` 为 `undefined` 时，进入 `ready` 状态但不选中任何 Group，用户需手动选择。
- **容器**：`loadingWorkloads` 的 `onDone` 中自动选择 `containerNames[0]`（第一个容器名），不考虑容器类型。

`RuntimeWorkloadContainer`（`workload.ts:105-111`）已包含 `type: string` 和 `image: string` 字段，与 `Container`（`pod.ts:88`）的 `type` 字段一致（值为 `MAIN` / `NORMAL` / `SIDECAR` / `INIT`）。数据模型已就绪。

### 需求

- 打开弹窗时，Group 默认选择第一个（当未传入 `defaultGroupId` 时）。
- 容器默认选择 `type === 'MAIN'` 的容器。

### 涉及文件

- `src/pages/Workloads/operations/restart/machine.ts`
- `src/pages/Workloads/operations/verticalScale/machine.ts`
- `src/pages/Workloads/operations/horizontalScale/machine.ts`
- `src/pages/Workloads/operations/shared/loader.ts` — `aggregateContainerNames` / `WorkloadsBundle`

### 实现要点

**Group 默认选择第一个**：

1. 在 `loadingGroups` 的 `onDone` 中，当 `context.groupId` 为空（无 `defaultGroupId`）时，自动取 `event.output[0]?.id` 作为 `groupId`，并跳转到 `loadingWorkloads`。
2. 现有 guard `!!context.groupId` 的分支保持不变（有 `defaultGroupId` 时走原逻辑）。
3. 三个 machine 的 `loadingGroups` 状态均需修改。

**容器默认选择 MAIN 类型**：

1. 修改 `aggregateContainerNames`（`loader.ts`）：返回值从 `string[]` 改为 `{ name: string; type: string }[]`，使容器列表携带类型信息。`WorkloadsBundle.containerNames` 类型同步更新。
2. 修改 `loadingWorkloads.onDone` 中的容器选择逻辑：从 `containerNames[0]` 改为优先查找 `type === 'MAIN'` 的容器，找不到时 fallback 到第一个。
3. 三个 machine 均需同步修改 `context.container` 的赋值逻辑。
4. Modal 组件中 `<Select>` 的 `options` 映射需适配新的 `{ name, type }` 结构（`label` 显示 `name`，`value` 用 `name`）。

---

## 4. Workload Group 操作列表与弹窗传参

### 现状

`src/pages/Workloads/PodContentArea/GroupHeader.tsx:38-49` — `buildMenu` 从全局 `operations` 数组中过滤 `targetKind === 'Workload' || targetKind === 'None'` 的操作，但：

1. 所有 Group 展示相同的操作列表（不区分 Group，但也无需区分——`targetKind === 'Workload'` 的操作对所有 Workload Group 均适用）。
2. `handleMenuClick`（`:56-60`）仅处理 `workload-yaml` key，**操作菜单项点击无响应**——Group Header 的操作列表目前不可交互。

数据流：`useWorkloadsRuntime`（`useWorkloadsRuntime.ts:41`）通过 `runtimeOperationApi.getOperations({ appEnvID })` 获取全量操作列表 → 传递给每个 `PodGroupTable` → `GroupHeader`。

### 需求

- Workload Group 右上角操作列表展示 `targetKind === 'Workload'` 的操作（来自现有 `/runtime/operations` 接口）。
- `targetKind === 'None'` 的操作仍保留在 `WorkloadsHeader` 全局操作栏。
- 当 Group 上的操作按钮被触发时，打开弹窗需带入该 Group 的 `id` 作为 `defaultGroupId` 参数。

### 涉及文件

- `src/pages/Workloads/PodContentArea/GroupHeader.tsx` — `buildMenu` 过滤逻辑、`handleMenuClick` 接入操作触发
- `src/pages/Workloads/PodContentArea/PodGroupTable.tsx` — 透传操作触发回调
- `src/pages/Workloads/PodContentArea/index.tsx` — 管理弹窗状态或委托给上层
- `src/pages/Workloads/WorkloadsHeader/index.tsx` — 全局操作栏过滤调整（仅保留 `targetKind === 'None'`）

### 实现要点

**操作列表过滤**：

1. `GroupHeader.buildMenu` 的过滤条件从 `targetKind === 'Workload' || targetKind === 'None'` 改为仅 `targetKind === 'Workload'`。
2. `WorkloadsHeader.isHeaderOperation` 的过滤条件从 `targetKind === 'None' || targetKind === 'Workload'` 改为仅 `targetKind === 'None'`。
3. "工作负载 YAML" 菜单项保留在 GroupHeader 下拉菜单末尾（分隔线后）。

**操作触发与弹窗传参**：

1. `GroupHeader` 新增 `onWorkloadOperation: (operation: RuntimeOperation) => void` 回调 prop。
2. `handleMenuClick` 扩展：当 `key` 匹配某个 operation 的 `name` 时，调用 `onWorkloadOperation(operation)`。
3. 回调链：`GroupHeader` → `PodGroupTable` → `PodContentArea`。
4. `PodContentArea` 需管理弹窗状态（`activeOp`、`activeOperationName`、`activeGroupId`），渲染 `WorkloadOperationModals` 时传入 `defaultGroupId={activeGroupId}`（即 `group.id`）。
5. 操作触发逻辑与 `WorkloadsHeader.handleActionClick` 一致：若 `MODAL_CAPABILITIES.has(operation.capability)` 则打开对应弹窗，否则走占位逻辑。
6. **架构决策**：弹窗状态管理可有两种方案——
   - **方案 A**：`PodContentArea` 独立管理自己的 `WorkloadOperationModals` 实例（与 `WorkloadsHeader` 各持一份状态）。
   - **方案 B**：将弹窗状态提升到 Workloads 页面顶层（`Workloads/index.tsx`），`WorkloadsHeader` 和 `PodContentArea` 共享。
   - 建议采用方案 A，减少跨组件耦合，后续如需统一再提升。

---

## 范围与路由

- 任务类型：app-layer design change + architecture change（req 2 前置的全局弹窗/抽屉机制为跨模块基础设施）
- 数据模型：req 3 的 `RuntimeWorkloadContainer.type` 已就绪；req 4 使用现有 `/runtime/operations` 接口，无需后端变更。
- 涉及模块：`PodContentArea`、`PodDetailDrawer`、`PodDetailPage`（新增）、`operations/*`、`WorkloadsHeader`、`GroupHeader`、`routers`、全局弹窗/抽屉宿主（新增）
- 满足 planning triggers 中的"修改超过 5 个文件"、"跨多个用户可见功能面改变行为"、"跨多个模块并改变共享行为"、"新增路由"

### 计划拆分

按用户要求拆为三份独立计划：

- `docs/plans/2026-08-03-workloads-detail-optimizations-plan.md` — 覆盖 req 1、req 3、req 4（不依赖全局机制）
- `docs/plans/2026-08-03-global-modal-drawer-registry-plan.md` — req 2 的前置：全局弹窗/抽屉注册与调用机制
- `docs/plans/2026-08-03-pod-detail-drawer-ops-standalone-page-plan.md` — req 2：Drawer 操作列表 + 独立页面（依赖上一份）

## 验证

- `yarn lint-type` — TypeScript 类型检查（req 3 涉及 `aggregateContainerNames` 返回类型变更）
- `yarn lint` — 代码风格
- `yarn start` — 手动验证四个交互场景
