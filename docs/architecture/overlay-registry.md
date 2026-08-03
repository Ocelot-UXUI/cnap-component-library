# Overlay Registry（全局弹窗/抽屉注册与调用机制）

## Purpose

提供跨路由的全局弹窗/抽屉注册与命令式调用机制：任意组件（含独立路由页面）无需自持 open 状态，即可按 key 打开/关闭已注册的弹窗或抽屉。取代此前分散在各页面的自持式弹窗宿主。

模块位置：`src/overlay/`。宿主挂载于 `src/routers/AppLayout/index.tsx`，覆盖 `AppLayout` 下全部子路由。

## Design Decisions

- **宿主挂载位置**：`AppLayout` 顶层单实例（`<OverlayProvider>` 包裹 `AppLayoutBody` 与 `<OverlayHost />`，位于 `ConfigProvider` 内以继承 antd 主题）。备选「每页各挂一份 Provider」被否决：无法跨路由共享，独立页面拿不到主页面注册项。
- **状态模型**：弹窗单槽 + 抽屉单槽两条独立轴，`open*` 覆盖式替换实现同轴互斥，跨轴可并存。备选「栈式多层」被否决：需求要求互斥而非叠加。
- **注册方式**：集中注册表 map（`key → 组件`）+ Provider 持 `{ key, props }` 活动态。备选「组件自注册副作用」被否决：时序与卸载复杂。
- **API 与参数类型**：命令式 hook `useOverlay()` 暴露 `openModal/closeModal/openDrawer/closeDrawer`。注册表以「key → 组件 props 类型」建模，`openModal<K>(key, props)` 通过泛型将 props 类型绑定到具体 key，编译期校验（传错 key/漏字段在 `yarn lint-type` 报错）。备选「props 用弱类型 Record」被否决：丢失类型安全。

## Module Layout

- `types.ts` — `OverlayManagedProps`（宿主注入的 `open`/`onClose`）、`ModalRegistry`（key→组件 props，单一真源）、`ModalKey`/`ModalInvocationProps<K>`/`ActiveModal`；抽屉轴对称类型。无运行时依赖（仅 `import type` 页面组件 props）。
- `overlayState.ts` — 纯 reducer（`overlayReducer` + `OverlayState`/`OverlayAction`），无 React / 无组件依赖，独立单测。
- `OverlayContext.tsx` — `constate` Provider + `useOverlay`；`useReducer` 持状态，`useLocation` 驱动路由切换清理。
- `registry.ts` — `MODAL_COMPONENTS` / `DRAWER_COMPONENTS` 组件 map（唯一引入页面组件的运行时文件）。
- `OverlayHost.tsx` — 读取活动态，按 key 从注册表渲染并注入 `open`/`onClose`。
- `index.ts` — 对外导出 `OverlayProvider` / `useOverlay` / `OverlayHost` 与 key/props 类型。

## Type Safety

- `ModalRegistry` 将每个 key 关联到该弹窗组件的完整 props 类型（单一真源）。
- 调用方传入 `ModalInvocationProps<K> = Omit<组件 props, 'open' | 'onClose'>`；`open`/`onClose` 由宿主注入。
- `registry.ts` 的 `registerModal<K>()` 在登记时按 key 校验组件 props；类型擦除仅发生在该单点与 `OverlayHost` 渲染边界（TS 无法在 union key 与其 props 间建立关联）。对外 `openModal<K>` 调用完全类型安全。

## Extending

- **新增弹窗**：在 `ModalRegistry` 增加 `key → 组件 props 类型`，在 `MODAL_COMPONENTS` 用 `registerModal<'key'>(Component)` 登记；调用方 `openModal('key', props)`。
- **接入抽屉（follow-up）**：新增 `DrawerRegistry` interface（镜像 `ModalRegistry`），补 `DRAWER_COMPONENTS` 登记；`DrawerKey` 随之由 `never` 变为真实联合，`openDrawer` 即可调用。抽屉轴的状态/互斥/清理逻辑已就绪（见 `overlayState.ts` 与其单测）。

## Current Consumers

- Pod 操作弹窗（`pod-restart` / `pod-delete` / `pod-force-delete`）：`src/pages/Workloads/index.tsx` 经 `openModal` 触发（行内 + 批量），无本地 open 状态。

## Follow-up

- 迁移 Workload 操作弹窗（`WorkloadsHeader` / `OperationModals`）与抽屉（`PodContentArea/DrawerHost`：Pod 详情 / YAML）到全局机制。
