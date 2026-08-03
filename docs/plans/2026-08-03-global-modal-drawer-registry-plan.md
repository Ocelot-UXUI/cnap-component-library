# 2026-08-03-global-modal-drawer-registry 全局弹窗/抽屉注册与调用机制

> Plan Status: planned
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-08-03（独立 draft review 通过：baseline 属实，确认代码库无现存 overlay 机制，可开始实现）
> Source: docs/design/workloads-page-optimizations.md（req 2 前置需求）

## Current Baseline

当前弹窗/抽屉宿主分散在三处，各自持有 open 状态、彼此不知情：

- **Pod 操作弹窗**：`src/pages/Workloads/index.tsx` 持 `modal` 状态（`ModalKey = 'restart' | 'delete' | 'force-delete'`，:19,47），`CAPABILITY_TO_MODAL`（:22-26）映射 `PodRestart/PodDelete/PodDeleteForce`，`handlePodOperation`（:60-66）经 `setModal` 打开，条件渲染 `BatchRestartPodModal` / `BatchPodDeleteRebuildModal` / `BatchPodForceDeleteModal`（:104-110）。
- **Workload 操作弹窗**：`src/pages/Workloads/WorkloadsHeader/index.tsx` 持 `activeOp`/`activeOperationName`（:67-68），渲染 `WorkloadOperationModals`（:131-141）。`OperationModals.tsx` 内 `DIALOG_COMPONENTS`（:22-26）映射 restart/verticalScale/horizontalScale。
- **抽屉**：`src/pages/Workloads/PodContentArea/index.tsx` 持 `drawer` 状态（`DrawerView = {type:'detail'} | {type:'yaml'}`，:8-10,49），由 `DrawerHost` 路由渲染 `PodDetailDrawer` / `YamlDrawer`。
- 三处各自内部已是「单槽互斥」，但相互独立、无法跨组件树复用。
- 现有全局状态范式：`constate`（`useWorkloadsRuntime` → `WorkloadsRuntimeProvider`，`useWorkloadsRuntime.ts:111`）。
- 全局外壳：`src/routers/AppLayout/index.tsx`（Provider 可挂载点），路由在 `src/routers/index.tsx` 经 `createBrowserRouter` 注册。

问题：独立 Pod 详情页面（Plan C / req 2）是独立路由，脱离 `Workloads/index.tsx` 与 `PodContentArea` 组件树，无法复用上述任一宿主来打开 Pod 操作弹窗。

## Goals

- 提供一个**全局弹窗/抽屉注册与调用机制**，任意组件（含独立路由页面）无需自持 open 状态即可打开/关闭已注册的弹窗或抽屉。
- **注册**：弹窗、抽屉按 key 注册到全局宿主（含渲染组件与所需 props 类型）。
- **调用**：命令式 API `openModal(key, props)` / `closeModal()` 与 `openDrawer(key, props)` / `closeDrawer()`。
- **参数化（按 key 类型安全）**：打开弹窗/抽屉时可传参；不同 overlay 有各自不同的参数类型。注册表将每个 key 关联到其专属 props 类型，`openModal(key, props)` / `openDrawer(key, props)` 按 key 强约束对应 props 类型，传错类型在 `yarn lint-type` 阶段即报错。
- **互斥**：弹窗单槽（弹窗之间打开互斥）、抽屉单槽（抽屉之间打开互斥）；弹窗与抽屉为两条独立轴，可同时各存在一个。
- 全局宿主挂载在 `AppLayout` 层，覆盖主 Workloads 页面与独立 Pod 详情页面等所有子路由。
- 以 **Pod 操作弹窗**（restart/delete/force-delete）作为首个接入方并验证机制（Plan C 需要）。

## Non-Goals

- 不在本计划内迁移 Workload 操作弹窗与全部抽屉（列为 Follow-up，避免一次性大改）。
- 不改变各弹窗/抽屉自身的业务行为与提交逻辑，仅改变其「宿主与开关方式」。
- 不引入第三方状态库；沿用项目既有 `constate` / Context 范式。

## Task Route

- Type: architecture change（跨模块 UI 基础设施）
- Owner Docs: docs/architecture/（拟新增 overlay-registry 说明）、docs/design/workloads-page-optimizations.md

## Execution Plan

### Phase 1 - 机制设计决策

Status: planned

- Decision：宿主挂载位置。选 `AppLayout` 顶层单实例（覆盖全部子路由）。备选：每页各挂一份 Provider（否决，无法跨路由共享，独立页面拿不到主页面已注册项）。剩余风险：全局单实例需保证卸载/路由切换时清理活动 overlay。
- Decision：状态模型。选「弹窗单槽 + 抽屉单槽」两条独立轴，`open*` 覆盖式替换实现互斥。备选：栈式多层（否决，需求明确要求互斥而非叠加）。
- Decision：注册方式。选「集中注册表 map：key → { component }」+ Provider 持 `activeModal/activeDrawer = { key, props }`。备选：组件自注册副作用（否决，时序与卸载复杂）。
- Decision：API 形态与参数类型。命令式 hook `useOverlay()` 暴露 `openModal/closeModal/openDrawer/closeDrawer`。注册表以「key → 组件 + 该组件 props 类型」建模，`openModal<K>(key: K, props: PropsOf<K>)` 通过泛型将 props 类型绑定到具体 key，从而每个 overlay 拥有独立参数类型且编译期校验（传错 key 的参数即 `yarn lint-type` 报错）。`activeModal/activeDrawer` 存 `{ key, props }`，Host 渲染时把 props 透传给对应组件。备选：props 用 `Record<string, unknown>` 弱类型（否决，丢失类型安全，易传错参）。Skill: none
- Proof：以上决策记入本计划并在 `docs/architecture/` 落一份简述。

[ ] Exit Criteria:

- 四项 Decision 均记录选择/备选/风险
- `docs/architecture/` 有对应机制说明

### Phase 2 - 实现全局 overlay 宿主与 API

Status: planned

- Add：新增全局 overlay Provider + Host + `useOverlay` hook（弹窗轴 + 抽屉轴，覆盖式互斥）。Skill: none
- Add：在 `AppLayout` 挂载 Provider 与 Host（Host 渲染当前 activeModal / activeDrawer）。Skill: none
- Add：定义注册表类型与 key 联合类型，`openModal`/`openDrawer` 按 key 绑定各自 props 类型（泛型），保证参数类型安全。Skill: none
- Proof：临时接入一个最小示例（或直接进入 Phase 3 的真实弹窗）验证打开/关闭与互斥；路由切换后活动 overlay 被清理。

[ ] Exit Criteria:

- 任意组件经 `useOverlay` 可打开/关闭已注册 overlay，并按 key 传入对应参数
- 每个 overlay 拥有独立 props 类型，传错 key 的参数在 `yarn lint-type` 报错
- 弹窗之间互斥、抽屉之间互斥、二者可并存，行为可复现
- `yarn lint-type` 通过

### Phase 3 - 接入 Pod 操作弹窗（首个消费者 + 证明）

Status: planned

- Add：将 Pod 操作弹窗（restart/delete/force-delete）注册进全局注册表。Skill: none
- Fix：`Workloads/index.tsx` 的 `handlePodOperation` 改为经 `openModal` 触发，移除本地 `modal` 状态与条件渲染（行为等价）。Skill: none
- Proof：`yarn start` 手动验证——Pod 行内/批量操作仍能正确打开对应弹窗；连续打开不同弹窗时前一个被替换（互斥）；提交/关闭链路不回归。
- Follow-up：迁移 Workload 操作弹窗（`WorkloadsHeader`）与抽屉（`DrawerHost`）到全局机制（单独计划或后续阶段）。

[ ] Exit Criteria:

- Pod 操作弹窗完全经全局机制打开，无本地 open 状态残留
- 现有 Pod 操作行为无回归
- `yarn lint-type` 与 `yarn lint` 通过
- [ ] `docs/logs/` updated

## Closure Gates

- [ ] in-scope behavior is complete（机制可用 + Pod 弹窗接入完成）
- [ ] relevant docs are aligned（架构说明 + design doc 前置需求 + 本计划一致）
- [ ] verification has run（`yarn lint-type`、`yarn lint`）
- [ ] closure audit was independent
