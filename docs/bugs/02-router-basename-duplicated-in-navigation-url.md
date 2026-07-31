# 02 Router Basename Duplicated In Navigation URL

## Problem

- 在配置了 `createBrowserRouter(..., { basename: APP_BASENAME })` 的应用内，部分代码仍将 `route.toUrl()` 的结果直接传给 `navigate()`。
- 当前默认 route factory 会把 `APP_BASENAME` 拼进 `toUrl()`，例如 `/home` 会生成 `/devops/cnap/home`。
- React Router 的应用内 `navigate()` 已经处于 basename 语境中，传入带 basename 的 URL 可能导致路由匹配失败或出现重复 basename 路径。
- 影响范围包括侧边栏导航、应用详情页 tab 跳转、Agent 导航执行器，以及其他运行在 React Router 内部却调用 `navigate(route.toUrl())` 的位置。

## Reproduction

- 环境：`APP_BASENAME = '/devops/cnap'`，router 使用 `createBrowserRouter(..., { basename: APP_BASENAME })`。
- 触发：在 `AppLayout` 侧边栏点击导航项，执行 `navigate(targetNode.route.toUrl())`。
- 现象：预期应用内跳转只需要 `/home` 或 `home`；实际 `toUrl()` 返回 `/devops/cnap/home`，把 basename 再次交给已配置 basename 的 router。

## Diagnostic Method

- 诊断较直接：问题集中在 route URL 生成和 React Router basename 两层边界。
- 检查 `src/routers/AppLayout/index.tsx` 发现侧边栏跳转调用 `navigate(targetNode.route.toUrl())`。
- 检查 `src/routes/create.ts` 发现默认 `route` 由 `createRouteFactory(APP_BASENAME)` 创建，`toUrl()` 会拼接 `APP_BASENAME`。
- 检查 `src/routers/index.tsx` 发现 router 已配置 `{ basename: APP_BASENAME }`。
- 因此确认不是 registry 节点配置错误，而是同一个 route URL 同时承担了“外部完整 URL”和“router 内部跳转路径”两种语义。

## Root Cause

- `Route.toUrl()` 当前固定生成带 `APP_BASENAME` 的完整应用路径。
- React Router 内部导航需要的是不含 basename 的应用内路径，因为 basename 已由 router 配置统一处理。
- 路由工具层没有区分 external URL 和 internal navigation path，导致调用方很容易把完整 URL 传入 `navigate()`。

## Fix

- 在 `src/routes/create.ts` 中拆分两类路径生成能力：
  - `toPath(params?)`：生成不含 `APP_BASENAME` 的应用内路径，用于 `navigate()`、registry 菜单 URL、router 内部跳转和选中态。
  - `toUrl(params?)`：保留生成含 `APP_BASENAME` 的完整应用路径，用于外部链接、静态上下文、跨 shell 打开等需要完整 URL 的场景。
- 更新 `Route` 类型，明确两个方法的语义边界。
- 将 React Router 内部调用从 `route.toUrl()` 改为 `route.toPath()`，覆盖：
  - `src/routers/AppLayout/index.tsx`
  - `src/routers/ApplicationLayout/index.tsx`
  - `src/executor/navigationTool.ts`
  - `src/executor/AIExecutorProvider.tsx`
  - `src/navigation/derive.ts` 中用于菜单渲染的 URL 生成
  - 页面内通过 `useNavigate()` 调用内部跳转的位置
- 保留 `toUrl()` 给非 router 内部场景，避免破坏可能依赖完整路径的外部消费。
- `src/capabilities/` 已废弃，本次修复不修改该目录中的历史调用。

## Tests

- 已新增 `src/routes/__tests__/create.test.ts`：
  - `toPath()` 对 `/home` 返回 `/home`，不包含 `APP_BASENAME`。
  - `toUrl()` 对 `/home` 返回 `/devops/cnap/home`，保留完整 URL 行为。
  - 动态参数路径在 `toPath()` 和 `toUrl()` 中都能正确替换。
- 已更新 `src/navigation/__tests__/derive.test.ts`：
  - `getWorkspaceMenuGroup()` 和 `getSidebarGroups()` 生成的菜单 URL 不包含 basename。
- 自动验证：
  - `yarn lint-type` passed。
  - `yarn test` passed。
  - `yarn build` passed。
  - `yarn lint` 仍失败于既有无关 lint 问题。

## Affected Artifacts

- `src/routes/create.ts` - route path/url 工具层已拆分 `toPath()` 和 `toUrl()`。
- `src/routers/AppLayout/index.tsx` - 侧边栏导航改为使用 `route.toPath()` 传给 `navigate()`。
- `src/routers/ApplicationLayout/index.tsx` - 应用详情 tab 和返回列表改为使用 `toPath()` 进行内部跳转。
- `src/navigation/derive.ts` - registry 菜单 URL 生成改为内部路径。
- `src/executor/navigationTool.ts` - Agent 导航执行器运行在 router 内部，改为使用内部路径。
- `src/executor/AIExecutorProvider.tsx` - 内部 route 解析改为返回 `toPath()`。

## Notes For Future Refactors

- 只要 router 配置了 `basename`，传给 `navigate()` 的路径就不应再手动包含 `APP_BASENAME`。
- route object 需要长期保持“内部 path”和“外部 URL”两个概念清晰分离，避免新增调用方继续误用 `toUrl()`。
- 导航 registry 可以引用 route object，但渲染 UI 菜单和执行 router navigation 时应使用内部路径生成能力。

## Prevention

- route 工具层测试已覆盖 basename URL 和 router 内部 path 的语义差异。
- navigation 派生测试已覆盖菜单 URL 不应包含 basename。
- `yarn verify:router-paths` 静态检查内部 router navigation，若发现 `navigate(route.toUrl())` 或 `router.navigate(route.toUrl())` 会失败。
- 后续新增内部 router 跳转时，应默认使用 `toPath()`；只有外部链接或跨 shell 打开才使用 `toUrl()`。
