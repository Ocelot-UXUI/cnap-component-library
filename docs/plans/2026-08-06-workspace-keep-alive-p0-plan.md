# 2026-08-06-workspace-keep-alive-p0 一级路由（工作台）Keep-Alive P0

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-08-06
> Source: request（用户提出一级路由工作台状态保持，基于 React 19.2 Activity）

## Current Baseline

- `src/routers/index.tsx`：`createBrowserRouter` 单层平铺，`AppLayout` 下每个一级路由一条分支，内容区靠 `AppLayout` 的单一 `<Outlet/>` 渲染，非当前分支不存在于树中。
- `src/routers/AppLayout/workspace/layout/WorkspaceContentLayout.tsx:100`：`RoutedContent` 使用 `key={pathname}`，pathname 变化即强制重挂内容子树 —— 状态丢失根因。
- `src/navigation/registry.ts`：`workspaces` 已定义 7 个一级工作区，每个 `NavigationNode` 带 `workspaceKey`；`resolveActiveWorkspace(pathname)` 可用。
- 已装 `react@19.2.8`（导出 `Activity`）、`react-router-dom@7.18.2`（无 Activity）。
- 页面均为 `withSuspense(lazy(...))` 声明式加载，无 router loader/action。

## Goals

- 在全部 7 个一级路由（工作台）之间来回切换时，已访问工作区的子路由页面保持组件状态、滚动位置，不重新挂载。
- 内容区渲染与路由分支解耦，落地 `WorkspaceHost` + `WorkspacePane` + `<Activity>` 模型。
- 建立并记录 effect/轮询契约（业务组件以 useEffect 自控订阅生命周期）。

## Non-Goals

- 不做数据层缓存 / 请求去重：切回是否重新拉取由业务组件 effect 决定。
- 不改造各业务页面的轮询/订阅实现（仅在架构文档中确立契约，页面适配留待 P1）。
- 不引入 Pane 的 LRU 内存淘汰。
- 不改动导航高亮、侧边栏、NavigationContext 实体恢复逻辑。
- 不改动 `/playground`、`*` 顶层分支行为。

## Task Route

- Type: architecture change（内容区渲染模型）
- Owner Docs: `docs/architecture/workspace-keep-alive.md`、`docs/design/application-layout-guidelines.md`

## Execution Plan

### Phase 1 - Keep-Alive 渲染模型落地（全部工作区）

Status: planned

- Add: `src/routers/workspaceRoutes.tsx` — 单文件集中导出 `WORKSPACE_ROUTES: Record<WorkspaceKey, RouteObject[]>`（按 `workspaceKey` 分区，完整路径），配套 `lazyPages.ts` / `withSuspense.tsx` / `routePattern.ts`，从现有 `index.tsx` 迁移，页面组件与 `ApplicationLayout` 原样复用。Skill: none
- Add: `WorkspaceHost`（Activity 包裹每工作区 Pane + 懒挂载已访问集合 + 根路径重定向兜底）。Skill: none
- Add: `WorkspacePane`（`useRoutes` 分区表 + 缓存最近非空匹配元素 + 每 Pane 独立滚动容器 + full-bleed 内置）。Skill: none
- Fix: `WorkspaceContentLayout` 去除 `key={pathname}` 与单一 `<Outlet/>`，改挂 `WorkspaceHost`；入场动画改由 Activity 驱动。Skill: none
- Fix: `src/routers/index.tsx` 降级为骨架（`AppLayout` + `{ path: '*' }` 兜底）。Skill: none
- Fix: `useAppLayoutNavigation` 暴露 `activeWorkspace` 供 Host 判定 mode（若需）。Skill: none
- Proof: `yarn lint-type`、`yarn lint`、`yarn build` 全绿。
- Proof: 手动验证 —— applications 页填入筛选/滚动 → 切到 accounts → 切回，状态与滚动保留；切到未访问工作区正常首挂；浏览器前进/后退正常。

[ ] Exit Criteria:

- [x] 全部 7 个一级路由间切换保持子页状态与滚动，不重挂（用户本地手动验证通过）
- [x] `docs/architecture/workspace-keep-alive.md` 与实现一致
- [x] `docs/design/application-layout-guidelines.md` 增补 keep-alive 渲染约定
- [x] `yarn lint-type` / `yarn build` 通过；`yarn lint` 无本次新增错误（存量 `src/utils/i18n/index.ts` no-explicit-any 待单独处理）
- [x] `docs/logs/2026/08-06.md` updated

## Closure Gates

- [x] in-scope behavior is complete
- [x] relevant docs are aligned
- [x] verification has run
- [x] closure audit was independent

## Closure

- 独立关闭审计：General 审计子代理（独立通道），裁决 **PASS with follow-ups**，可置 completed。
- 审计亲测：`yarn lint-type` PASS、`yarn build` PASS、`yarn verify:router-paths` PASS；`yarn lint` 2 errors 与 `yarn test` 6 失败经 `git show a6dd149 --name-only` 佐证均为存量（不在本次 `src/routers/**` + `docs/**` 变更范围），非本次回归。
- 独立核验通过：24 条旧路由逐条比对无缺失/多余；`WorkspacePane` 缓存 outlet 逻辑正确（`useRoutes` 返回 null 时渲染 `lastMatchedRef.current`，元素类型稳定 → React 原位调和保 fiber）；`Activity` 从 `react` 正确导入（react@19.2.8）；full-bleed `/ai-chat` 行为等价。
- 「7 个工作区切换保持状态」证据来源为用户本地手动验证（人工声明，非自动化证据）。
- Follow-ups（非阻塞）：
  1. `WorkspaceHost.tsx:25,31-36` 的 `forceRender` useState+useEffect 为死代码（渲染期已同步写入 `visitedRef`），建议清理。
  2. 访问 `/` 会预标记 `home` 为已访问、多挂一个隐藏空 Pane，无功能影响。
  3. 跨工作区淡入动画因 Activity hidden 直接隐藏 DOM 而弱化，非功能缺陷。
  4. 存量 `src/utils/i18n/index.ts` no-explicit-any 2 处 error，建议单独修复。
