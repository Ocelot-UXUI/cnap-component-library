# Source Of Truth And Precedence

## Purpose

Defines which artifact answers which question.

## Precedence By Question

### What should be built now?

Primary source: `docs/requirements/`

Support sources: `docs/input/`, `docs/discussions/`

### What is the current supported app behavior?

Primary source: `docs/design/`

### What is the current supported technical structure?

Primary source: `docs/architecture/`

### What is the API contract truth?

Primary source: `src/api/` (TypeScript API definitions and the base Axios instance).

### What is the AI executor behavior?

Primary source: `src/executor/` (agentLoop, AIExecutorProvider, capabilities).

### What is the auth/session truth?

Primary source: `src/auth/login.ts` and `src/contexts/UserContext.tsx`.

### How should this slice be executed and closed?

Primary source: `docs/plans/`

### What actually happened during execution?

Primary source: `docs/logs/`

## Conflict Resolution

- If requirements and owner docs disagree, decide whether the requirement changes the baseline, then update `docs/design/` or `docs/architecture/` explicitly.
- If live code and owner docs disagree, classify as implementation drift or stale docs; do not silently choose one.
- If resolving a conflict changes auth, AI executor, or capability behavior, stop and ask for confirmation.

## Simple Rule Of Thumb

- stable behavior and structure → owner docs (`docs/design/`, `docs/architecture/`)
- execution → plans (`docs/plans/`) and logs (`docs/logs/`)
- history → bugs, testing notes, retrospectives
