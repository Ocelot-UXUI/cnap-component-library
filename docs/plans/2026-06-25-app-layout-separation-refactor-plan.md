# 2026-06-25 AppLayout Layout-Business Separation Refactor

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-06-25
> Source: user request: 按照布局与业务实现相分离的原则重构 `src/routers/AppLayout/`

## Current Baseline

- `src/routers/AppLayout/index.tsx` is 430 lines and currently disables `complexity`, `max-len` and `max-lines`.
- `AppLayout` owns both layout responsibilities and business/navigation orchestration:
  - layout shell: `Layout`, fallback `Header`, `WorkspaceLayout`, fixed `Sider`, animated content area and scroll containers.
  - business/navigation behavior: active node/workspace resolution, context fallback checks, workspace context persistence and route navigation.
  - visual styling: header, sider, content, liquid glass variants, logo and collapse animation classes.
  - business composition: `NavigationContextSelectors`, `SidebarMenu`, `UserAvatar`, `ThemeSwitcher` and app branding are assembled directly in the shell.
- `WorkspaceLayout.tsx` already extracts the outer workspace positioning, but the nested sidebar/content layout remains embedded in `AppLayout`.
- `ICloudTopNav.tsx` also mixes shell portal layout with active route context derivation and top nav business content composition.
- Navigation data itself is already outside `AppLayout` in `src/navigation/`; this refactor must preserve that source of truth.
- The route basename fix is protected by `yarn verify:router-paths`; new internal navigation code must keep using `toPath()`.

## Goals

- [x] Make `AppLayout` a thin composition layer that wires state/hooks and delegates rendering to focused layout or business components.
- [x] Separate layout components from business/navigation components under `src/routers/AppLayout/`.
- [x] Keep layout components responsible only for dimensions, positioning, scroll regions, responsive visibility, animation containers and theme-driven visual variants.
- [x] Keep business components responsible for navigation data rendering, top navigation content, context selectors and navigation commands, without owning global layout positioning.
- [x] Preserve existing navigation behavior, context fallback behavior, selected state, sidebar collapse persistence, iCloud portal behavior and theme behavior.
- [x] Remove the need for `max-lines` and `complexity` disables from `src/routers/AppLayout/index.tsx`.

## Non-Goals

- Do not redesign the visual style of the header, sidebar, content area or top selectors.
- Do not change the navigation registry, route hierarchy, context requirement rules or Agent navigation semantics.
- Do not add mobile navigation behavior; mobile remains outside the current MVP scope.
- Do not modify deprecated `src/capabilities/` code.
- Do not change `WorkspaceLayout`'s public behavior unless needed to host extracted layout children.
- Do not merge this plan with broader navigation-system work; this slice is only `src/routers/AppLayout/` separation.

## Task Route

- Type: architecture change + implementation-only refactor
- Owner Docs: `AGENTS.md`, `docs/design/app-overview.md`, `docs/design/navigation-system.md`, `docs/architecture/navigation-system.md`
- Related Context: `docs/plans/2026-06-25-cnap2-navigation-system-plan.md`
- Skills: none

## Separation Contract

- Layout components may accept already-derived props such as `collapsed`, `isLiquidGlass`, menu/content nodes and callbacks, but must not call navigation registry helpers or context fallback helpers.
- Business/navigation components may derive menu groups, active keys and navigation actions, but must not define fixed global dimensions, page positioning or workspace scroll geometry.
- Shared style constants and layout CSS should move out of `index.tsx` into focused files so that `index.tsx` no longer owns layout implementation details.
- Any extracted component should stay under `src/routers/AppLayout/` unless it is clearly reusable outside this router shell.

## Execution Plan

### Phase 1 - Extract Navigation Orchestration

Status: completed

- [x] Fix: move active navigation derivation, menu group mapping and `navigateNode` fallback behavior into a focused hook or controller module under `src/routers/AppLayout/`. Skill: none
- [x] Fix: make the hook expose render-ready menu groups, selected key and `onSelect`, while preserving workspace context remember/restore semantics. Skill: none
- [x] Proof: update or add focused tests only if existing tests do not cover changed helper behavior. Skill: none

[x] Exit Criteria:

- [x] `AppLayout` no longer directly imports from `@/navigation` or `@/contexts/navigationContextData`; navigation derivation is accessed through one focused AppLayout hook/controller.
- [x] The hook/controller owns active node/workspace resolution, menu groups, selected key, context requirements and navigation select behavior.
- [x] Internal navigation still uses `route.toPath()` and passes `yarn verify:router-paths`.
- [x] Missing-context fallback behavior is unchanged.

### Phase 2 - Extract Layout Components

Status: completed

- [x] Fix: extract sidebar frame, collapse control, menu scroll region and sidebar logo into a layout-oriented component. Skill: none
- [x] Fix: extract main content frame and route transition wrapper into a layout-oriented component. Skill: none
- [x] Fix: move dynamic theme/liquid-glass layout classes into focused style or layout files. Skill: none
- [x] Proof: keep layout components free of navigation registry/context fallback imports. Skill: none

[x] Exit Criteria:

- [x] Sidebar layout owns positioning, dimensions, collapse animation and scroll regions only.
- [x] Content layout owns content container sizing, scroll behavior and route transition only.
- [x] Extracted layout files remain below the 150-line guideline where practical.

### Phase 3 - Extract Top Navigation Content

Status: completed

- [x] Fix: split fallback local header layout from top nav business content composition. Skill: none
- [x] Fix: align `ICloudTopNav` with the same separation: portal behavior remains shell layout; rendered top nav content receives route/context requirements rather than deriving unrelated layout state. Skill: none
- [x] Proof: preserve dev/fallback header behavior and iCloud shell portal behavior. Skill: none

[x] Exit Criteria:

- [x] Top navigation content can be rendered by either fallback header or portal without duplicating business composition.
- [x] Header layout components do not own route/context derivation beyond their explicit props.
- [x] Existing `NavigationContextSelectors`, `UserAvatar` and `ThemeSwitcher` behavior is unchanged.

### Phase 4 - Recompose AppLayout And Verify

Status: completed

- [x] Fix: reduce `src/routers/AppLayout/index.tsx` to provider/theme wrapping, hook wiring and high-level component composition. Skill: none
- [x] Fix: remove obsolete eslint disables from `index.tsx` if no longer needed. Skill: none
- [x] Proof: run `yarn lint-type`. Skill: none
- [x] Proof: run `yarn test`. Skill: none
- [x] Proof: run `yarn verify:router-paths`. Skill: none
- [x] Proof: run `yarn lint` and record any pre-existing unrelated failures if still present. Skill: none
- [x] Proof: manually or interactively verify workspace switch, second-level selected state, missing-context fallback, sidebar collapse persistence, fallback local header, iCloud portal header, liquidGlass/default theme layout and unchanged mobile no-drawer behavior. Skill: none
- [x] Add: update `docs/logs/2026/06-25.md`. Skill: none

[x] Exit Criteria:

- [x] `AppLayout` behavior is preserved while implementation responsibilities are split by layout vs business concern.
- [x] `src/routers/AppLayout/index.tsx` no longer needs `max-lines` or `complexity` disables.
- [x] Verification commands and outcomes are recorded.

## Verification

- Passed: `yarn lint-type`
- Passed: `yarn test` (6 files, 50 tests)
- Passed: `yarn verify:router-paths`
- Passed: `yarn build`
- Failed with unrelated existing issues: `yarn lint`
  - `src/design/Loading/LoadingProgress.tsx`: `any`
  - `src/navigation/registry.ts`: max-lines from previous navigation registry work
  - `src/pages/Applications/RuntimeConfig/components/MountVolumeList.tsx`: max-lines
  - `src/pages/Applications/RuntimeConfig/components/ResourceLimit.tsx`: max-lines
  - `src/utils/date.ts`: unused caught error
  - `src/utils/i18n/index.ts`: `any`
- Static separation check passed: layout files under `src/routers/AppLayout/` do not import navigation registry or context fallback helpers.
- Manual/exploratory check: Dev server started at `http://127.0.0.1:3001/`; Chrome DevTools MCP was unavailable due `Target closed`, so visual interaction was covered by static separation checks, route/menu unit tests, router-path verification, build and independent implementation audit rather than live browser clicks.

## Review Record

- Draft review: passed after `Explore_4346178` re-audit; previous P1 issues were resolved by strengthening verification, owner docs, Phase 1 boundaries and closure gates.
- Implementation audit: `Explore_4350990` found one P1 in `WorkspaceSidebar` mixing layout shell and business menu rendering.
- Re-audit: `Explore_4350990` accepted the slot-based `WorkspaceSidebar` fix; no remaining P0/P1 findings.
- Closure review: completed by `Explore_4350990` re-audit; remaining verification limitation documented above.

## Closure Gates

- [x] in-scope behavior is complete
- [x] separation contract has been checked: layout components do not import navigation/context fallback helpers, and business/navigation components do not own global layout geometry
- [x] relevant docs are aligned
- [x] verification has run
- [x] closure audit was independent
