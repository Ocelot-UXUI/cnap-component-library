# Workspace Keep-Alive 技术基线

## Purpose

定义一级路由（工作台 / workspace）之间切换时**子路由页面状态保持、不重新挂载**的技术基线。这是 CNAP 前端内容区渲染模型的稳定约定。

## Concept

- 一级路由 = 工作台（workspace）。`src/navigation/registry.ts` 中的 `workspaces` 是唯一真源，当前共 7 个：`home / applications / environments / changes / resources / accounts / support`。
- 保活范围 = **全部一级路由**。在任意两个工作区之间来回切换时，已访问过的工作区其子路由页面的组件状态（表单、滚动位置、展开态、本地 UI 状态）全部保留，不因切走再切回而重挂。

## Rendering Model

内容区渲染从「单一 `<Outlet/>` + 路由分支挂载」改为「**内容区与路由分支解耦：每工作区一个常驻 Pane**」。

```
AppLayout（常驻）
└── WorkspaceContentLayout（内容框，常驻）
    └── WorkspaceHost                         ← 取代原 <Outlet/> 位置
        ├── <Activity mode=visible|hidden>
        │     └── WorkspacePane ws="home"      ← 首次访问后常驻，永不卸载
        ├── <Activity mode=visible|hidden>
        │     └── WorkspacePane ws="applications"
        └── …每个已访问工作区一个（懒挂载：未访问过的工作区不渲染）
```

### 关键机制

1. **`<Activity mode>`（React 19.2，来自 `react` 包）**：`mode="hidden"` 时保留 fiber 与 state、隐藏 DOM、**清理该子树 effects**（恢复为 `visible` 时重跑），并降低隐藏子树更新优先级。这是替代「条件渲染丢状态 / `display:none` 空转」的官方原语。注意：`react-router-dom` 自身不提供 Activity，本基线只依赖 `react` 的 Activity + React Router 稳定 API。

2. **每工作区常驻 Pane + cached outlet**：`WorkspacePane` 内部用 `useRoutes(该工作区子路由表)` 匹配当前 `pathname`。`useRoutes` 不匹配时返回 `null`；Pane 缓存「最近一次非空匹配元素」并渲染 `element ?? lastElement`。因 Pane 常驻、缓存元素类型/位置稳定，React 对其**原位调和而非重挂**，故 fiber 与 state 得以保留。

3. **懒挂载**：`WorkspaceHost` 维护「已访问工作区」集合，仅渲染访问过的 Pane，避免首屏一次性挂载全部工作区 DOM。

### 路由表组织

- `src/routers/index.tsx` 降级为骨架：`AppLayout` 下以 `{ path: '*' }` 兜底，Router 只负责 URL 解析与 AppLayout 挂载，不再承载业务子路由的渲染。
- 业务子路由按 `workspaceKey` 分区，集中在 `src/routers/workspaceRoutes.tsx`，导出 `WORKSPACE_ROUTES: Record<WorkspaceKey, RouteObject[]>`（路径为完整路径，因 Pane 挂在 basename 根上下文）；懒加载页面集中在 `src/routers/lazyPages.ts`，`withSuspense` 包装在 `src/routers/withSuspense.tsx`。
- 路由字符串真源仍在 `@/routes`（`route()` helper），分区表只组织「路由树」，不新增路径字面量。现有页面组件与 `ApplicationLayout` 原样复用。

## Effect / Polling 契约（强制）

Keep-alive 下，页面从「挂载一次」变为「激活时挂载、隐藏时 cleanup、恢复时重跑」。据此约定：

- 工作区内的轮询、订阅、WebSocket、定时器等副作用，**必须在组件内以 `useEffect` 承载并返回清理函数**，使其在工作区隐藏（Activity `hidden`）时自动取消、恢复时自动重建。即使底层通道位于 xstate actor / constate region，其订阅的建立与解除也必须在业务组件中有对应的 effect 生命周期体现。
- 数据是否在切回时重新拉取，由业务组件自身的 effect 决定，**不在架构层统一处理**：数据若在 effect 内获取，则恢复时自然重新获取一次；组件的 UI 状态不受影响。

## Boundaries

- **刷新 / 新标签页**：keep-alive 只覆盖 SPA 内切换；刷新后组件状态重置，实体级选择由 `NavigationContext`（localStorage）恢复。
- **浏览器前进 / 后退**：URL 是唯一真源，历史栈内切换同样命中 Activity 显隐。
- **内存**：最多 7 个常驻 Pane（懒挂载）；量级可控，暂不引入 LRU 淘汰。
- **导航高亮 / 侧边栏**：仍由 `resolveActiveWorkspace(pathname)` 等派生函数驱动，与本基线正交，不受影响。
