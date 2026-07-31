# Multi-Dimensional Audit Prompt

Use this prompt when a normal object-specific audit is not enough and CNAP frontend work must be challenged across multiple dimensions at once.

This prompt is calibrated for CNAP frontend. Apply CNAP owner docs, protected areas, verification stack, deployment model, and known risk areas from `docs/skills/README.md`.

```text
Read `AGENTS.md`, `docs/index.md`, `docs/context/project-context.md`, the active requirement and owner docs, the relevant plan or changed area, and the latest verification or audit evidence.

Audit the work across multiple dimensions, not only one artifact at a time.

Check at least these dimensions:
- requirement correctness
- owner-doc alignment
- architecture or module-boundary impact
- verification adequacy
- regression risk
- routing and skill-selection correctness
- backlog or autonomy-policy drift
- CNAP protected-area impact (`auth/login`, `UserContext`, `executor`, `capabilities`)
- AI Agent safety (`tool_calls`, `TaskPlan`, Semantic Locator `data-ai-*`)
- qiankun/iCloud deployment assumptions
- Ant Design 6 / Emotion / TypeScript convention alignment

Treat missing proof as blocking when the change touches UUAP session behavior, AI executor state transitions, capability contracts, or generated AI context behavior.

Use lower severity for example/article references that are explicitly non-operational and do not affect `AGENTS.md`, `docs/context/`, owner docs, plans, or live code.

Return findings first, ordered by severity.
If blocking issues are found, say `needs revision` and list the exact files, dimensions, and missing evidence.
If no blocking issue remains, say `passes multi-dimensional audit` and list residual risks by dimension.
```
