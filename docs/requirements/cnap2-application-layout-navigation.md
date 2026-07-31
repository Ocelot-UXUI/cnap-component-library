# CNAP 2.0 Application Layout And Navigation Requirement

## Status

Draft for implementation planning.

## Source

- Design baseline: `docs/design/application-layout-guidelines.md`
- Input index: `docs/input/source-design-cnap2-2026-figma-links.md`
- Related navigation capability baseline: `docs/requirements/agent-navigation-context-capabilities.md`

## Goal

Implement the CNAP 2.0 application shell and navigation interaction baseline so users can navigate between top-level workspaces, second-level pages, and page-level category routes with stable layout behavior across normal and height-constrained viewports.

## Scope

This requirement covers:

- Local development placeholder Header.
- Primary sidebar visual structure and overflow behavior.
- More popover behavior for hidden primary business entries.
- Secondary sidebar expanded and collapsed states.
- Main content spacing rules.
- Page-level category tabs as child routes.
- Lightweight navigation configuration model for primary and secondary business entries.

This requirement does not cover:

- Full cloud Baidu Header implementation for online or sandbox environments.
- Unknown cloud Header custom areas beyond product name and breadcrumbs.
- New business page content implementation.
- Reworking Agent navigation capabilities beyond keeping routes compatible with the navigation registry.

## Header Requirements

- Online and sandbox environments should use the unified cloud Baidu Header.
- Local development should render a placeholder Header to simulate product name, breadcrumbs, and required context display.
- Product name and breadcrumbs are currently known custom areas.
- Search, utility actions, avatar, and other cloud Header areas remain integration-dependent and should not be treated as locally owned UI.
- The Header height must remain 56px.
- The current top context selector should visually align with the Figma Header placeholder during local implementation.

## Primary Sidebar Requirements

- Primary sidebar width must be 60px and start below the 56px Header.
- Primary sidebar must contain a business icon area and a fixed bottom utility icon area.
- Bottom utility icons do not participate in business entry overflow and may be implemented as fixed UI inside the component.
- Primary business entries are the only primary sidebar entries that can represent the current business location.
- The More entry is an overflow trigger, not a business entry, and must not have active state.
- The More entry may show hover, focus, or popover-open visual state.

## Primary Overflow Requirements

- Overflow detection should measure layout containers instead of summing every business icon's configured height.
- The implementation should get the height or bounds of the business icon container, the bottom utility container, and the full primary sidebar container.
- The implementation should use these measured containers to derive the actual distance between the business icon container and the bottom utility container.
- Business entry overflow is triggered when that distance is less than 52px.
- When overflow is triggered, primary business entries should hide from the end of the configured business order backward.
- The currently active business entry must be skipped during automatic hiding.
- The business icon area must always keep at least one visible business entry and the More entry.
- Hidden business entries must be shown in the More popover in the configured business order.
- When a hidden business entry becomes active, it must move into the visible business icon area and replace the visible business entry immediately above More.
- The replaced visible business entry must move into the More popover.
- The replacement result must remain for the browser session and may be cached in LocalStorage.

## More Popover Requirements

- More popover opens from the More entry and contains hidden primary business entries.
- Popover width should be about 196px, with dark background, about 12px radius, and about 12px vertical / 8px horizontal padding.
- Popover items should be about 52px x 52px with about 8px gap.
- The popover may show a weak group title such as `更多功能`.
- Selecting a business entry closes the popover, activates that business entry, applies the replacement rule, and renders that workspace's secondary navigation if configured.

## Secondary Sidebar Requirements

- Secondary sidebar appears only when the active primary business entry has secondary navigation.
- Expanded width must be 200px.
- Collapsed rail width must be 60px.
- Expanded state shows workspace title and text navigation items.
- Collapsed state shows icon-only navigation items with tooltip on hover or active item.
- Secondary active state belongs to secondary business entries.
- Secondary collapse state is a current-session layout state, not a long-term user preference.
- If the user expands it, it remains expanded; if the user collapses it, it remains collapsed.
- Switching primary business entries must not reset the previous secondary collapse state.
- The first implementation slice must include the secondary sidebar collapse control.

## Content Layout Requirements

- Main content area must keep 32px horizontal spacing on both sides in all sidebar states.
- With no secondary sidebar, content starts after 60px primary sidebar plus 32px spacing.
- With collapsed secondary rail, content starts after 60px primary sidebar, 60px secondary rail, and 32px spacing.
- With expanded secondary sidebar, content starts after 60px primary sidebar, 200px secondary sidebar, and 32px spacing.
- Header-to-page-title spacing should be about 24px.
- Page title-to-content spacing should be about 16px.
- Bottom spacing should be about 24px.

## Page Category Tab Requirements

- Page-level category tabs must be implemented as child routes.
- Each tab must correspond to a complete URL that can be refreshed, copied, and opened directly.
- Category tabs must not be implemented only as component state or query parameter switching.
- Category tabs belong to page title area UI and should not be mixed into primary or secondary navigation configuration.

## Navigation Configuration Requirements

- Navigation configuration only needs to distinguish primary business entries and secondary business entries.
- More and bottom utility entries are fixed UI controls implemented inside the primary sidebar component.
- Page category tabs are child routes owned by their page or route group, not primary or secondary navigation entries.
- The implementation should avoid over-modeling fixed UI controls as business navigation nodes.

## Acceptance Criteria

- Local development renders a 56px placeholder Header with product and breadcrumb context.
- Primary sidebar keeps bottom utility icons fixed while business entries overflow into More when available height is insufficient.
- More never appears as the active navigation entry.
- Activating a hidden primary business entry promotes it above More and moves the replaced entry into the popover.
- Promoted hidden business entry remains visible for the browser session after route changes or refresh, subject to LocalStorage availability.
- Secondary sidebar can switch between 200px expanded and 60px collapsed widths.
- Secondary collapse state survives primary business entry switching during the current session.
- Main content keeps 32px left and right spacing in no-secondary, collapsed-secondary, and expanded-secondary layouts.
- Page category tabs are addressable by complete child-route URLs.

## Resolved Decisions

- The current top context selector should visually align with the Figma Header placeholder for local implementation.
- The secondary sidebar collapse control is included in the first implementation slice.
