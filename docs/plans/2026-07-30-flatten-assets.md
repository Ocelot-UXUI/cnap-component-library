# 2026-07-30 Flatten Assets

> Plan Status: partially completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-30
> Source: User request to flatten `src/assets/`

## Current Baseline

- `src/assets/` has 65 files: 11 already in the root and 54 in eight nested directories.
- 48 static `@/assets/...` imports exist in application code; 47 reference a nested path.
- No `new URL`, `import.meta.glob`, `require`, or CSS `url()` resource references currently target `src/assets/`.
- Existing uncommitted Workloads icon changes and 10 new root-level SVGs are in scope as the baseline to preserve; `public/ai-capabilities.json` is unrelated and excluded.
- The user removed the previously added Pod Header SVG controls during this work. Preserve that removal and update only the remaining original Pod Header imports.

## Goals

- Move every resource file directly under `src/assets/` without changing its contents.
- Preserve all runtime behavior by updating every static asset import.
- Resolve basename collisions through stable directory-prefixed filenames.

## Non-Goals

- Do not change component behavior, styling, or asset content.
- Do not remove currently unreferenced assets.
- Do not modify unrelated working-tree changes.

## Task Route

- Type: implementation-only structural refactor
- Owner Docs: `docs/context/project-context.md`, `docs/design/app-overview.md`
- Skill: `code-refactor-prompt.md`

## Flat Naming Contract

- Preserve existing root-level filenames unchanged.
- Rename each nested asset from `<directory>/<filename>` to `<directory>-<filename>`.
- Verify a generated 54-entry old-to-new mapping, no collisions, and a final 65-file root-level count.

## Execution Plan

### Phase 1 - Rename Assets

Status: completed

- [x] Fix: Move all 54 nested files into `src/assets/` using the flat naming contract. Skill: `code-refactor-prompt.md`.
- [x] Proof: Compared the generated mapping against the final directory: 65 root-level files and zero nested files or directories. Skill: none.

Exit Criteria:

- [x] All 65 resources reside directly under `src/assets/`.
- [x] The 54-entry mapping is complete and collision-free.

### Phase 2 - Update References

Status: completed

- [x] Fix: Updated every import that names a relocated asset to its exact flattened path. Skill: `code-refactor-prompt.md`.
- [x] Proof: Repository scan found no prior nested asset path in static imports, `new URL`, `import.meta.glob`, `require`, or CSS `url()` forms. Skill: none.
- [x] Proof: Validated all 48 remaining `@/assets/...` specifiers resolve to a file. Skill: none.

Exit Criteria:

- [x] Every source-side asset reference resolves to a flattened asset.
- [x] No prior nested asset path remains in repository code or configuration.

### Phase 3 - Verify

Status: partially completed

- [ ] Proof: Smoke-check Workloads overview cards, workload-header actions, batch actions, Pod header and group actions, Pod operation icons, and GPU resource cards. Skill: none.
- [x] Proof: `yarn lint-type`, `yarn build`, affected Workloads tests, affected-file ESLint, and affected-file dprint checks passed. Full `yarn test`, `yarn lint`, and `yarn format:check` retain unrelated failures recorded in the daily log. Skill: none.
- [x] Proof: Updated `docs/logs/2026/07-30.md` with verification results. Skill: none.

Exit Criteria:

- [ ] All verification commands pass; blocked by unrelated existing failures.
- [ ] Visual asset paths load on all affected Workloads surfaces.
- [x] `docs/logs/` updated.

## Draft Review Record

- Reviewer: `General_6501010` independent subagent
- Verdict: passed after revisions
- Revision summary: added deterministic naming and count-preservation proofs, exhaustive reference verification, dirty-worktree scope boundary, visual smoke checks, formatting verification, phase-level skill records, and corrected the logging checklist.

## Closure Audit Record

- Reviewer: `General_6501443` independent subagent
- Verdict: do not close
- Findings: no asset or reference regression; 65 root-level assets, 54 content-preserving renames, 48 resolvable imports, and no nested asset paths remain. Runtime visual smoke checks are still required before closure.

## Closure Gates

- [ ] In-scope behavior is complete.
- [x] Relevant docs are aligned.
- [x] Verification has run.
- [x] Closure audit was independent.
