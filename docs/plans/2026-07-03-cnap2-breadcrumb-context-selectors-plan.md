# 2026-07-03 CNAP 2.0 Breadcrumb Context Selectors Plan

> Plan Status: in progress
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-03
> Source: `docs/requirements/cnap2-breadcrumb-context-selectors.md`

## Current Baseline

- `src/routers/AppLayout/index.tsx` renders the AppLayout shell and composes top navigation, workspace navigation, and workspace content layout.
- Top navigation code is grouped under `src/routers/AppLayout/topNavigation/`.
- Current `TopNavContent.tsx` renders static breadcrumb placeholder content inside the local/cloud Header content area.
- Navigation context state already exists in `NavigationContext` and route metadata already declares account/application/environment context requirements.
- Breadcrumb context selector requirements are documented in `docs/requirements/cnap2-breadcrumb-context-selectors.md`.

## Target Outcome

Implement local Header breadcrumb context selectors for CNAP 2.0:

- Account selector.
- Application selector.
- Environment selector.
- Shared breadcrumb container that controls dimension selector width.
- Shared Select-based dropdown panel pattern for account/application/environment.
- Minimal mock/data adapter layer sufficient for current UI behavior.

The implementation must keep layout responsibility separate from business state, filtering, context cascade rules, and data adaptation.

## Non-Goals

- Do not solve cloud Header integration in this plan.
- Do not define final backend API contracts.
- Do not implement row shortcut business actions.
- Do not implement footer button business actions.
- Do not implement advanced search, pinyin search, fuzzy ranking, or keyword highlighting.
- Do not change primary/secondary workspace navigation behavior.

## Proposed File Structure

Create a dedicated breadcrumb module under top navigation. File boundaries should follow business module responsibility, not every internal Layout fragment.

```txt
src/routers/AppLayout/topNavigation/
  breadcrumb/
    BreadcrumbContextSelectors.tsx
    BreadcrumbContextSelectors.styles.ts
    breadcrumbContextData.ts
    breadcrumbContextTabs.ts
    breadcrumbContextFilter.ts
    breadcrumbContextWidth.ts
    useBreadcrumbContextSelectors.ts
    useBreadcrumbSelectorSearch.ts
    useBreadcrumbSelectorWidth.ts
    types.ts
```

`TopNavContent.tsx` should render the single exported `BreadcrumbContextSelectors` component where the current static breadcrumb lives. The caller should not need to know which internal pieces are layout-oriented and which are business-oriented.

## Component Responsibility Split

### Public Component: `BreadcrumbContextSelectors`

`BreadcrumbContextSelectors` is the only component imported by `TopNavContent.tsx`.

Responsibilities visible to callers:

- Render the full breadcrumb context selector experience.
- Hide all internal layout/business split details from the caller.
- Integrate account, application, and environment selectors into the Header breadcrumb area.

Internal responsibilities inside the file:

- Read current account/application/environment state from navigation context.
- Decide which dimension selectors are visible for the current route.
- Load or receive selector option groups for account/application/environment.
- Apply hierarchy cascade rules:
  - account change clears selected application/environment and clears application/environment option lists;
  - application change clears selected environment and clears environment option list;
  - lower-level option lists reload from the selected upper-level value.
- Render root breadcrumb item, separators, visible dimension selectors, and trailing page label.
- Keep the breadcrumb middle area at least 60px from right Header controls.
- Render each dimension selector using AntD `Select` with custom dropdown content.
- Render account/application/environment dropdown content, tabs, rows, placeholder shortcut icons, favorite stars, divider, Empty state, and footer placeholder buttons.

Internal layout-oriented helper components may live in `BreadcrumbContextSelectors.tsx` when that keeps the module easier to read. They do not need separate files unless the file becomes too large or a helper is reused elsewhere.

### Internal Layout Boundary

Layout and business logic should still be separated conceptually, even if they live in the same file.

Layout-oriented internal components/functions own:

- Header breadcrumb arrangement.
- Selector max-width styling and text display.
- Dropdown panel frame.
- Search, tabs, list, row, divider, and footer visual structure.
- Figma spacing, sizes, color, hover, and selected states.

Business-oriented hooks/functions own:

- Current context state.
- Visible selector derivation.
- Option group selection.
- Debounced local contains filtering.
- Upper-to-lower dimension reset rules.
- Width calculation inputs and outputs.

The caller should not need to care about this split; it is an internal implementation discipline.

## Hooks And Pure Functions

### `useBreadcrumbContextSelectors`

Business hook.

Responsibilities:

- Build selector view models from navigation context and selector data.
- Expose account/application/environment selector configs.
- Apply upper-to-lower dimension reset rules.
- Keep route context requirements aligned with visible selectors.

### `useBreadcrumbSelectorSearch`

Business hook.

Responsibilities:

- Own debounced search keyword.
- Filter current tab options with local `contains`.
- Restore current tab list when search is empty.

### `useBreadcrumbSelectorWidth`

Layout-measurement hook.

Responsibilities:

- Measure breadcrumb container actual width.
- Count currently visible dimension selectors only.
- Return each dimension selector max width using `containerWidth / selectorCount * 1.2`.
- Keep the API extensible so future breadcrumb child types can register as measurable items.

### `breadcrumbContextWidth.ts`

Pure utility.

Responsibilities:

- Compute dimension selector max width from container width and item count.
- Provide simple middle-ellipsis text helper for first implementation.

### `breadcrumbContextFilter.ts`

Pure utility.

Responsibilities:

- Perform local `contains` filtering for account/application/environment options.
- For account options, match both `name` and `identifier`.

### `breadcrumbContextData.ts`

UI adapter file.

Responsibilities:

- Map API-returned selector option DTOs into render-ready breadcrumb option view models.
- Keep React icon creation and other UI-only field adaptation inside the breadcrumb module.
- Do not derive API-owned semantics such as favorites, recent items, permissions, availability, or environment classification.

### `breadcrumbContextTabs.ts`

Static UI configuration file.

Responsibilities:

- Define tab labels for account/application/environment selector dropdowns.
- Define empty option group values used while cascading context changes clear lower-level lists.

## Data Model

Use only the minimal fields from the requirement document.

- Account: `id`, `name`, `identifier`, `favorite`, `avatarText`.
- Application: `id`, `accountId`, `name`, `favorite`, `avatarText`.
- Environment: `id`, `applicationId`, `name`, `type`, `typeLabel`.
- Selector option groups: API/adapter returns tab arrays directly; frontend does not derive `全部可用`, `我收藏的`, or `最近访问` membership.

## Layout Rules

- Layout responsibility can be nested, but it does not require one file per Layout fragment.
- Layout-oriented internal components may live in the same file as the public business component when they are only used by that component.
- Internal components that are primarily layout-oriented may use a `Layout` suffix, but they do not need to be exported.
- Layout containers should use `@emotion/styled` where practical.
- Hook and pure utility layers own filtering, cascade rules, data adaptation, and width calculation decisions.
- Do not mix data fetching, navigation context mutation, or filtering directly into layout-oriented internal components.

## Implementation Steps

1. Create `breadcrumb/` module and define minimal selector types plus API-backed UI data adapter.
2. Implement `BreadcrumbContextSelectors` and wire it into `TopNavContent.tsx` where the static breadcrumb currently lives.
3. Add internal layout-oriented helpers inside `BreadcrumbContextSelectors.tsx` for breadcrumb arrangement, selector rendering, dropdown panel, tabs, rows, and footer.
4. Implement shared AntD `Select` custom dropdown behavior for account/application/environment selectors.
5. Implement account selector dropdown UI.
6. Implement application selector dropdown UI.
7. Implement environment selector dropdown UI.
8. Add debounced local contains search and Empty state.
9. Add tab switching based on returned option groups.
10. Add upper-to-lower dimension reset behavior.
11. Add breadcrumb width measurement and simple middle ellipsis.
12. Replace placeholder static breadcrumb labels with selector-driven labels.
13. Run verification and adjust layout details against Figma.

## Verification

Required commands:

- `yarn lint-type`
- `yarn test`
- `yarn build`

Manual checks:

- Account, application, and environment selectors open from the breadcrumb area.
- Search filters current tab after debounce with local contains.
- Empty tab/search results render AntD `Empty`.
- Account change clears application/environment selection and option lists before loading new application options.
- Application change clears environment selection and option list before loading new environment options.
- Row shortcut placeholders appear only on hover and do not bind events.
- Footer buttons render as placeholders and do not bind events.
- Breadcrumb middle area keeps at least 60px from right Header controls.
- Dimension selector max width follows `containerWidth / visibleDimensionSelectorCount * 1.2`.
- Long selector labels use middle `...` while preserving beginning and end.

## Documentation Updates

During or after implementation, update:

- `docs/logs/2026/07-03.md` or the current daily log.
- `docs/architecture/navigation-system.md` if new breadcrumb module boundaries become stable.
- `docs/requirements/cnap2-breadcrumb-context-selectors.md` only if requirement decisions change.

## Risks And Follow-Ups

- The Select custom dropdown may need careful event handling to keep search, tabs, row selection, and placeholder buttons from fighting AntD default close behavior.
- Simple middle ellipsis may not be visually perfect for mixed-width characters; this is accepted for the first implementation.
- Placeholder shortcut and footer controls should look intentional while remaining non-functional.
- Selector data must stay behind API functions so switching from static data to server data does not require rewriting layout components.
