# 2026-07-09 Global Content Layout Padding

> Plan Status: completed
> Owner: wangpengxiang01
> Last Reviewed: 2026-07-09
> Source: User request with Figma node `工作负载-快速置顶` (https://www.figma.com/design/JCMQwLARXjuh6FisEahXA4/%E3%80%902026%E8%A7%86%E8%A7%89%E3%80%91CNAP?node-id=602%3A25863)

## Starting Baseline

- `src/routers/AppLayout/index.tsx` owns the global app shell and renders `WorkspaceContentLayout` around routed pages.
- `src/routers/AppLayout/workspace/layout/WorkspaceContentLayout.tsx` controls the outer content frame position: top/right/bottom/left are based on `HEADER_HEIGHT`, sidebar widths, and `WORKSPACE_CONTENT_GUTTER`.
- `ContentArea` currently sets `padding: 0`, so page-level content padding is scattered across page components and legacy `src/design/Layouts/PageLayout.tsx`.
- `src/constants/layout.ts` defines `WORKSPACE_CONTENT_GUTTER = 32`; `src/constants/spacing.ts` defines `spacing.xl4 = 32`.
- `semantic.bg.page` is the tokenized page background (`#F5F7FA`) and is already wired into the CNAP2 theme as `colorBgLayout`.
- `src/routers/AppLayout/index.tsx` currently computes `workspaceBackground` from the active theme and passes it to `WorkspaceContentLayout`; this slice should preserve that theme path while making the default routed content area own padding and canvas treatment.
- Existing hard-coded colors in `AppLayout` and liquid-glass-specific styling predate this slice; this plan does not attempt a broad token cleanup unless needed for the layout-component change.

## Figma Evidence

- The selected Figma frame uses page background `rgba(245,247,250,1)`, matching `semantic.bg.page`.
- The content region starts at x=152 while the primary sidebar is 60px and secondary sidebar is 60px, leaving a 32px workspace gutter.
- Main content blocks use asymmetric page spacing: 24px on the vertical axis and 32px on the horizontal axis, mapping to `spacing.xl2` and `spacing.xl4`.
- Major modules use white surfaces over the page background, with the global shell responsible for the page canvas rather than individual pages setting their own full-screen background.

## Goals

- Move default page content inset responsibility into the global layout shell.
- Set the global routed content background through design tokens, using `semantic.bg.page` for the page canvas.
- Keep page/component-local spacing for internal cards, tables, filters, and section composition.
- Make future pages inherit sane default content padding without each page adding its own outer wrapper.

## Non-Goals

- Do not implement the full `工作负载-快速置顶` page in this slice.
- Do not copy generated Figma absolute-position HTML into the app.
- Do not redesign tables, cards, buttons, tags, top navigation, or side navigation.
- Do not change page-specific padding/background wrappers in the initial layout-baseline slice.
- Inspect and upgrade page-specific wrappers only after explicit user confirmation; confirmation was received on 2026-07-09.
- Do not change auth, API, AI executor, or capability contracts.

## Task Route

- Type: app-layer design change
- Owner Docs: `docs/design/app-overview.md`, `docs/design/design-tokens.md`, `docs/context/codebase-map.md`
- Skill: `figma2code` for Figma interpretation only; `none` for code execution because this is a layout baseline adjustment, not page generation.

## Execution Plan

### Phase 1 - Layout Baseline

Status: implemented

- Decision: Use `semantic.bg.page` for the routed content canvas and tokenized spacing for content inset. Alternative considered: keep `ContentArea` at `padding: 0` and require every page to wrap itself; rejected because it preserves the current drift.
- Fix: Update `WorkspaceContentLayout` so the global content area owns default page padding and background.
- Fix: Add or reuse layout constants for routed content inset if needed, preferring `spacing.xl4` over hard-coded numbers.
- Proof: Run `yarn lint-type` after implementation.

[x] Exit Criteria:

- [x] Routed pages receive a default content inset from the global shell.
- [x] The content canvas uses tokenized page background.
- [x] No new hex color literals are added.
- [x] `yarn lint-type` passes.

### Phase 2 - Page Wrapper Convergence

Status: implemented

- Decision: Treat standard routed pages as padded by `WorkspaceContentLayout`; page files may keep only local card/table/filter/form spacing.
- Decision: Treat immersive pages as layout-level full-bleed exceptions instead of using page-local negative margins.
- Fix: Remove duplicate page-level padding/background wrappers from identified pages and route loading state.
- Fix: Add an explicit full-bleed path rule for `AIChat`, with its content background owned by `WorkspaceContentLayout`.
- Proof: Run `yarn lint-type` after implementation.

#### Route Audit

- `/applications`: no duplicate page-level padding/background wrapper; header and list/card spacing remain local content layout.
- `/applications/:appId/overview`: no duplicate page-level padding/background wrapper; detail content spacing remains local content layout.
- `/applications/:appId/deployments`: no duplicate page-level padding/background wrapper; alert/card/table spacing remains local content layout.
- `/applications/:appId/settings`: no duplicate page-level padding/background wrapper; form/card spacing remains local content layout.
- `/applications/:appId/runtime-config`: removed duplicate outer padding; retained `maxWidth` as local form reading width.
- `/applications/:appId/startup-config`: removed duplicate outer padding; retained `maxWidth` as local form reading width.
- `/accounts`, `/environments`, `/clusters`, `/settings`, `/ai-debug`: no duplicate page-level padding/background wrapper found; section/filter spacing remains local content layout.
- `/ai-chat`: declared as a full-bleed route in `WorkspaceContentLayout`; removed page-local negative margin and page-local background.
- `/favorites`, `/recent`, `/pipelines`, `/changelog`, `/home`: no duplicate page-level padding/background wrapper found; `PageLayoutHeader` now has no page-level top margin.
- `/about`, `/example`: retained centered `max-width` wrappers as local content width constraints, not page canvas/padding/background ownership.
- `/border-glow-demo`: removed duplicate outer padding/min-height/background wrapper; demo-internal card styling remains local.
- `PageLayout`: removed the unused legacy page wrapper implementation so the `@/design/Layouts/PageLayout` entry no longer provides page-level padding/background/min-height behavior.

[x] Exit Criteria:

- [x] Design baseline documents the global shell responsibility.
- [x] Log entry exists for the initial layout baseline.
- [x] User confirmed the all-pages upgrade follow-up.
- [x] Standard pages no longer own duplicate outer padding/background wrappers found in the scan.
- [x] Immersive page exceptions are declared in the global layout component.
- [x] `yarn lint-type` passes after page convergence.
- [x] Closure audit accepts the result.

### Phase 3 - Workspace Flex Correction

Status: implemented

- Decision: `WorkspaceLayout` owns the horizontal composition of primary navigation, secondary navigation, and routed content.
- Fix: Remove fixed positioning and manual left offset calculation from workspace navigation/content layout; content now fills the remaining flex space.
- Fix: Align routed content padding to the visual spec: 24px vertical and 32px horizontal, with no duplicate outer frame margin.
- Proof: Run `yarn lint-type` after implementation.

[x] Exit Criteria:

- [x] Navigation and content participate in one horizontal workspace layout.
- [x] Routed content fills the remaining workspace width.
- [x] Content spacing uses only one padding layer: `spacing.xl2` vertically and `spacing.xl4` horizontally.
- [x] `yarn lint-type` passes.

## Closure Gates

- [x] In-scope layout behavior is complete.
- [x] Relevant docs are aligned.
- [x] Verification has run.
- [x] User has been asked whether to begin the all-pages upgrade follow-up.
- [x] Closure audit was independent.
