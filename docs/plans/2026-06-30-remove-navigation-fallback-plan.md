# 2026-06-30 Remove Navigation Fallback

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-06-30
> Source: `docs/requirements/remove-navigation-fallback.md`

## Current Baseline

- `src/navigation/types.ts` 仍在 `NavigationNode` 上声明 `fallbackKey`，在 `WorkspaceDefinition` 上声明 `fallbackNodeKey`。
- `src/navigation/registry.ts` 中 workspace 和 navigation node 仍配置 fallback 目标。
- `src/navigation/derive.ts` 导出 `getFallbackNode()`，并在 `resolveContextAwareNode()` 中用 fallback 节点替代上下文不满足的目标节点。
- `src/executor/navigationTool.ts` 在 `navigate` 缺上下文时会解析 fallback route 并继续执行跳转；本计划只移除 fallback 跳转，不设计结构化失败结果。
- `src/routers/AppLayout/useAppLayoutNavigation.ts` 在布局导航中仍使用 `selectedNode.fallbackKey ?? 'home.dashboard'` 构造回退目标。
- `src/navigation/__tests__/derive.test.ts` 仍断言 fallback 行为。
- 架构文档已明确导航失败不应自动回退到非目标路由，但 `docs/architecture/navigation-system.md` 的 Derived Capabilities 和 Verification Expectations 仍有旧 fallback 表述需要同步清理。

## Goals

- 移除导航模型、registry、派生 API 和执行路径中的 fallback key / fallback node 自动回退能力。
- 导航目标因 route 参数、业务上下文或上下文合法性不满足而失败时，保持当前路由不变。
- `navigate` 缺参数或缺上下文时不再通过 fallback 进入非目标路由。
- 用户通过 UI 触发不可达导航目标时，不自动进入非目标路由。
- 更新测试和文档，使仓库基线与新产品决策一致。

## Non-Goals

- 不实现 XState 上下文状态机。
- 不实现完整 Agent capability registry。
- 不设计 Agent `navigate` 失败时的结构化失败事实；该能力属于后续独立计划。
- 不修改 Agent prompt 或 Agent 下一轮交互策略。
- 不设计新的错误展示 UI。
- 不移除工作区默认页或 `defaultChildKey` 概念；默认页仅用于显式进入工作区时的初始目标。
- 不重构与 fallback 移除无关的导航布局、路由定义或 Agent executor 流程。

## Task Route

- Type: app-layer design change / architecture change / implementation-only change
- Owner Docs:
  - `docs/requirements/remove-navigation-fallback.md`
  - `docs/design/navigation-system.md`
  - `docs/architecture/navigation-system.md`
- Skill: none
- Skill decision: Existing docs and plan guide are sufficient; no reusable skill in `docs/skills/README.md` directly matches this implementation slice.

## Execution Plan

### Phase 1 - Remove Fallback Model And Registry Data

Status: implemented

- [x] Fix: Remove `fallbackKey` from navigation node types and `fallbackNodeKey` from workspace types. Skill: none.
- [x] Fix: Delete fallback fields from `src/navigation/registry.ts` while preserving workspace defaults and existing route ownership. Skill: none.
- [x] Fix: Remove `getFallbackNode()` export and implementation. Skill: none.
- [x] Proof: Add or update navigation registry/derive tests proving no fallback node is produced for missing context. Skill: none.

[x] Exit Criteria:

- [x] `fallbackKey` and `fallbackNodeKey` no longer exist in navigation model or registry code.
- [x] `getFallbackNode()` is no longer exported or used.
- [x] Existing navigation target derivation still works for normal reachable routes.

### Phase 2 - Change Unreachable Navigation Behavior

Status: implemented

- [x] Fix: Replace `resolveContextAwareNode()` fallback behavior with an explicit reachable/unreachable result or equivalent no-substitution contract. Skill: none.
- [x] Fix: Update `src/executor/navigationTool.ts` so missing route params or missing context never navigate to fallback. Skill: none.
- [x] Fix: Update `src/routers/AppLayout/useAppLayoutNavigation.ts` so UI navigation does not route to a fallback target when the selected target is unavailable. Skill: none.
- [x] Decision: Record any local contract choice for unreachable results if the existing API cannot express failure without fallback. Chosen contract: `resolveContextReachability()` returns the original node plus a `reachable` boolean; UI selection no-ops on missing context; `navigate` uses the existing failure channel. Skill: none.
- [x] Proof: Add tests for missing context, missing route params, and UI/derive unreachable behavior preserving current route or returning explicit failure without fallback. Skill: none.

[x] Exit Criteria:

- [x] Missing context does not navigate to fallback or any non-target route.
- [x] Missing route params do not navigate to fallback or any non-target route.
- [x] UI navigation cannot silently replace the user's target with another route.
- [x] Tests cover failure-without-fallback behavior.

### Phase 3 - Align Documentation And Verification

Status: implemented

- [x] Fix: Remove stale fallback wording from `docs/architecture/navigation-system.md` and any touched docs. Skill: none.
- [x] Proof: Search repo for remaining `fallbackKey`, `fallbackNodeKey`, and `getFallbackNode` references; only historical docs, if any, may remain with explicit migration context. Skill: none.
- [x] Proof: Run verification baseline for this slice. Skill: none.

[x] Exit Criteria:

- [x] Owner docs no longer describe fallback as a supported navigation capability.
- [x] Verification evidence is recorded in the implementation log.

## Closure Gates

- [x] In-scope fallback model fields and registry data are removed.
- [x] In-scope fallback execution paths are removed.
- [x] Navigation failure does not jump to fallback or other non-target routes.
- [x] UI navigation failure does not jump to non-target routes.
- [x] Relevant tests are updated or added.
- [x] `docs/logs/2026/06-30.md` or current-date log is updated with implementation and verification status.
- [x] `yarn lint-type` has run.
- [x] `yarn test` has run, or a narrower existing test command is documented with reason.
- [x] Independent draft review accepted this plan before implementation.
- [x] Independent closure audit accepted completion before marking this plan completed.

## Baseline Change (2026-07-13)

> 本 plan 建立的"缺上下文时 UI 导航 no-op"基线已被后续决策覆盖。新基线：任何时候用户都可以进行路由跳转，跳转后的业务组件判断是否需要用户选择应用/环境。`useAppLayoutNavigation.ts` 中的 `missingContext` 检查已移除。

## Open Questions

- Should `resolveContextAwareNode()` remain as a named API returning explicit reachability, or should callers move to a more direct `checkNavigationContext()` helper?
- Should UI unreachable navigation be a no-op for this slice, or should it surface a minimal existing notification if one already exists nearby? New error UI is out of scope.
- What should `navigate` return when fallback removal makes navigation impossible? This plan may use the existing failure channel, but structured Agent tool result design is out of scope.
