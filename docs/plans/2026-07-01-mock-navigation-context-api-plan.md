# 2026-07-01 Mock Navigation Context API

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-01
> Source: manual verification request for Agent Navigation Context Capabilities

## Current Baseline

- Agent Navigation Context Capabilities has an active implementation plan in `docs/plans/2026-07-01-agent-navigation-context-capabilities-plan.md`.
- Current account/application/environment candidates are local mock constants in `src/contexts/navigationContextData.ts`.
- Current `NavigationContext` and Agent context capabilities read those local constants directly, so callers cannot verify the behavior through request-like data loading boundaries.
- API infrastructure exists in `src/api/base.ts` with `axiosInstance` and `/api/appspace` prefix, but there is no business API module for navigation context resources.
- Page-level mock data is currently scattered in pages such as `src/pages/Accounts/index.tsx`, `src/pages/Applications/index.tsx`, and `src/pages/Environments/mockData.ts`.

## Goal

Provide mock-backed API functions that behave like real frontend API calls from the caller perspective, so manual verification can validate the account -> application -> environment data chain used by navigation context and Agent capabilities.

## Required Interfaces

- Get resource accounts by user.
- Get applications by resource account.
- Get environments by application.

## Non-Goals

- Do not connect to real backend services.
- Do not change auth, UUAP, or backend deployment configuration.
- Do not redesign account/application/environment pages.
- Do not broaden this slice to unrelated cluster, deployment, pipeline, or runtime config data.
- Do not close the Agent Navigation Context Capabilities plan as part of this plan.

## Task Route

- Type: implementation-only change with API contract surface.
- Planning trigger: adds API-facing contracts and changes shared navigation-context data loading behavior.
- AI autonomy: plan-first. Implementation waits for draft review because this introduces a new data access boundary used by manual verification and Agent context capabilities.
- Owner Docs:
  - `docs/requirements/agent-navigation-context-capabilities.md`
  - `docs/architecture/agent-context-capabilities.md`
  - `docs/architecture/navigation-system.md`
- Skill: none.
- Skill decision: no existing reusable skill directly owns mock API planning for this project.

## Execution Plan

### Phase 1 - Define Mock API Contract

Status: implemented

- [x] Add: Create `src/api/navigationContext/` with request and response types for accounts, applications, and environments. Skill: none.
- [x] Add: Define three API functions with caller-facing async behavior: `getResourceAccountsByUser`, `getApplicationsByAccount`, and `getEnvironmentsByApplication`. Skill: none.
- [x] Add: Keep response data shaped for current navigation context consumers while leaving room for backend field mapping. Skill: none.
- [x] Proof: Add unit tests for request parameters, response filtering, and empty-result cases. Skill: none.

[x] Exit Criteria:

- [x] Callers can fetch accounts by user id.
- [x] Callers can fetch applications by account id.
- [x] Callers can fetch environments by application id.
- [x] API module includes explicit TypeScript request and response types.

### Phase 2 - Centralize Mock Data Source

Status: implemented

- [x] Fix: Move account/application/environment candidate data behind the mock API module. Skill: none.
- [x] Fix: Prevent business context and Agent capability code from importing mock data directly; callers must use API functions or the API-backed candidate loader. Skill: none.
- [x] Fix: Preserve stable ids currently used by tests and Agent context capabilities. Skill: none.
- [x] Proof: Ensure existing navigation context tests still pass with the same candidate ids. Skill: none.

[x] Exit Criteria:

- [x] Mock data is hidden inside the API module and not exported to business code.
- [x] Existing ids such as `account-a`, `app-a-1`, and `env-a-1-dev` remain stable for current tests and manual verification.
- [x] Invalid hierarchy cases are still representable for validation tests.

### Phase 3 - Integrate Navigation Context Loading

Status: implemented

- [x] Fix: Update `NavigationContext` and its state-machine boundary so candidate data is obtained through API-like async functions instead of direct local constants. Skill: none.
- [x] Fix: Keep current selector public API compatible: accounts, applications, environments, availableApplications, availableEnvironments, loading, and invalidContext. Skill: none.
- [x] Fix: Ensure restored persisted context is revalidated after mock API data loads. Skill: none.
- [x] Proof: Update context machine tests for filtering, restored invalid ids, and successful candidate hydration. Skill: none.

[x] Exit Criteria:

- [x] Manual verification sees context data coming through request-shaped functions.
- [x] UI and Agent capabilities still receive serializable validated snapshots.
- [x] Context selection continues to reset lower-level context when upper-level context changes.

### Phase 4 - Integrate Agent Capabilities And Manual Verification

Status: implemented

- [x] Fix: Update list/select Agent capabilities to consume the same API-backed mock data path or the hydrated context snapshot. Skill: none.
- [x] Add: Provide a minimal manual verification path that exercises account -> application -> environment loading and then `navigate`. Skill: none.
- [x] Proof: Run focused tests for API module, navigation context machine/provider, Agent capability registry, and `navigate`. Skill: none.
- [x] Proof: Run required project verification commands and record known unrelated blockers. Skill: none.

[x] Exit Criteria:

- [x] `listAvailableAccounts`, `listAvailableApplications`, and `listAvailableEnvironments` reflect mock API data.
- [x] Manual verification can inspect the three data fetch boundaries independently.
- [x] `navigate` no-navigation failure behavior remains unchanged for missing params/context.
- [x] Verification status is recorded in `docs/logs/2026/07-01.md` or the current-date log.

## Closure Gates

- [x] Independent draft review accepted this plan before implementation.
- [x] Mock API functions and explicit request/response types are implemented.
- [x] Account, application, and environment mock responses are filtered by the required parent identifier.
- [x] Navigation context candidates are loaded through the API-like boundary or a documented adapter over it.
- [x] Agent context list/select capabilities use the same API-backed candidate source as UI navigation context.
- [x] Tests cover the mock API filtering and the context hierarchy after loading.
- [x] `yarn lint-type` has run.
- [x] `yarn test` has run.
- [x] `yarn lint` has run and remaining failures are pre-existing unrelated lint debt.
- [x] `yarn build` has run if generated artifacts or build-time AI context output changes.
- [x] Independent closure audit accepted completion before marking this plan completed.

## Open Questions

- What user identifier should manual verification use for the account query: current logged-in user from auth context, a fixed mock user id, or an explicit function parameter supplied by the caller?
- Should the mock API functions call `axiosInstance` through a mock adapter/interceptor, or return async promises directly while preserving the same request/response function boundary?
- Should page-level account/application/environment mock lists be migrated to the same data source in this slice, or should this plan only cover navigation context and Agent capabilities?
