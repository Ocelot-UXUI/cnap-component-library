# Project Context

## Purpose

Keep this file as the shortest current snapshot an AI agent needs before doing useful work.

Update it in place. Do not create dated copies.

## Project Identity

- Project name: CNAP (Cloud Native Application Platform) 前端
- Product type: 云平台应用管理控制台
- Primary users: 百度内部开发者 / DevOps 工程师
- Current milestone: CNAP 2.0 功能迭代 (appspace-13986 ~ 13998)
- Documentation freshness: fresh

## Active Work

- Active requirement: docs/requirements/mvp.md, docs/requirements/vertical-scale-dialog.md, docs/requirements/horizontal-scale-dialog.md
- Active owner doc: docs/design/app-overview.md
- Active plan: docs/plans/2026-08-03-pod-detail-drawer-ops-standalone-page-plan.md (proposed；registry 前置已就绪，可进入 draft review/实现); 已完成: docs/plans/2026-08-03-global-modal-drawer-registry-plan.md (independent closure audit PASS), docs/plans/2026-08-03-workloads-detail-optimizations-plan.md (req1/3/4, closure audit 通过)
- Active backlog item: docs/backlog/README.md#age-setup
- AI autonomy: implement
- Current blocker: none

## Current Technical Baseline

- Frontend stack: React 19 + Vite 6 + TypeScript + Ant Design 6 + Emotion + React Router 7
- Backend stack: Go (external, not in this repo)
- Database/model source: external (via API)

## Verification Commands

| Purpose                   | Command             |
| ------------------------- | ------------------- |
| Install dependencies      | `yarn install`      |
| Run app locally           | `yarn start`        |
| Typecheck / compile check | `yarn lint-type`    |
| Build                     | `yarn build`        |
| Lint / quality check      | `yarn lint`         |
| Format / check formatting | `yarn format:check` |
| Format code               | `yarn format`       |
| Unit tests                | `yarn test`         |

## Optional Layers Currently In Use

Mark only the optional layers this project actually maintains.

- [ ] docs/discussions/
- [x] docs/audits/
- [x] docs/testing/
- [x] docs/skills/
- [ ] docs/analysis/
- [ ] docs/retrospectives/
- [ ] docs/lessons/

## AI Block Conditions

AI MUST stop and wait for human input before proceeding when:

- any change touches auth/permission paths with no existing test coverage
- any change touches the UUAP login flow or session management

## Notes For AI Agents

- This is a frontend-only repo; backend APIs are accessed externally.
- Current git commit history shows active work on: qiankun config, CNAP2.0 startup/runtime config, border glow effects, semantic locator system.
- AI context for runtime is generated via `yarn gen:ai-context` which outputs `/ai-context.json`.
