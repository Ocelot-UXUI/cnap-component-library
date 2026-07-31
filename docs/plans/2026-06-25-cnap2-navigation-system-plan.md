# 2026-06-25 CNAP 2.0 Navigation System MVP

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-06-25
> Source: docs/requirements/cnap2-sidebar-navigation-mvp.md

## Current Baseline

- `src/routers/index.tsx` owns the actual React Router tree and still defines page routes directly.
- `src/routes/` owns route objects, `toUrl()` and route metadata; it is kept in sync with the router tree manually.
- `src/navigation/` now owns CNAP 2.0 navigation registry, workspace/secondary/child navigation nodes, derived helpers and Agent navigation target metadata.
- `src/routers/AppLayout/index.tsx` now consumes navigation registry data for first-level workspace navigation and current-workspace secondary navigation.
- `src/contexts/NavigationContext.tsx` owns minimal account/application/environment context state, backed by localStorage helpers in `src/contexts/navigationContextData.ts`.
- `src/components/SidebarMenu/` remains the reusable menu renderer.
- `src/routers/ApplicationLayout/index.tsx` still implements application detail tabs locally and derives active tab from `location.pathname`.
- `src/capabilities/` is deprecated and was not considered for this navigation system implementation.

## Goals

- [x] Add a navigation registry that references route objects instead of hard-coded URLs.
- [x] Represent workspace navigation as first-level navigation and workspace secondary navigation as second-level navigation.
- [x] Enforce context requirements only at second-level navigation nodes; deeper child nodes inherit and cannot override.
- [x] Add a minimal account/application/environment context model with hard account > application > environment hierarchy and localStorage persistence per workspace.
- [x] Refactor `AppLayout` to consume derived navigation data instead of owning business navigation definitions directly.
- [x] Expose Agent-readable navigation targets from the same registry used by UI navigation.
- [x] Preserve MVP scope by avoiding mobile navigation redesign and avoiding `data-ai-*` DOM fallback design.

## Non-Goals

- Do not implement a full visual redesign of the top selectors.
- Do not restore full page state, filters, scroll position or component state.
- Do not implement permission-driven navigation pruning.
- Do not implement mobile drawer navigation redesign.
- Do not introduce `data-ai-*` DOM locating or DOM operation fallback as part of this MVP.
- Do not replace the full React Router tree with generated routes in this slice.

## Task Route

- Type: architecture change + app-layer design change + implementation
- Owner Docs: `docs/requirements/cnap2-sidebar-navigation-mvp.md`, `docs/design/navigation-system.md`, `docs/architecture/navigation-system.md`

## Execution Plan

### Phase 1 - Navigation Registry Core

Status: completed

- [x] Add: create `src/navigation/` types, registry and derived helpers. Skill: none
- [x] Add: model workspace nodes, second-level nodes, fallback targets and Agent descriptions. Skill: none
- [x] Add: enforce by type and helper validation that only second-level nodes declare `contextRequirements`. Skill: none
- [x] Add: derive active workspace, active navigation node, sidebar render groups and Agent target list from registry. Skill: none
- [x] Proof: add focused unit tests for registry derivation, context inheritance rules and fallback resolution. Skill: none

[x] Exit Criteria:

- [x] Registry references route objects or route keys, not hard-coded URLs
- [x] Second-level context declaration rule is covered by tests
- [x] Active workspace/node derivation handles known current routes
- [x] Registry expresses parent/child relationships and safe fallback targets
- [x] Derived helpers can resolve a safe fallback target when required context is missing or invalid

### Phase 2 - Context Model

Status: completed

- [x] Add: create navigation context state for account, application and environment. Skill: none
- [x] Add: implement hard hierarchy validation and reset rules for account > application > environment. Skill: none
- [x] Add: persist last-used context per workspace in localStorage without storing full page state. Skill: none
- [x] Add: expose hooks consumed by top selectors and fallback checks. Skill: none
- [x] Proof: add focused unit tests for hierarchy reset and workspace context persistence. Skill: none

[x] Exit Criteria:

- [x] Account changes revalidate or reset application and environment
- [x] Application changes revalidate or reset environment
- [x] Workspace context persistence stores only account/application/environment identifiers

### Phase 3 - Layout Integration

Status: completed

- [x] Fix: refactor `AppLayout` so business navigation data comes from `src/navigation/` derived helpers. Skill: none
- [x] Add: render first-level workspace navigation and current workspace secondary navigation from registry data. Skill: none
- [x] Add: render minimal account/application/environment selectors in the top navigation area. Skill: none
- [x] Fix: keep layout components responsible for positioning, dimensions and scroll containers only. Skill: none
- [x] Proof: subagent reviewed workspace switch, secondary nav selected state and top context behavior. Skill: none

[x] Exit Criteria:

- [x] `AppLayout` no longer owns hard-coded business menu groups
- [x] Navigation selected state is derived from current route and registry
- [x] Top selectors can drive context state with hierarchy rules

### Phase 4 - Agent Navigation Integration

Status: completed

- [x] Fix: replace remaining manual page-name navigation map with registry/route based navigation targets where still used. Skill: none
- [x] Add: expose Agent-readable navigation metadata including workspace, second-level parent and context requirements. Skill: none
- [x] Proof: verify AI navigation prompt, tool schema and executor use registry-derived navigation keys consistently. Skill: none

[x] Exit Criteria:

- [x] Agent navigation target list is generated from registry data
- [x] UI navigation and Agent navigation do not maintain separate business target maps

### Phase 5 - Docs And Verification

Status: completed

- [x] Proof: run `yarn lint-type`. Skill: none
- [x] Proof: run `yarn test`. Skill: none
- [x] Proof: run `yarn lint` and document pre-existing failures separately. Skill: none
- [x] Proof: run `yarn build`. Skill: none
- [x] Add: update owner docs if implementation changes the agreed design or architecture. Skill: none
- [x] Add: update `docs/logs/2026/06-25.md`. Skill: none

[x] Exit Criteria:

- [x] Verification commands and results are recorded
- [x] Relevant docs are aligned with implemented behavior
- [x] `docs/logs/2026/06-25.md` updated

## Verification

- `yarn lint-type`: passed
- `yarn test`: passed, 5 files and 46 tests
- `yarn build`: passed
- `yarn lint`: failed on pre-existing issues outside this navigation slice:
  - `src/design/Loading/LoadingProgress.tsx`
  - `src/pages/Applications/RuntimeConfig/components/MountVolumeList.tsx`
  - `src/pages/Applications/RuntimeConfig/components/ResourceLimit.tsx`
  - `src/utils/date.ts`
  - `src/utils/i18n/index.ts`

## Review Record

- Draft review: subagent found plan issues before implementation; plan was strengthened for fallback and context persistence checks.
- Implementation review round 1: subagent found missing first-level/second-level UI split, runtime fallback usage, Agent key mismatch, selector visibility and persistence coverage gaps; fixes were applied.
- Implementation review round 2: subagent found Agent fallback, child route selected state and workspace restored-context fallback issues; fixes were applied.
- Closure review: subagent reported the implementation is acceptable with no P0/P1 must-fix issues.

## Closure Gates

- [x] in-scope behavior is complete
- [x] relevant docs are aligned
- [x] verification has run
- [x] closure audit was independent
