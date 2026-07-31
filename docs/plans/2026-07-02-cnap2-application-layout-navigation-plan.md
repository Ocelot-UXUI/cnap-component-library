# 2026-07-02 CNAP 2.0 Application Layout And Navigation Plan

> Plan Status: in progress
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-02
> Source: `docs/requirements/cnap2-application-layout-navigation.md`

## Current Baseline

- Current shell root is `src/routers/AppLayout/index.tsx`; it owns theme, top navigation portal/fallback behavior, sidebar state, navigation data, and renders workspace content through layout wrappers.
- Current Header integration already distinguishes cloud Header portal and local fallback Header through `ICloudTopNavPortalLayout` and `FallbackTopNavLayout`.
- Current layout constants still use `HEADER_HEIGHT = 48`, `SIDEBAR_WIDTH = 240`, and `SIDEBAR_COLLAPSED_WIDTH = 80`, which does not match the CNAP 2.0 baseline of 56px Header, 60px primary sidebar, and 200px/60px secondary sidebar.
- Current sidebar is a single Ant `Sider` and grouped menu, not a split primary business rail plus secondary navigation panel.
- Current navigation registry already describes primary/secondary/child nodes, context requirements, routes, and workspace groups, but the UI does not yet implement the new overflow and secondary collapse behavior.
- Current page-level routes exist manually in `src/routers/index.tsx`; page category tabs still need to be checked case-by-case before converting or confirming child-route behavior.

## Goals

- Implement a CNAP 2.0 application shell with 56px local placeholder Header, 60px primary sidebar, optional 200px secondary sidebar, optional 60px secondary collapsed rail, and 32px main content side spacing.
- Preserve cloud Header behavior for online/sandbox integration while aligning local Header placeholder and top context selector with the Figma placeholder baseline.
- Split primary business navigation from secondary business navigation while keeping More and bottom utility entries as fixed UI controls inside the primary sidebar component.
- Implement primary business entry overflow based on measured distance between business icon container and bottom utility container, with More popover and session-level replacement persistence.
- Implement secondary sidebar expand/collapse control in the first implementation slice, with current-session layout state that survives primary business entry switching.
- Ensure page-level category tabs that are in scope for this slice are represented as child routes with complete URLs.
- Keep Agent navigation route compatibility intact by preserving registry-driven route targets and active-state semantics.

## Non-Goals

- Do not implement the full cloud Baidu Header or infer unknown cloud Header custom areas.
- Do not redesign business page content beyond fitting it into the new layout shell.
- Do not rework Agent tool execution, structured tool result contracts, or navigation context capabilities unless route compatibility requires a narrow adjustment.
- Do not over-model More, bottom utility entries, or page category tabs as primary/secondary business navigation entries.
- Do not add new product modules outside the existing navigation registry scope.

## Task Route

- Type: app-layer design change and multi-module implementation.
- Owner Docs: `docs/requirements/cnap2-application-layout-navigation.md`, `docs/design/application-layout-guidelines.md`, `docs/requirements/agent-navigation-context-capabilities.md`, `docs/architecture/navigation-system.md`.
- Skill: none.

## Execution Plan

### Phase 1 - Shell Baseline And Header Alignment

Status: implemented; visual manual verification pending

- [x] Add: Update layout constants and shell structure to support 56px Header, 60px primary sidebar, 200px expanded secondary sidebar, and 60px collapsed secondary rail. Skill: none.
- [x] Add: Align local placeholder Header and top context selector with the Figma placeholder baseline while preserving cloud Header portal behavior. Skill: none.
- [x] Fix: Ensure main content area derives left offset from active sidebar state and always keeps 32px left/right content spacing. Skill: none.
- [ ] Proof: Add or update focused layout tests where existing test patterns support shell behavior; otherwise record manual verification steps. Skill: none.

[ ] Exit Criteria:

- [x] Local fallback Header renders at 56px and cloud Header portal behavior remains intact.
- [ ] Content spacing matches no-secondary, collapsed-secondary, and expanded-secondary layout states through manual visual verification.
- [x] Relevant docs or comments are aligned if implementation reveals a layout constraint not captured in the requirement.

### Phase 2 - Primary Sidebar And Overflow

Status: implemented; overflow manual verification pending

- [x] Add: Implement primary sidebar as a 60px business rail with fixed bottom utility entries and a fixed More overflow trigger. Skill: none.
- [x] Add: Derive primary business entries from navigation configuration while keeping More and utility entries component-owned fixed UI controls. Skill: none.
- [x] Add: Implement overflow detection by measuring business icon container, bottom utility container, and full primary sidebar container, then triggering overflow when their actual gap is below 52px. Skill: none.
- [x] Add: Hide lower-priority primary business entries from the configured order backward while skipping the active business entry and always preserving at least one visible business entry plus More. Skill: none.
- [x] Add: Implement More popover with hidden business entries, no More active state, and session-level replacement persistence through LocalStorage. Skill: none.
- [ ] Proof: Cover overflow ordering, active-entry skip, replacement, and persistence with focused tests or documented manual verification if DOM measurement makes automated coverage impractical. Skill: none.

[ ] Exit Criteria:

- [x] More never becomes the active navigation entry.
- [x] Hidden active business entry is promoted above More, and the replaced entry moves into More.
- [x] Replacement survives browser-session route changes and refresh when LocalStorage is available.
- [ ] Height-constrained viewport behavior has proof through tests or documented manual verification.

### Phase 3 - Secondary Sidebar And Route Semantics

Status: partially implemented; route tab audit pending

- [x] Add: Render secondary navigation only when the active primary business entry has secondary entries. Skill: none.
- [x] Add: Implement expanded 200px secondary sidebar and collapsed 60px icon rail, including the collapse control in this first implementation slice. Skill: none.
- [x] Add: Keep secondary collapse state as current-session layout state that does not reset when switching primary business entries. Skill: none.
- [x] Fix: Preserve active secondary business entry behavior and tooltip behavior in collapsed rail. Skill: none.
- [ ] Decision: For each page-level category tab encountered during implementation, confirm or convert it to a child route rather than component state or query-only switching. Alternative considered: keep component-local tabs. Rejected because complete URLs must deep-link to each category. Remaining risk: some existing pages may need follow-up route restructuring outside the first slice. Skill: none.
- [ ] Proof: Add or update route/layout tests for secondary active state and child-route tabs where feasible. Skill: none.

[ ] Exit Criteria:

- [x] Secondary sidebar switches between 200px expanded and 60px collapsed rail.
- [x] Secondary collapse state survives primary business entry switching during the session.
- [ ] In-scope page category tabs are child routes with complete URLs.
- [x] Agent navigation targets still resolve to correct routes after layout changes.

### Phase 4 - Verification And Documentation Alignment

Status: verification run; docs/log update in progress

- [x] Proof: Run `yarn lint-type`. Skill: none.
- [x] Proof: Run focused tests for changed layout/navigation modules, then broader `yarn test` if focused tests pass. Skill: none.
- [x] Proof: Run `yarn build`. Skill: none.
- [x] Proof: Run `yarn lint` and document any pre-existing unrelated lint debt separately from this plan's outcome. Skill: none.
- [ ] Add: Update `docs/design/application-layout-guidelines.md`, `docs/requirements/cnap2-application-layout-navigation.md`, or architecture docs only if implementation changes supported behavior or reveals a missing constraint. Skill: none.
- [ ] Add: Update `docs/logs/2026/07-02.md` with implementation and verification results. Skill: none.

[ ] Exit Criteria:

- [x] Typecheck, tests, and build outcomes are recorded.
- [x] Lint outcome is recorded, including any unrelated existing failures.
- [x] Requirement/design docs remain consistent with final behavior.
- [ ] Daily log records implemented scope and verification status.

Verification notes:

- `yarn lint-type`: passed.
- `yarn test`: passed, 10 files and 69 tests.
- `yarn build`: passed; Vite reported existing large chunk warnings.
- `yarn lint`: failed only on unrelated existing issues outside this implementation slice: `src/contexts/navigationContextMachine.ts`, `src/design/Loading/LoadingProgress.tsx`, `src/navigation/registry.ts`, `src/pages/Applications/RuntimeConfig/components/MountVolumeList.tsx`, `src/pages/Applications/RuntimeConfig/components/ResourceLimit.tsx`, `src/utils/date.ts`, and `src/utils/i18n/index.ts`.
- Subagent review follow-up: fixed content area Header overlap, LocalStorage dirty-value crash, LocalStorage write exceptions, navigation shell file length, inline style, import order, and max-length findings; intentionally left the ResizeObserver compatibility finding unfixed per review scope.

## Closure Gates

- [ ] All in-scope behavior from `docs/requirements/cnap2-application-layout-navigation.md` is implemented or explicitly moved to a follow-up with rationale.
- [ ] Local Header, primary sidebar, More overflow, secondary sidebar, content spacing, and page-category route behavior have verification evidence.
- [ ] Cloud Header portal behavior is not regressed.
- [ ] Agent navigation route compatibility is checked for changed routes or active-state behavior.
- [ ] Relevant docs and `docs/logs/` are updated.
- [ ] Verification commands have run and outcomes are recorded.
- [ ] Independent closure audit accepts completion before Plan Status changes to `completed`.

## Risks And Follow-ups

- DOM measurement for overflow may be brittle if layout refs are not isolated; implementation should prefer stable container refs and resize observation.
- Existing single-Sider code may require careful migration to avoid breaking current route active-state behavior.
- Page category tabs may be unevenly implemented across pages; any page requiring larger route restructuring should be called out before broad changes.
- Local Header visual alignment may be limited by cloud Header integration uncertainty; online/sandbox behavior remains governed by the cloud Header contract.
