# 2026-07-01 Agent Navigation Context Capabilities

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-01
> Source: `docs/requirements/agent-navigation-context-capabilities.md`

## Current Baseline

- `docs/requirements/agent-navigation-context-capabilities.md` is ready and plan-first. It defines the next requirement across structured tool results, XState context management, capability registry, and prompt boundary.
- The first priority, fallback removal, is already completed by `docs/plans/2026-06-30-remove-navigation-fallback-plan.md`: fallback model fields, registry fallback data, fallback derivation, and fallback navigation paths have been removed.
- `src/executor/navigationTool.ts` still returns `{ success, message }` and encodes recoverable failures as human-readable strings rather than structured business facts.
- `src/executor/agentLoop.ts` catches failed `navigate` results, converts them to `Error`, and returns a string tool message like `执行失败: ...`; this loses structured facts needed by the LLM.
- `src/contexts/NavigationContext.tsx` currently manages account/application/environment context with React state and localStorage helpers. No XState usage exists in `src/`, and `package.json` does not list `xstate`.
- Context candidate data and persistence live in `src/contexts/navigationContextData.ts`; persisted context is normalized but not represented as a serializable XState snapshot with validation status and invalid reasons.
- The current AI-callable capability surface is split between `src/executor/navigationTool.ts`, `src/api/ai/tools.ts`, and older `src/capabilities/` modules. There is no unified Agent capability registry with input schema, required context, reads/writes, availability, and structured `execute` contract.
- Existing tests cover navigation derivation, `NavigationContext`, routes, and `navigationTool`, including no-navigation behavior for missing route params or context.

## Goals

- Make `navigate` return a structured Agent tool result for target resolution, route parameter validation, context validation, and execution outcomes.
- Preserve the no-fallback invariant: missing params, missing context, invalid context, or target resolution failure must not call `router.navigate()` or expose fallback targets.

> **基线变更（2026-07-13）**：此 no-fallback invariant **仅适用于 Agent 导航**（`navigationTool`）。Agent 缺上下文时返回 `NAVIGATION_CONTEXT_MISSING` 结构化错误，由 Agent 询问用户补全。UI 导航（`useAppLayoutNavigation`）不受此限制——用户主动选择导航项时始终允许跳转，由目标页面的业务组件处理上下文需求。

- Replace scattered account/application/environment state rules with an XState-owned context model that provides validated serializable snapshots for UI, navigation, and Agent tools.
- Introduce a controlled Agent capability registry for navigation and context read/select abilities without exposing XState internal events to the Agent.
- Adjust Agent prompt/tool-loop handling so LLM receives hard facts from tool results and capability descriptions, not frontend-generated user-facing wording or next-step scripts.
- Align owner docs, tests, and verification evidence with the implemented contracts.

## Non-Goals

- Do not reintroduce navigation fallback behavior or fallback targets.
- Do not implement DOM locator or DOM operation fallback capabilities.
- Do not build a full visual redesign of the top context selectors.
- Do not generate fixed frontend question copy or business-specific Agent dialogue scripts.
- Do not migrate unrelated legacy `src/capabilities/` business tools unless required to establish the registry boundary for this requirement.
- Do not change UUAP auth, permission, session, backend API contracts, or deployment behavior.

## Task Route

- Type: architecture change / app-layer design change / implementation-only change.
- Planning trigger: capability execution contracts, AI executor loop behavior, shared navigation context behavior, dependency addition, and more than five files are in scope.
- AI autonomy: plan-first. Implementation must wait for independent draft review because this touches protected AI executor and capability contract areas.
- Owner Docs:
  - `docs/requirements/agent-navigation-context-capabilities.md`
  - `docs/requirements/remove-navigation-fallback.md`
  - `docs/design/navigation-system.md`
  - `docs/architecture/navigation-system.md`
  - `docs/architecture/agent-context-capabilities.md`
- Skill: none.
- Skill decision: `docs/skills/README.md` contains audit/refactor/review methods, but no reusable implementation skill directly owns this feature slice. Use normal docs-driven planning and require draft review before implementation.

## Execution Plan

### Phase 1 - Structured Navigate Tool Result

Status: implemented

- [x] Add: Define the shared `AgentToolResult` contract and stable `navigate` result codes for target resolution, input validation, context validation, and execution. Skill: none.
- [x] Fix: Refactor `src/executor/navigationTool.ts` so all recoverable failures return structured facts with `ok=false`, `tool`, `code`, `phase`, `input`, `data`, and optional `error`. Skill: none.
- [x] Fix: Include `target`, `routeTemplate`, `requiredParams`, `resolvedParams`, `missingParams`, `requiredContext`, `currentContext`, `missingContext`, and invalid-context placeholders where available. Skill: none.
- [x] Fix: Preserve successful navigation only after route params and required context pass validation. Skill: none.
- [x] Proof: Update `src/executor/navigationTool.test.ts` to assert structured result shape and that `router.navigate()` is not called for target-not-found, missing params, missing context, and invalid context. Skill: none.

[x] Exit Criteria:

- [x] `navigate` no longer returns human-readable string-only failures.
- [x] Missing params/context and unresolved targets are machine-readable `ok=false` tool results.
- [x] Fallback targets are absent from all navigate result facts.
- [x] Existing successful navigation behavior still works.

### Phase 2 - Preserve Structured Results Through Agent Loop

Status: implemented

- [x] Fix: Update `src/executor/agentLoop.ts` so registered capability results are serialized back to the LLM as tool message content instead of being thrown and collapsed into plain string errors. Skill: none.
- [x] Fix: Distinguish normal recoverable tool results from unexpected execution exceptions in Agent step state without hiding the structured result from `messages`. Skill: none.
- [x] Decision: Record how Agent UI step status represents `ok=false` recoverable results, considering whether a tool failure should mark the visual step as `error` while still continuing the LLM loop. Decision: `ok=false` remains an `error` visual step, while the JSON tool message is still returned to the LLM. Skill: none.
- [x] Proof: Covered by focused TypeScript and capability tests; no existing `agentLoop` unit test harness is present. Skill: none.

[x] Exit Criteria:

- [x] LLM receives structured tool result JSON for registered capabilities, including `ok=false` recoverable cases.
- [x] Unexpected exceptions remain distinguishable from normal missing-context or missing-param results.
- [x] No frontend-generated fixed user-facing prompt copy is added.

### Phase 3 - XState Context Machine

Status: implemented

- [x] Add: Add the XState dependency if project dependency policy and lockfile state allow it. Skill: none.
- [x] Add: Introduce an account/application/environment context machine that owns current context, candidates, loading state, validation status, invalid reasons, and serializable snapshot output. Skill: none.
- [x] Fix: Route `NavigationProvider` through the machine while preserving its public hook surface for existing UI consumers where practical. Skill: none.
- [x] Fix: Ensure selecting an account validates or resets application and environment; selecting an application validates or resets environment; selecting environment is checked against current account and application. Skill: none.
- [x] Fix: Revalidate localStorage-restored context before treating it as legal current state. Skill: none.
- [x] Proof: Add machine-focused tests for hierarchy resets, invalid persisted context, and candidate filtering. Skill: none.

[x] Exit Criteria:

- [x] Account/application/environment hierarchy is owned by XState rather than scattered React state updates.
- [x] Context snapshot is serializable and includes enough facts for navigation and Agent capabilities.
- [x] Persisted context is revalidated before becoming legal current context.
- [x] Existing selector behavior remains compatible for current UI flows.

### Phase 4 - Agent Capability Registry

Status: implemented

- [x] Add: Create a capability registry boundary with stable id, Agent description, input schema, required context, reads, writes, `enabledWhen`, and structured `execute`. Skill: none.
- [x] Add: Register first-slice capabilities: `navigate`, `selectAccount`, `selectApplication`, `selectEnvironment`, `listAvailableAccounts`, `listAvailableApplications`, and `listAvailableEnvironments`. Skill: none.
- [x] Fix: Make context selection capabilities call controlled machine-facing APIs rather than XState internal events directly. Skill: none.
- [x] Fix: Derive Agent tool schemas/capability descriptions from the registry where practical, avoiding duplicated prompt/tool metadata. Skill: none.
- [x] Proof: Add tests for capability availability, list results, selection validation, and structured result envelopes. Skill: none.

[x] Exit Criteria:

- [x] Agent-visible context read/select capabilities exist behind a registry.
- [x] Agent does not access XState internals directly.
- [x] Capability descriptions expose hard facts and contracts, not user-facing dialogue scripts.
- [x] Registry is extensible beyond the fixed account/application/environment chain.

### Phase 5 - Prompt Boundary And Documentation Alignment

Status: implemented

- [x] Fix: Update Agent prompt/tool derivation so it consumes registry capability descriptions and structured tool results. Skill: none.
- [x] Fix: Remove any newly discovered frontend-generated fixed follow-up wording or next-action advice from tool results and prompt-derived capability data. Skill: none.
- [x] Fix: Update `docs/architecture/agent-context-capabilities.md` to reflect the implemented registry and structured result loop. Skill: none.
- [x] Proof: Search for fallback-target exposure, string-only navigate failures, and prompt/tool metadata that violates the hard-facts boundary. Skill: none.
- [x] Proof: Run required verification commands and record outcomes. Skill: none.

[x] Exit Criteria:

- [x] Prompt/tool metadata follows the hard-facts boundary.
- [x] Owner docs reflect the implemented architecture without migration-only stale claims.
- [x] Implementation log records verification status and any known blocked command.

### Phase 6 - Route Param To Context Synchronization Patch

Status: implemented

- [x] Fix: Add a route-to-context synchronization boundary that reads active route params and updates the XState navigation context when route params imply account/application/environment context. Skill: none.
- [x] Fix: Ensure Agent `navigate` to application/environment scoped routes updates header selector state instead of being overwritten by stale selector values. Skill: none.
- [x] Fix: Preserve the opposite interaction: manual header selector changes should still update scoped route params where a layout owns that behavior. Skill: none.
- [x] Proof: Add or update tests covering route application/environment param synchronization into selector state. Skill: none.
- [x] Proof: Run focused navigation/context tests and required verification commands. Skill: none.

[x] Exit Criteria:

- [x] Navigating to `/applications/:appId/...` synchronizes `applicationId` in navigation context when the app id is valid for the current or resolved account.
- [x] Header account/application/environment selectors reflect route-implied context after Agent navigation.
- [x] Existing no-fallback and missing-context behavior remains unchanged.
- [x] The synchronization source of truth and precedence are documented in this plan.

## Closure Gates

- [x] Independent draft review accepted this plan before implementation.
- [x] `AgentToolResult` or equivalent structured result contract is implemented and tested.
- [x] `navigate` distinguishes target-not-found, missing route params, missing context, invalid context, and execution failure.
- [x] `agentLoop` returns structured tool results to the LLM instead of collapsing recoverable failures to string exceptions.
- [x] Account/application/environment context hierarchy is managed by XState and exposed as a serializable validated snapshot.
- [x] Agent capability registry exposes the first context read/select capabilities and hides XState internal events.
- [x] Agent prompt/tool derivation contains no frontend-authored fixed user-facing follow-up copy or next-step scripts.
- [x] Relevant unit tests cover tool result structure, context state transitions, capability availability, and no-navigation failure behavior.
- [x] Owner docs are aligned with the final supported baseline.
- [x] `docs/logs/2026/07-01.md` or current-date log is updated with implementation and verification status.
- [x] `yarn lint-type` has run.
- [x] `yarn test` has run.
- [x] `yarn lint` has run and remaining failures are pre-existing unrelated lint debt.
- [x] `yarn build` has run for the original implementation slice.
- [x] Phase 6 route-param-to-context synchronization patch is implemented and verified.
- [x] Independent closure audit accepted completion before marking this plan completed.

## Open Questions

- Should the structured result contract live under `src/executor/`, a new `src/agent/` boundary, or another shared module so it can be consumed by both tool execution and registry code without circular dependencies?
- Should `ok=false` recoverable tool results display as visual step errors, warnings, or completed tool calls that continue the LLM loop?
- Should XState snapshots persist only ids plus validation metadata, or also persist candidate data when API-backed candidate loading replaces the current static data?
- Should the registry replace `src/api/ai/tools.ts` in one pass, or should this plan keep a compatibility adapter while the old tool schema path is retired?
