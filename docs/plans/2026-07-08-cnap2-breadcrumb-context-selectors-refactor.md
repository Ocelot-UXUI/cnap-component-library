# 2026-07-08 CNAP 2.0 Breadcrumb Context Selectors Refactor

> Plan Status: in progress
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-08
> Source: `docs/requirements/cnap2-breadcrumb-context-selectors.md` + 重构讨论

## Core Principle

数据与数据流转全部由 XState 管理。React 层只作为极薄的 UI 消费层，不做数据获取、不做状态管理、不做持久化。

## Current Baseline

- XState machine (`navigationContextMachine.ts`) 是单层同步 assign 机器，不包含 async invoke。
- `NavigationContext.tsx`：Provider 内部手动 `setSnapshot` + `refreshSnapshot` + `sendAndPersist`，在 `useEffect` 中调用 `loadNavigationContextCandidates()` 初始化数据，通过 `persistCurrent` 写 localStorage。
- `contextCapabilities.ts`：Agent 能力层维护独立的 `cachedCandidates` 模块级缓存，通过 `primeNavigationContextCandidates()` 注入；`selectAccount` 等操作直接读 `readStoredContext().current`（localStorage），不经过 XState actor snapshot。
- Option group 的异步加载由 React hook `useBreadcrumbSelectorOptionGroups` 管理，API 调用和数据状态与 XState 脱节。
- 级联清除逻辑在 React hook 的 `onChange` 里手动执行（`setApplicationId(undefined)`、`setEnvironmentId(undefined)`），与 XState 的 `applySelection` 动作重复。
- 维度选择器使用 AntD `Select` 做触发器，下拉面板通过 `BreadcrumbSelectorConfig` 万能配置传参。
- 文本溢出使用中间省略（`getMiddleEllipsisText`），非末尾省略。

## Goals

- 数据初始化、异步加载（candidates + option groups）、级联规则、持久化全部由 XState machine 管理。
- React 层只负责：传递 `actorRef` 给 Context、通过 `useSelector` 订阅 snapshot 变化、渲染 UI。
- `NavigationProvider` 退化为极薄 wrapper，不需要 `useEffect` / `useState` / `useCallback`。
- Agent 能力层（`contextCapabilities.ts`）不再维护独立缓存和 localStorage 读取，通过 `navigationActor.getSnapshot()` 获取状态。
- 面包屑维度选择器：共享层退化为触发器 + Dropdown 浮层定位，各维度自行渲染下拉面板。
- 替换 AntD `Select` 为 AntD `Dropdown`，文本溢出使用末尾 `text-overflow: ellipsis`。

## Non-Goals

- 不修改 `NavigationContextValue` 中 workspace 相关的 `rememberWorkspaceContext` / `restoreWorkspaceContext` 的产品行为（仅将实现从 React 层迁移到 XState actor）。
- 不变更 API 层的接口定义和 static data 逻辑。
- 不实现收藏、行内快捷入口、Footer 按钮的功能绑定（仍为占位）。
- 不在本次 plan 中修改需求文档或 Figma 对齐。

## Task Route

- Type: architecture change + implementation refactor
- Owner Docs: `docs/architecture/navigation-system.md`, `docs/context/conventions.md`

## Execution Plan

### Phase 1 - Move Data Lifecycle Into XState Machine

Status: planned

- [Add] 安装 `@xstate/react` 依赖。Skill: none.
- [Fix] 重构父 machine：启动时通过 `entry: invoke loadCandidates` 初始化 candidates（替代 `NavigationProvider` 的 `useEffect` + `loadNavigationContextCandidates`）。Skill: none.
- [Fix] 父 machine 的上下文变更时写入 localStorage（替代 `persistCurrent` / `writeStoredContext` 在 React 层的调用）。Skill: none.
- [Fix] 创建子 actor `OptionGroupActor`：监听父 machine 上下文变化，异步加载 option group。父 machine 在 `selectAccount` / `selectApplication` 时通知子 actor。Skill: none.
- [Fix] 同步更新 `NavigationContextSnapshot` 类型，新增 `optionGroups` 字段。Skill: none.
- [Fix] 迁移 `rememberWorkspaceContext` / `restoreWorkspaceContext` 的持久化逻辑到 machine 内（workspace 状态读写 localStorage 不再由 React 组件负责）。Skill: none.
- [Fix] 模块级创建 actor：`export const navigationActor = createActor(machine).start()`。Skill: none.

[ ] Exit Criteria:

- [ ] `NavigationProvider` 不再包含 `useEffect` 数据加载
- [ ] `NavigationProvider` 不再包含 `writeStoredContext` 调用
- [ ] `loadNavigationContextCandidates()` 由 machine 的 entry/invoke 触发
- [ ] `yarn lint-type` 通过
- [ ] 现有 `src/contexts/__tests__/navigationContextMachine.test.ts` 测试通过（或更新以覆盖新行为）
- [ ] `docs/logs/` updated

### Phase 2 - Thin React Layer

Status: planned

- [Fix] `NavigationProvider` 退化为极薄 wrapper：只做 `NavigationContext.Provider value={navigationActor}`。移除所有 `useState` / `useEffect` / `useCallback`。Skill: none.
- [Fix] 移除 `useNavigationContext()`：消费者直接通过 Context 获取 `actorRef`。Skill: none.
- [Fix] 现有 5 个消费点迁移为 `useSelector` 取值 + `actorRef.send()` 操作：
  - `src/routers/ApplicationLayout/index.tsx`
  - `src/routers/AppLayout/workspace/navigation/useAppLayoutNavigation.ts`
  - `src/routers/AppLayout/topNavigation/breadcrumb/useBreadcrumbContextSelectors.ts`
  - `src/pages/Applications/index.tsx`
  - `src/components/NavigationContextSelectors/index.tsx`
    Skill: none.
- [Fix] `contextCapabilities.ts`：移除 `cachedCandidates` 模块级缓存和 `primeNavigationContextCandidates()`，Agent 能力通过 `navigationActor.getSnapshot()` 获取状态。Skill: none.

[ ] Exit Criteria:

- [ ] `NavigationProvider` 代码量不超过 10 行
- [ ] 所有 `useNavigationContext()` 引用已替换为 `actorRef` 模式
- [ ] `cachedCandidates` 和 `primeNavigationContextCandidates()` 已移除
- [ ] workspace 相关行为（`rememberWorkspaceContext` / `restoreWorkspaceContext`）功能不变，数据通路迁移到 machine
- [ ] `yarn lint-type` 通过
- [ ] `yarn test` 通过
- [ ] `docs/logs/` updated

### Phase 3 - Remove Breadcrumb React Hook Option-Group Management

Status: planned

- [Fix] 删除 `useBreadcrumbSelectorOptionGroups`：option group 数据已由 XState 子 actor 管理。Skill: none.
- [Fix] `useBreadcrumbContextSelectors` 改为从 actor snapshot 读取 `optionGroups`，移除本地 state 管理和 `useBreadcrumbSelectorOptionGroups` 调用。Skill: none.
- [Fix] 删除 `breadcrumbContextTabs.ts` 中的 `emptyApplicationGroups` / `emptyEnvironmentGroups`。Skill: none.

[ ] Exit Criteria:

- [ ] `useBreadcrumbSelectorOptionGroups` 文件已删除
- [ ] breadcrumb hook 不从 React state 管理 option group
- [ ] `yarn lint-type` 通过
- [ ] `yarn test` 通过
- [ ] `docs/logs/` updated

### Phase 4 - Refactor Breadcrumb Selector Components

Status: planned

- [Fix] 替换触发器：`BreadcrumbSelector` 不再使用 AntD `Select`，改用 `Dropdown`（trigger=click）。触发器展示选中名称文本，末尾溢出使用 CSS `text-overflow: ellipsis`。Skill: none.
- [Fix] 拆分下拉面板：每个维度选择器拥有独立的下拉面板组件（`AccountDropdown` / `ApplicationDropdown` / `EnvironmentDropdown`）。共享层只提供触发器 + Dropdown 浮层定位。Skill: none.
- [Fix] 移除 `BreadcrumbSelectorConfig` 万能配置。Skill: none.
- [Fix] 删除 `getMiddleEllipsisText`，保留 `getBreadcrumbSelectorMaxWidth`。Skill: none.
- [Fix] 删除 `useBreadcrumbSelectorSearch`、`breadcrumbContextFilter.ts`：搜索/过滤逻辑由各维度下拉面板自行管理。Skill: none.
- [Fix] 删除 `breadcrumbContextTabs.ts` 中的 tab 定义。Skill: none.
- [Fix] 清理 `types.ts`：移除 `BreadcrumbSelectorConfig`、`BreadcrumbSelectorTab`。Skill: none.
- [Fix] 清理 `BreadcrumbContextSelectors.styles.ts`：移除 Select 相关样式（`selectorClass`、`dropdownClass`、`SelectorControl`）。Skill: none.
- [Fix] 修正选中态高亮：移除 `config.type === 'environment'` 条件分支。Skill: none.

[ ] Exit Criteria:

- [ ] 三个维度选择器各自拥有独立的下拉面板实现
- [ ] 触发器不再依赖 AntD `Select`
- [ ] 不存在 `type === 'environment'` 类分支判断
- [ ] `useBreadcrumbSelectorSearch.ts`、`breadcrumbContextFilter.ts` 已删除
- [ ] `BreadcrumbSelectorConfig` / `BreadcrumbSelectorTab` 类型已移除
- [ ] 文本溢出为末尾 `...`
- [ ] `yarn lint-type` 通过
- [ ] `yarn test` 通过
- [ ] `yarn build` 通过
- [ ] `docs/logs/` updated

## Closure Gates

- [ ] 四个阶段全部实现完毕，范围内行为完整
- [ ] `@xstate/react` 已安装
- [ ] 数据初始化、异步加载、级联规则、持久化全在 XState machine 内
- [ ] `NavigationProvider` 是极薄 wrapper（≤10 行）
- [ ] `contextCapabilities.ts` 不再有独立缓存
- [ ] Option group 异步加载由 XState 子 actor 管理
- [ ] 维度选择器触发器用 Dropdown，下拉面板各维度独立
- [ ] 文本溢出为末尾省略
- [ ] `docs/architecture/navigation-system.md` 更新 XState 为数据真源的基线
- [ ] `docs/context/conventions.md` 中新增规则：React 层不做数据获取和状态管理
- [ ] `yarn lint-type` / `yarn test` / `yarn build` 全部通过
- [ ] `docs/logs/2026/07-08.md` updated
- [ ] 关闭审计独立完成
