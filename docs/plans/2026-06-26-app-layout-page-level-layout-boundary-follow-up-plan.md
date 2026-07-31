# 2026-06-26 AppLayout Page-Level Layout Boundary Follow-up

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-06-26
> Source: user follow-up: 页面级布局定义、Layout 命名和样式归属规则收紧

## Current Baseline

- `docs/plans/2026-06-25-app-layout-separation-refactor-plan.md` 已完成并关闭，主体 AppLayout 布局/业务分离已落地。
- 当前实现仍有 follow-up 调整空间：
  - `WorkspaceSidebar.styles.ts` 和 `WorkspaceContent.styles.ts` 将组件私有样式拆到了独立 TS 文件。
  - 已抽出的部分页面区域组件未统一以 `Layout` 结尾，例如 `WorkspaceSidebar`、`WorkspaceContent`、`FallbackTopNav`、`ICloudTopNav`。
  - `TopNavContent` 和 `SidebarMenu` 作为业务内容已被放入布局结构，但页面级布局边界的判断规则尚未沉淀到本计划的关闭标准。
- 用户已确认新的判断规则：如果一个组件在语义上可以表明自己明确占据页面的哪一部分，则该组件所处空间的布局信息必须外置为 Layout 组件。
- 上一轮验证中 `yarn lint` 仍有无关既有问题，后续关闭时需继续如实记录。

## Goals

- [x] 将页面级布局边界定义落实到 AppLayout follow-up 实现中。
- [x] 页面级布局组件统一以 `Layout` 结尾，并在命名中体现其当前承担的布局职责。
- [x] 将组件私有样式放回对应 TSX 文件内，不保留单独的 `*.styles.ts` 文件。
- [x] 保持上一轮 AppLayout 行为不变：导航、fallback、selected state、sidebar collapse、iCloud portal、fallback header 和主题行为不变。
- [x] 让业务组件只填充父级 Layout 提供的空间，不持有页面级定位、尺寸、滚动或区域关系。

## Non-Goals

- 不重新设计 AppLayout 视觉样式。
- 不修改 navigation registry、route hierarchy、context requirement 或 Agent navigation 语义。
- 不修复与本 follow-up 无关的既有 lint 问题。
- 不修改已废弃的 `src/capabilities/`。
- 不把所有普通容器都强制改成 `Layout`；仅处理页面级布局边界。

## Task Route

- Type: architecture change + implementation-only refactor
- Owner Docs: `AGENTS.md`, `docs/design/app-overview.md`, `docs/design/navigation-system.md`, `docs/architecture/navigation-system.md`, `docs/architecture/module-boundaries.md`
- Related Context: `docs/plans/2026-06-25-app-layout-separation-refactor-plan.md`
- Skills: none

## Page-Level Layout Boundary Rule

- 如果一个组件在语义上可以表明自己明确占据页面的哪一部分，则该组件所处空间的布局信息必须外置为 `*Layout` 组件。
- 页面级布局组件负责：页面区域占位、尺寸、定位、滚动容器、跨区域关系、动画容器和 portal/frame 容器。
- 业务组件负责：填充父级 Layout 提供的空间、业务数据渲染、交互命令和组件内部局部排版。
- 业务组件可以拥有内部 `flex`、`gap`、局部 padding 等排版；不能拥有页面级 `fixed/sticky`、workspace/header/sidebar 尺寸、主滚动容器或跨区域 margin 关系。
- Layout 组件可以通过 `children` 或少量具名 slot 承载业务内容，但不应 import navigation registry、context fallback helper 或具体业务数据派生逻辑。

## Target Component Inventory

- `WorkspaceLayout.tsx`: layout, workspace shell area, keep `WorkspaceLayout` unless implementation reveals a clearer shell name is needed.
- `WorkspaceSidebar.tsx`: layout, sidebar page area, rename to `WorkspaceSidebarLayout.tsx`.
- `WorkspaceContent.tsx`: layout, main content page area, rename to `WorkspaceContentLayout.tsx`.
- `FallbackTopNav.tsx`: layout, local header page area, rename to `FallbackTopNavLayout.tsx`.
- `ICloudTopNav.tsx`: layout, iCloud shell portal frame, rename to `ICloudTopNavPortalLayout.tsx`.
- `TopNavContent.tsx`: business content, keep non-Layout name.
- `SidebarMenu` usage: business content, extract to required `WorkspaceNavigationMenu.tsx` so AppLayout composes a business component into the sidebar layout slot.
- `useAppLayoutNavigation.ts`: business/navigation orchestration hook, keep non-Layout name.
- `navigationIcons.tsx`: business/navigation presentation metadata, keep non-Layout name.

## Target Naming Direction

- `WorkspaceLayout` 保留或调整为表达 workspace shell 职责。
- `WorkspaceSidebar` 调整为 `WorkspaceSidebarLayout`。
- `WorkspaceContent` 调整为 `WorkspaceContentLayout`。
- `FallbackTopNav` 调整为 `FallbackTopNavLayout`。
- `ICloudTopNav` 调整为 `ICloudTopNavPortalLayout`。
- `TopNavContent` 保持业务内容命名，不以 `Layout` 结尾。
- 新增 `WorkspaceNavigationMenu` 作为业务菜单组件，用于承载 `SidebarMenu` 的业务渲染。

## Static Boundary Audit Checklist

- No `src/routers/AppLayout/*.styles.ts` files remain for component-private styles.
- All target page-level layout files under `src/routers/AppLayout/` end with `Layout.tsx`.
- Business components under `src/routers/AppLayout/` do not use the `Layout` suffix.
- Layout components do not import `@/navigation`, `navigationContextData`, `getNavigationNode`, `getSidebarGroups`, `getWorkspaceMenuGroup`, or `getWorkspaceStoredContext`.
- Business components do not define page-level `position: fixed`, `position: sticky`, workspace/header/sidebar dimensions, or main scroll containers.
- `yarn verify:router-paths` continues to pass, proving internal router navigation does not regress to `toUrl()`.

## Execution Plan

### Phase 1 - Normalize AppLayout Component Boundaries

Status: completed

- [x] Fix: rename page-level layout components so they end with `Layout` and express their page-area responsibility. Skill: none
- [x] Fix: keep non-layout business components out of `Layout` naming, including top nav business content and sidebar navigation menu. Skill: none
- [x] Fix: update imports and references without changing runtime behavior. Skill: none

[x] Exit Criteria:

- [x] Every page-area component under `src/routers/AppLayout/` that owns page-level space is named `*Layout`.
- [x] Business components under `src/routers/AppLayout/` do not use `Layout` suffix.
- [x] AppLayout still composes layout components first and renders business components into their slots.

### Phase 2 - Co-locate Component Styles

Status: completed

- [x] Fix: merge `WorkspaceSidebar.styles.ts` into the corresponding sidebar layout TSX file. Skill: none
- [x] Fix: merge `WorkspaceContent.styles.ts` into the corresponding content layout TSX file. Skill: none
- [x] Fix: delete obsolete standalone style files after verifying all imports are removed. Skill: none
- [x] Proof: keep resulting TSX files within the 150-line guideline where practical; if a file exceeds the guideline, record why or split by layout responsibility instead of extracting styles-only files. Skill: none

[x] Exit Criteria:

- [x] No component-private AppLayout styles live in standalone `*.styles.ts` files.
- [x] Layout style definitions are colocated with the layout component that owns them.
- [x] Shared constants remain in existing constants modules rather than component-private style files.

### Phase 3 - Strengthen Business Slots

Status: completed

- [x] Fix: introduce or retain explicit business components for workspace navigation menu and top nav content. Skill: none
- [x] Fix: ensure layout components receive business content through `children` or explicit slot props. Skill: none
- [x] Proof: statically check that layout components do not import `@/navigation`, `navigationContextData`, or business derivation helpers. Skill: none

[x] Exit Criteria:

- [x] Sidebar menu rendering lives in a business component or AppLayout composition, not inside the sidebar layout component.
- [x] Top nav business content is rendered into fallback and iCloud portal layouts, not derived inside those layout shells.
- [x] Business components do not define page-level geometry such as fixed positioning, workspace/sidebar/header dimensions or main scroll containers.

### Phase 4 - Verify And Close

Status: completed

- [x] Proof: run `yarn lint-type`. Skill: none
- [x] Proof: run `yarn test`. Skill: none
- [x] Proof: run `yarn verify:router-paths`. Skill: none
- [x] Proof: run `yarn build`. Skill: none
- [x] Proof: run `yarn lint` and record unrelated existing failures if still present. Skill: none
- [x] Proof: run independent closure audit. Skill: none
- [x] Add: update `docs/architecture/module-boundaries.md` with the page-level layout boundary rule if implementation confirms it as reusable architecture guidance. Skill: none
- [x] Add: update `docs/logs/2026/06-26.md` or the current dated log. Skill: none

[x] Exit Criteria:

- [x] AppLayout follow-up changes are behavior-preserving.
- [x] Page-level Layout naming and style colocation rules are enforced in touched AppLayout files.
- [x] Verification outcomes and closure audit are recorded.

## Verification

- Passed: `yarn lint-type`
- Passed: `yarn test` (6 files, 50 tests)
- Passed: `yarn verify:router-paths`
- Passed: `yarn build`
- Failed with unrelated existing issues: `yarn lint`
  - `src/design/Loading/LoadingProgress.tsx`: `any`
  - `src/navigation/registry.ts`: max-lines from navigation registry work
  - `src/pages/Applications/RuntimeConfig/components/MountVolumeList.tsx`: max-lines
  - `src/pages/Applications/RuntimeConfig/components/ResourceLimit.tsx`: max-lines
  - `src/utils/date.ts`: unused caught error
  - `src/utils/i18n/index.ts`: `any`
- Static layout/business boundary audit passed:
  - no `src/routers/AppLayout/*.styles.ts` files remain
  - page-area layout components use `*Layout.tsx` names
  - business components do not use `Layout` suffix
  - layout components do not import navigation registry or context fallback helpers
  - business components do not define page-level geometry

## Review Record

- Draft review: `Explore_4361792` found no P0 but required plan revisions before implementation; P1 issues resolved by adding stable owner docs, explicit component inventory, concrete static audit checklist and durable review evidence.
- Re-audit: passed; no remaining P0/P1 blockers. The plan was accepted for implementation.
- Closure audit: `Explore_4370105` found no code-level P0/P1 issues; the only P1 was missing durable plan verification/closure evidence, resolved by this update.
- Closure review: completed; no remaining P0/P1 blockers.

## Closure Gates

- [x] in-scope behavior is complete
- [x] page-level layout boundary rule has been applied to AppLayout files
- [x] component-private styles are colocated with owning TSX components
- [x] relevant docs/logs are aligned
- [x] verification has run
- [x] closure audit was independent
