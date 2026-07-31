# Feature: CNAP 2.0 Breadcrumb Context Selectors

## Status

Draft for UI and interaction requirement review. No implementation is implied by this document.

## Source Inputs

- Figma: 面包屑/账户下拉
- Figma: 面包屑/应用下拉
- Figma: 面包屑/环境下拉
- Figma: 其他细节
- `docs/design/navigation-system.md`
- `docs/design/application-layout-guidelines.md`
- `docs/architecture/navigation-system.md`
- `docs/requirements/cnap2-sidebar-navigation-mvp.md`
- `docs/requirements/cnap2-application-layout-navigation.md`

## Goal

Define the user-visible UI and interaction requirements for the CNAP 2.0 top breadcrumb context selectors: account, application, and environment.

These selectors should let users understand and switch the current business context from the top navigation breadcrumb while preserving the existing navigation model: account > application > environment.

## In Scope

- Breadcrumb display rules for account, application, and environment context segments.
- Dropdown panel layout for account, application, and environment selection.
- Search, tabs, list item states, favorite behavior, row actions, and footer actions visible in the selected Figma nodes.
- Avatar/icon display rules for account and application rows.
- Environment tag display rules.
- Interaction rules when users open, search, filter, select, favorite, or invoke actions from the dropdowns.
- UX constraints for the current local development Header and AppLayout breadcrumb area.

## Out Of Scope

- Code implementation.
- API contract design for fetching accounts, applications, environments, favorites, or recent visits.
- Real permission workflow implementation for apply-permission actions.
- Cloud Baidu Header integration details; current work is scoped to local development.
- Mobile or narrow-screen redesign.
- Replacing existing navigation state-machine architecture.
- Agent navigation behavior changes beyond preserving the existing account > application > environment context model.

## Minimal Data Model Requirements

The first implementation should use the smallest field set needed to satisfy the current UI and interaction requirements.

### Account

- `id`: unique account identifier used for selection.
- `name`: account display name shown in breadcrumb and dropdown row.
- `identifier`: secondary account identifier shown under the account name.
- `favorite`: whether the account appears as favorited.
- `avatarText`: fallback first character for generated avatar.

### Application

- `id`: unique application identifier used for selection.
- `accountId`: parent account identifier.
- `name`: application display name shown in breadcrumb and dropdown row.
- `favorite`: whether the application appears as favorited.
- `avatarText`: fallback first character for generated avatar.

### Environment

- `id`: unique environment identifier used for selection.
- `applicationId`: parent application identifier.
- `name`: environment display name shown in breadcrumb and dropdown row.
- `type`: environment category used by tabs.
- `typeLabel`: environment tag text shown in the row.

### Selector Option Groups

Each selector receives all tab data from its API response at once. The frontend does not compute `全部可用`, `我收藏的`, or `最近访问` membership by itself in the first implementation.

- Account selector data contains option arrays for all account tabs.
- Application selector data contains option arrays for all application tabs.
- Environment selector data contains option arrays for all environment tabs.
- If any tab option array is empty, show an AntD `Empty` component in the list area.

## Breadcrumb Display Requirements

The breadcrumb starts from the CNAP root and then displays business context segments as required by the current page.

- Root segment: home icon + `CNAP`.
- Segment separator: right arrow icon, visually 16px x 16px, with about 12px horizontal spacing around segments.
- Context segments use 14px text, 22px line height, regular weight, and dark neutral text.
- Context segments that can be switched include a small switch/dropdown icon after the label.
- Account segment displays the selected account name.
- Application segment displays the selected application name.
- Environment segment displays the selected environment name when the page requires environment context.
- Environment type may appear as a compact tag next to the application or environment label, as shown by the `生产环境` tag in Figma.
- Current page title, such as `日志`, appears after the context chain and is not itself a context selector unless explicitly modeled later.

The breadcrumb container is the middle area of the local Header used to display the breadcrumb chain. It must always keep at least 60px distance from the Header elements on its right.

The maximum width of each dimension selector is defined by the breadcrumb container as a whole. In the first implementation, the counted child items are only dimension selectors: account, application, and environment.

The model should remain extensible: future breadcrumb child item types can participate in the same width calculation by registering themselves as measurable breadcrumb items.

Initial algorithm:

- The breadcrumb container must know how many dimension selectors it needs to display.
- The dimension selector count is dynamic and changes with the current route/context requirement.
- Let `A = breadcrumb container actual width / dimension selector count`.
- Each dimension selector's max width is `A * 1.2`.
- Dimension selectors do not have a fixed width or minimum width.
- Each dimension selector adapts to its content while staying within its computed max width.
- If a dimension selector's text exceeds its computed max width, the displayed text keeps the beginning and end of the original text and replaces the middle with `...`.
- The first implementation can use a simple middle-ellipsis algorithm and does not need special handling for emoji, combined Unicode characters, or other special-character edge cases.
- The ellipsis behavior applies to the text inside the selector, not to separator icons or switch icons.

When space is constrained, the implementation must preserve readability and avoid overlapping the Header search/actions area.

## Common Dropdown Panel Requirements

Account, application, and environment dropdowns share a common selection-panel pattern. The first implementation should be based on AntD `Select` with a custom dropdown panel.

- Each dimension selector is an extended Select-style control.
- Panel opens below the corresponding breadcrumb segment.
- Panel width is about 480px.
- Panel background is white.
- Panel corner radius is about 8px.
- Panel uses light shadow/elevation and should visually float above page content.
- Panel top padding is about 8px; bottom padding is about 4px.
- Panel includes a search input at the top.
- Search input height is 32px, radius about 8px, border `#e5e7eb`, horizontal padding about 12px.
- Search placeholder is context-specific:
  - Account: `请输入账户名称`
  - Application: `请输入应用名称`
  - Environment: `请输入环境名称`
- Search icon appears at the left of the input.
- Below search, tabs filter the list.
- Active tab uses dark text, medium weight, and a 2px black underline with about 4px radius.
- Inactive tabs use neutral text.
- List rows use 8px radius.
- Hover row uses light gray background `#f7f7f7`.
- Selected environment row can use pale green background `rgba(167, 243, 207, 0.2)`.
- A divider separates list content from footer actions.
- Footer actions are centered horizontally and use icon + text.

## Account Dropdown Requirements

### Panel Structure

Account dropdown panel size is about 480px x 370px.

It contains:

- Search input.
- Tabs:
  - `全部可用账户`
  - `我收藏的账户`
  - `最近访问`
- Link action at upper right of the tab/list area: `打开账户列表`.
- Account list.
- Footer actions:
  - `新建账户`
  - `申请账户权限`

### Account Row

Account rows are about 472px wide and 58px high.

Each row contains:

- 32px circular avatar.
- Primary account display name, 14px / 22px.
- Secondary account identifier, 12px / 20px, neutral text.
- Favorite icon at the right.
- On hover or active row, optional row actions can appear before favorite.

Rows in Figma show examples:

- Display name: `一站式测试账户`
- Identifier: `appspace-test`
- Display name: `码神专用账号码神专用账号`
- Identifier: `cnap-mashen`

### Account Row Actions

Hovered account row may expose shortcut icons before the favorite icon. The exact shortcut meanings and target routes are not determined yet.

Current requirement:

- Preserve the shortcut icon positions shown in Figma as visual placeholders.
- Do not assign business semantics or route behavior to shortcut icons until product confirms them.
- Include the more action placeholder where Figma shows it.
- Include the divider before favorite where Figma shows it.
- Keep the favorite star as the only confirmed row action with defined behavior.

### Account More Menu

The account row more menu is a visual placeholder until shortcut semantics are confirmed.

- The menu is about 120px wide and 108px high.
- It follows the Figma structure with three vertical items, each about 112px x 32px.
- Item labels and icons may follow the current Figma placeholder content.
- Hover item uses light gray background.
- The menu should appear adjacent to the row more action and remain visually above the selector panel.
- Menu items must not be treated as confirmed navigation targets until product confirms their meanings.

## Application Dropdown Requirements

### Panel Structure

Application dropdown panel size is about 480px x 330px.

It contains:

- Search input.
- Tabs:
  - `全部可用应用`
  - `我收藏的应用`
  - `最近访问`
- Link action at upper right: `打开应用列表`.
- Application list.
- Footer actions:
  - `新建应用`
  - `申请应用权限`

### Application Row

Application rows are about 464px wide and 48px high.

Each row contains:

- 32px circular avatar or generated icon.
- Application name, 14px / 22px.
- Favorite icon at the right.
- On hover or active row, optional row actions can appear before favorite.

Rows in Figma show examples:

- `test-sandbox-2`
- `kefu-c`
- `icafe-web-2`
- `icafe-web-20260530`

### Application Row Actions

Hovered application row may expose shortcut icons before favorite. The exact shortcut meanings and target routes are not determined yet.

Current requirement:

- Preserve the shortcut icon positions shown in Figma as visual placeholders.
- Do not assign business semantics or route behavior to shortcut icons until product confirms them.
- Include the more action placeholder where Figma shows it.
- Include the divider before favorite where Figma shows it.
- Keep the favorite star as the only confirmed row action with defined behavior.

## Environment Dropdown Requirements

### Panel Structure

Environment dropdown panel size is about 480px x 290px.

It contains:

- Search input.
- Tabs:
  - `全部环境`
  - `最近访问`
  - `生产环境`
  - `测试环境`
- Environment list.
- Footer action:
  - `新建环境`

Figma does not show `打开环境列表` or `申请环境权限`; these should not be added unless product confirms them.

### Environment Row

Environment rows are about 464px wide and 38px high.

Each row contains:

- 16px environment icon.
- Environment name, 14px / 22px.
- Environment type tag, height about 20px, radius about 4px, gray background.

Rows in Figma show examples:

- `imeonline` + `特殊环境`
- `icafe-web-2` + `固化环境`
- `kefu-c` + `Mesh环境`
- `icafe-web-20260530` + `特殊环境`

Selected environment row uses pale green background. Hover row uses light gray background.

## Avatar And Icon Requirements

Account and application avatars have two supported styles in the Figma details node.

### Preferred Generated Avatar Style

- 32px circular avatar.
- Unified pale green background with category-specific icon.
- Icon size about 20px.
- Avatar and label spacing about 8px.

### Alternative Logo Style

- 32px circular avatar.
- White or neutral background with subtle border.
- Logo icon in the center.

### Fallback Avatar Style

When no icon or logo is available:

- Use a colored circular background.
- Display the first English character of the account/application name.
- Character uses white text, 14px, medium weight.
- Figma examples use varied avatar colors, including pale green, blue, yellow, and purple.

The exact deterministic color palette and category-to-icon mapping require product/design confirmation.

## Interaction Requirements

### Opening And Closing

- Clicking a switchable breadcrumb segment opens its dropdown.
- Only one context dropdown should be open at a time.
- Clicking outside closes the open dropdown.
- Selecting an item closes the dropdown after the context switch completes or enters loading state.
- Pressing Escape should close the dropdown.

### Searching

- Typing in the search input filters the current tab's list locally after debounce.
- The first implementation only needs local `contains` matching.
- Search matches account/application/environment display name.
- For account, search also matches the secondary account identifier when available.
- Search scope follows the active tab.
- Empty search restores the active tab list.
- No pinyin, fuzzy matching, keyword highlighting, or relevance sorting is required in the first implementation.

### Tabs

- Tabs switch between option arrays returned by the selector API without closing the dropdown.
- The frontend does not compute tab membership in the first implementation.
- Active tab is visually indicated by underline and medium text.
- Account/application support available, favorites, and recent tabs.
- Environment supports all, recent, production, and test tabs.
- If the active tab has no options after API data or local search filtering, show an AntD `Empty` component.

### Selecting Context

Context selection follows the existing hard hierarchy: account > application > environment.

When an upper-level dimension changes:

- Clear all selected lower-level dimension values.
- Clear all lower-level option lists while waiting for new data.
- Reload lower-level option lists from the selected upper-level dimension.

Specific rules:

- Selecting an account updates account context, clears selected application and environment, clears application and environment option lists, then loads applications belonging to the selected account.
- Selecting an application must be scoped to the current account; it updates application context, clears selected environment, clears the environment option list, then loads environments belonging to the selected application.
- Selecting an environment must be scoped to the current account and application.
- After context changes, the current page intent should be preserved only when the selected context still satisfies the current route's context requirements.
- If the current page intent cannot be satisfied, behavior follows the navigation system's context preservation and reachability rules.

### Favorite

- Favorite star is visible on rows or at least on hover according to row state.
- Clicking favorite toggles favorite state without selecting the row, unless product decides otherwise.
- Favorite changes should update the corresponding `我收藏的账户` or `我收藏的应用` tab.
- Environment favorite behavior is not shown in Figma and should not be assumed.

### Row Actions

- Row shortcut icons are visual placeholders for now.
- Shortcut icons appear only when the row is hovered.
- Shortcut icons must be placed according to the Figma layout, but they do not bind click events in the first implementation.
- Placeholder shortcut icons must not trigger row selection.
- More action is also a hover-only placeholder and does not need to open a functional menu in the first implementation.
- Icon-only placeholders still need accessible placeholder labels so the UI remains inspectable.

### Footer Actions

Footer buttons are visual placeholders in the first implementation.

- Account footer shows `新建账户` and `申请账户权限` buttons.
- Application footer shows `新建应用` and `申请应用权限` buttons.
- Environment footer shows `新建环境` button.
- Footer buttons do not bind click events in the first implementation.
- Footer buttons must not change current context by themselves.

## Loading, Empty, Error, And Permission States

Figma does not show loading, empty, error, or permission-denied states. These are required before implementation is considered complete.

Minimum expected behavior:

- Loading: keep panel open and show a lightweight loading state in the list area.
- Empty search: show an empty state scoped to the current tab/search keyword.
- Fetch error: show an error state with retry affordance.
- Permission denied: unavailable rows should either be hidden or shown disabled according to permission product rules.
- Context switch failure: keep the prior context visible and communicate failure without leaving breadcrumb in a half-updated state.

The exact empty/error copy and disabled-row policy require confirmation.

## Accessibility Requirements

- Breadcrumb context segments must be keyboard focusable.
- Dropdowns must be keyboard dismissible with Escape.
- Search input should receive focus after dropdown opens.
- Rows should support keyboard navigation and selection.
- Favorite and row actions must be reachable independently from row selection.
- Icon-only actions must have accessible labels.

## Business Rules

- The top breadcrumb context selectors switch business context; they do not replace side workspace navigation.
- Account, application, and environment are hierarchical, not independent filters.
- Lower-level context must be validated when upper-level context changes.
- Context selector visibility should follow the current route's context requirements.
- The implementation must not duplicate route hardcoding inside selector UI; navigation targets should come from existing navigation/route metadata where possible.
- The current implementation target is the local development Header; cloud Header integration is intentionally outside this requirement for now.

## Open Questions

- When Header width is constrained beyond the defined dimension-selector max-width and middle ellipsis behavior, should context segments collapse or move into a menu?
- What are the exact meanings and route targets of account/application row shortcut icons after the placeholder phase?
- Does favorite toggle require optimistic update, confirmation on failure, or server-confirmed update before UI changes?
- What are the API-level sort rules for all, favorite, and recent tabs?
- Should tabs display counts?
- Should environment have favorite behavior or permission request behavior later?
- What avatar style is final: unified category icon, logo, or fallback initial as primary?
- What deterministic color palette should fallback initials use?
- What should happen when a selected context is deleted or loses permission while the panel is open?

## Acceptance Criteria

- The requirement clearly distinguishes account, application, and environment selector structures.
- Minimal data model fields are enough to render current selector UI without designing future API fields prematurely.
- Selector dropdowns are based on AntD `Select` with custom dropdown content.
- Breadcrumb display rules cover root, separators, context labels, switch icons, page title placement, 60px right-side spacing, and dimension-selector max-width calculation.
- Long dimension selector text keeps the beginning and end of the text and uses middle `...` when it exceeds the computed max width.
- Common dropdown layout rules cover panel size, search, tabs, list, divider, and footer placeholder actions.
- Account selector requirements include secondary identifier, tabs, list link, footer actions, favorite, and row action menu.
- Application selector requirements include tabs, list link, footer actions, favorite, and hover row actions.
- Environment selector requirements include environment type tabs, row tags, selected row state, and single create footer action.
- Avatar/icon generation rules cover preferred icon style and fallback first-character style.
- Interaction rules cover opening, closing, debounced local contains search, tabs, selection, favorite, hover-only placeholder row actions, and footer placeholder actions.
- Tabs render API-returned option groups, and empty tab data uses AntD `Empty`.
- The hard hierarchy account > application > environment remains explicit.
- Changing an upper-level dimension clears selected lower-level values and lower-level option lists before loading new lower-level options.
- Loading, empty, error, permission, and accessibility requirements are captured as implementation prerequisites.
- Open questions are explicit and do not masquerade as resolved decisions.
