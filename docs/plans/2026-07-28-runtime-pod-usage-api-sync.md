# Runtime Pod Usage API Sync

> Plan Status: partially completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-28
> Source: Ku runtime workloads API document and user-confirmed scope

## Current Baseline

- The local API snapshot was refreshed on 2026-07-28 with both Pod Usage endpoints and user-confirmed corrections for the single Pod response.
- Runtime resource APIs currently cover summary, groups, workloads, pods, Pod detail, logs, and events, but code does not yet implement the two Usage endpoints.
- Live code still models ResourceQuota as numeric CPU/memory/storage and has no structured GPU list.
- The refreshed source models ResourceQuota values as quantity strings, retains `others`, and adds `gpus` entries with vendor/model/profile/count.

- Pod list and detail render usage from fields embedded in Pod responses; no dedicated Usage request exists.
- The batch Usage request body is `{ pods: {clusterId, name}[] }` and its direct array response contains `{clusterId, name, uid, resourceUsages}` records keyed by `clusterId + name`.
- The single Pod Usage direct response is `{clusterId, name, uid, resourceUsages, containers, initContainers}`. Both container fields contain `{name, resourceUsages}[]` of the same `ContainerUsage` type. The upstream sample incorrectly renders `containers` as one object and omits `initContainers`; the curated source will correct both issues.

- Resource usage, limit, and request fields share the same ResourceQuota shape.
- PodOperation duplicates only part of RuntimeOperation.
- The Pod detail drawer has unrelated uncommitted user changes that must be preserved.

## Goals

- Align ResourceQuota and PodOperation types with the latest upstream contract.
- Add batch Pod Usage and single Pod Usage API definitions.
- Hydrate Pod list and Pod detail usage from the dedicated endpoints without changing existing interaction behavior.
- Refresh `docs/input/source-api-runtime-workloads.md` with the latest corrected snapshot.
- Preserve quantity formatting and percentage calculations for supported Kubernetes resource units.

## Non-Goals

- Do not change hard-coded operation trigger names.
- Do not connect the container logs UI.
- Do not remove `/runtime/workloads`; the latest Restart section still depends on it.
- Do not refactor unrelated Workloads UI or overwrite existing uncommitted drawer changes.

## Task Route

- Type: user-confirmed implementation-only API contract sync with verification/audit
- Contract Source: `docs/input/source-api-runtime-workloads.md`; the active requirement/design do not define Pod Usage details and are not expanded by this slice.
- Context Docs: `docs/requirements/mvp.md`, `docs/design/app-overview.md`
- Skill: `docs/skills/api-sync-from-ku-prompt.md` for fetch/diff/implementation sequencing; `docs/skills/plan-audit-prompt.md` for draft review.

## Execution Plan

### Phase 1 - Source And Contract

Status: completed

- Add: refresh the curated local Ku source snapshot and summarize semantic changes.
- Decision: correct the malformed upstream samples so batch Usage directly returns `PodUsage[]`, where each item contains `clusterId`, `name`, `uid`, and `resourceUsages`. Single Pod Usage directly returns the same Pod fields plus `containers: ContainerUsage[]` and `initContainers: ContainerUsage[]`; each ContainerUsage contains `name` and `resourceUsages`.
- Decision: use `clusterId + name` as the stable Pod key and container `name` as the container key. Missing, null, or duplicate usage records are treated as unavailable; arrays missing or null normalize to empty arrays; extra response records are ignored.

- Decision: define ResourceQuota `cpu`, `memory`, and `ephemeralStorage` as quantity strings; retain `others`; add optional `gpus` entries with vendor/model/profile/count. Usage, limits, and requests use this same shape.
- Fix: make PodOperation contain `name`, `capability`, `displayName`, `description`, `targetKind`, `disabled`, `reason`, and `supportsBatch`, without changing operation trigger behavior.
- Proof: type definitions represent every confirmed upstream field without adopting malformed sample syntax.

[x] Exit Criteria:

- [x] Local source snapshot records the source URL, 2026-07-28 fetch, semantic changes, and user-confirmed corrections.
- [x] ResourceQuota quantity fields are strings; `others` and optional structured `gpus` are represented; usage/limits/requests share the type.
- [x] PodUsage and ContainerUsage represent direct batch/single responses, including both container arrays.
- [x] PodOperation contains all upstream fields without changing trigger names or behavior.

### Phase 2 - API And Integration

Status: completed

- Add: define `POST /application-environments/{appEnvID}/runtime/pods/usage` with body `pods: {clusterId, name}[]` and response `PodUsage[]`.
- Add: define `GET /application-environments/{appEnvID}/runtime/clusters/{clusterId}/pods/{podName}/usage` returning one Pod usage record with `containers: ContainerUsage[]` and `initContainers: ContainerUsage[]` of the same type.

- Decision: request batch Usage only for the current page after `getPods` succeeds; merge by `clusterId + name`; stale effects must not update data after filters, group, or page change.
- Decision: limits and requests always come from the Pod base response; dedicated Usage responses only replace `resourceUsages`. Missing resources or records display `-` with no fallback to embedded legacy usage.
- Decision: Usage failures are non-fatal. Keep the Pod list/detail visible, preserve limits/requests, and leave unavailable usage as `-`; do not report Usage failures as the primary Pod request failing.

- Decision: parse CPU quantities with plain cores plus `n`, `u`, `m`; parse byte quantities with plain bytes plus decimal and binary SI suffixes. Invalid, empty, negative, or zero-limit values do not produce a percentage; percentages may exceed 100 and are rounded to an integer. GPU does not participate in CPU/memory percentages.
- Add: merge batch usage into list items and single usage into Pod/container detail data.
- Fix: format quantity strings and calculate CPU/memory percentages from normalized values.
- Proof: focused pure-logic tests cover quantity parsing, response-order-independent merging, duplicates, partial data, and structured GPU display. Non-fatal failure and stale-response protection are verified by the effect control flow and cancellation guards.

[x] Exit Criteria:

- [x] Pod list CPU/memory values use the current page's batch Usage response, keyed independent of response order.
- [x] Pod detail, normal container, and Init container usage use the single Usage response.
- [x] Limits/requests remain sourced from base Pod data; only `resourceUsages` is replaced.
- [x] Usage failures and partial responses leave base data usable and show unavailable usage as `-`.
- [x] Quantity tests cover supported CPU and byte suffixes, invalid/empty/negative/zero-limit values, rounding, and values above 100%.
- [x] Effect cancellation prevents stale list/detail Usage responses from updating switched inputs; merge behavior is covered by focused tests.

### Phase 3 - Verification And Closure

Status: partially completed

- Proof: run `yarn lint-type`, `yarn test`, `yarn lint`, and `yarn build`.
- Proof: run an independent closure audit against this plan and the live diff.
- Add: append the implementation and verification result to the daily log.

[ ] Exit Criteria:

- [ ] All verification commands pass. `yarn lint-type` and `yarn build` pass; full `yarn test` and `yarn lint` remain blocked by pre-existing repository failures recorded in the daily log.
- [x] `docs/logs/2026/07-28.md` is updated.
- [x] Independent closure audit accepts the implementation slice; repository-wide verification still blocks full closure.

## Draft Review Record

- Reviewer: General_6314492 (independent subagent)
- Verdict: passes draft review after owner-applied final baseline/status corrections
- Revision Summary: Added complete direct response shapes, both container arrays, null/duplicate/partial handling, data-source precedence, active-plan registration, explicit skill paths, testable exit criteria, and aligned the baseline with the refreshed source.
- Residual Risks: live responses may contain additional quantity formats; Pod lifecycle changes can produce partial batch Usage; preserve existing uncommitted drawer changes.

### Phase 4 - GPU Vendor Presentation

Status: completed

- Add: replace the flattened GPU display model with structured and legacy variants that preserve `vendor`, `model`, `profile`, and `count`; add a reusable GPU usage card and render it from `ResourceUsageView`.
- Decision: normalize NVIDIA, Huawei Ascend, and Baidu Kunlunxin vendor variants to the selected assets at `vendors/nvidia/image_1.png`, `vendors/ascend/image_1.png`, and `vendors/kunlunxin/image_1.png`; unknown structured vendors use the generic GPU icon rather than a misidentified brand; legacy `others` entries do not render as GPU usage. The card uses existing semantic, spacing, radius, and typography tokens; vendor colors remain contained within the exported images.
- Proof: extend pure GPU-entry tests for all vendor mappings, unknown structured data, and legacy fallback; add a focused render test proving the card's left two-line model/profile block and right-aligned count; format modified source files with dprint.
- Skill: none

[ ] Exit Criteria:

- [x] `ResourceUsageView` renders the reusable card for every GPU entry.
- [x] Structured GPU entries select their vendor icon and render model/profile on the left with `x<count>` right-aligned.
- [x] Unknown structured vendors use the generic fallback, and `others` GPU keys are ignored.
- [x] All card styling uses project design tokens, with no Figma color literals outside exported image assets.
- [x] Requirement and daily log describe the updated supported behavior.
- [x] Verification results are recorded honestly.

## Closure Gates

- [x] In-scope API contract and behavior are complete.
- [x] Relevant source documentation is aligned.
- [x] Focused tests cover new parsing and merge behavior.
- [ ] Full verification has passed.
- [x] Closure audit was independent.

## Closure

- Verdict: implementation slice accepted; closure blocked by repository-wide verification baseline
- Reviewer: General_6322597 (independent closure audit), 2026-07-28
- Evidence: Live diff confirms structured `gpus` support, duplicate Pod/container Usage degradation, and aligned proof claims. Related 16 tests, `yarn lint-type`, target-file ESLint, `git diff --check`, and `yarn build` pass. Full `yarn test` and `yarn lint` remain blocked by pre-existing failures recorded in `docs/logs/2026/07-28.md`; Plan Status remains `partially completed`.
- Phase 4 closure: General_6423683 independently accepted the vendor presentation slice on 2026-07-29. Five focused tests, target-file ESLint, `git diff --check`, and `yarn build` pass; full `yarn lint-type`, `yarn test`, `yarn lint`, and design-token verification remain blocked by pre-existing failures documented in `docs/logs/2026/07-29.md`.
- Phase 4 correction: General_6430283 independently confirmed on 2026-07-29 that GPU display only reads structured `gpus`; `others` produces no GPU card. Scoped tests, target-file ESLint, and `git diff --check` pass.
