# Skills Index

## Purpose

`docs/skills/` 存放 CNAP 前端可复用的 AI 工作方法、审查方法和审计 prompt。

这些文件不是一次性聊天消息，也不是业务真源。业务知识仍由 `docs/requirements/`、`docs/design/`、`docs/architecture/` 和实际代码拥有。

## CNAP Project Calibration

所有 prompt 默认按 CNAP 前端项目执行：

- Owner docs: `docs/context/project-context.md`, `docs/design/app-overview.md`, `docs/architecture/system-baseline.md`, `docs/architecture/module-boundaries.md`
- Protected areas: `src/auth/login.ts`, `src/contexts/UserContext.tsx`, `src/executor/`, `src/capabilities/` 的公共契约
- Verification stack: `yarn lint-type`, `yarn test`, `yarn lint`, `yarn build`
- Runtime assumptions: React 19 + Vite 6 + TypeScript + Ant Design 6 + Emotion + React Router 7
- Known risk areas: UUAP 登录/会话、AI executor 状态机、SSE/tool_calls、Semantic Locator (`data-ai-*`)、qiankun 微前端、scheme 驱动配置表单
- False-positive tolerance: 对 auth、AI executor、capability contracts 低容忍；对示例、文章、可选层文案中历史引用高容忍

## Skill Routing Rule

Before choosing a skill:

1. Read the relevant requirement and owner docs first.
2. Classify the task type using `AGENTS.md`.
3. Choose the skill by matching the work method, not just the business label.
4. If multiple skills could fit, ask an independent subagent or reviewer to choose before implementation.
5. If no existing skill clearly fits, record `Skill: none` and proceed with the normal docs-driven workflow.
6. For non-trivial plans, record the skill selection basis and review result in the plan.

Do not add broad business-scenario skills as a replacement for project-specific owner docs. If a scenario repeats often, first check whether routing, owner docs, or plan guidance are missing. Promote a skill only when the reusable work method is stable.

## Skill Registry

| Skill                                     | Use when                                                                            | Do not use when                               | Required inputs                                                                       | Expected output                                            |
| ----------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `age-practice-gap-audit-prompt.md`        | a repo needs comparison between live practice and intended AGE workflow             | the task is a local feature implementation    | AGE baseline docs, current repo structure, active docs, sampled live evidence         | analysis note under `docs/analysis/` with prioritized gaps |
| `document-audit-prompt.md`                | requirement, design, or architecture docs may be incomplete or inconsistent         | the task is trivial and local                 | target doc paths, relevant input or owner docs                                        | audit findings and revision targets                        |
| `plan-audit-prompt.md`                    | a non-trivial plan is ready for challenge before implementation                     | no plan exists yet                            | plan file, related requirement and owner docs                                         | pass/fail audit with concrete issues                       |
| `closure-audit-prompt.md`                 | implementation claims completion and needs independent closure review               | work is still mid-flight                      | plan, verification evidence, relevant changed docs                                    | closure verdict and remaining gaps                         |
| `requirement-gap-retrospective-prompt.md` | landed work still missed expectations and the requirement pipeline needs diagnosis  | the requirement is still being drafted        | original input, requirement/discussion docs, delivered result                         | retrospective findings and process corrections             |
| `multi-dimensional-audit-prompt.md`       | high-risk CNAP work needs challenge across several dimensions at once               | a single-object audit is already sufficient   | relevant requirement/owner docs, plan or changed area, verification evidence          | findings grouped across dimensions                         |
| `open-ended-audit-prompt.md`              | hidden problems may exist outside the normal checklist                              | the work only needs a narrow structured audit | relevant requirement/owner docs, plan if any, logs, live changed code                 | adversarial findings and unknown-risk notes                |
| `index-routing-audit-prompt.md`           | a docs index or directory structure needs routing effectiveness review              | the index has no routing role or is trivial   | top-level index, sub-indexes, target files                                            | coverage table, persona test results, structural findings  |
| `bug-diagnosis-prompt.md`                 | a bug is real but the root cause is not yet proven                                  | the defect is already obvious and local       | bug report, owner docs, reproduction path, verification command                       | confirmed cause and proof path                             |
| `code-quality-audit-prompt.md`            | reviewing code for behavioral risk and implementation quality                       | only formatting or trivial nits are needed    | changed files, owner docs, tests or verification evidence                             | severity-ordered findings                                  |
| `code-refactor-discovery-prompt.md`       | structural cleanup candidates need discovery before refactoring                     | the structural target is already agreed       | target area, owner docs, current code                                                 | ranked refactor candidates                                 |
| `code-refactor-prompt.md`                 | behavior-preserving structural refactor work is the task                            | the task changes supported behavior           | target area, invariants, verification commands                                        | safe refactor execution and proof                          |
| `api-sync-from-ku-prompt.md`              | a ku knowledge base API doc has been updated and frontend implementation needs sync | the change is design/UI only, not API-driven  | ku doc URL, local `docs/input/source-api-*.md`, `src/api/`, `src/interface/entities/` | type/param/mock updates + lint-type pass                   |

## Comate 层 Skills（`.comate/skills/`）

除上表的 `docs/skills/*.md` 审查/审计 prompt 外，本仓库还提供 Comate 平台 skill（目录 `.comate/skills/`，由 Comate 在改动时自动路由触发），二者是不同机制：

| Comate Skill            | Use when                                         | 关系与边界                                                                 |
| ----------------------- | ------------------------------------------------ | -------------------------------------------------------------------------- |
| `frontend-change-guard` | 任何触及 `src/` 或前端产物/渲染的**实现级**改动  | 前端改动执行清单（组件/样式/token/状态/接口/资源/AI 语义）。**服从 AGE**：命中保护区→ask-first/plan-first、命中 planning trigger→先写 plan；收尾更新 `docs/logs`。不替代 requirement/owner doc。 |

## Starter Skills

- `age-practice-gap-audit-prompt.md`
- `document-audit-prompt.md`
- `plan-audit-prompt.md`
- `closure-audit-prompt.md`
- `requirement-gap-retrospective-prompt.md`
- `multi-dimensional-audit-prompt.md`
- `open-ended-audit-prompt.md`
- `index-routing-audit-prompt.md`
- `bug-diagnosis-prompt.md`
- `code-quality-audit-prompt.md`
- `code-refactor-discovery-prompt.md`
- `code-refactor-prompt.md`
- `api-sync-from-ku-prompt.md`
