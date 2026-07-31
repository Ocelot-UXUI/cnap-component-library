# Open-Ended Audit Prompt

Use this prompt when structured audit checklists may miss hidden problems and the reviewer should actively search for unknown unknowns in CNAP frontend work.

This prompt is calibrated for CNAP frontend. Bias the search toward protected areas, recurring AGE migration risks, frontend runtime assumptions, and false-positive tolerance documented in `docs/skills/README.md`.

```text
Read `AGENTS.md`, `docs/index.md`, `docs/context/project-context.md`, the active requirement and owner docs, the active plan if one exists, recent logs, and the live changed code.

Run an open-ended audit. Do not limit yourself to the standard checklist categories if the work suggests deeper risk.

Look for hidden issues such as:
- assumptions that were never written down
- owner-doc gaps
- fake closure or weak proof
- mismatched routing or unnecessary skill use
- brittle code paths that passed narrow verification only by accident
- recurring failure patterns that should have been promoted into reusable checks
- mismatch between CNAP docs and actual React/Vite/TypeScript code
- auth/session behavior changes without explicit approval
- AI executor/capability changes without state-machine or contract proof
- Semantic Locator changes that make AI page operation brittle
- docs copied from AGE template that still claim they are uncustomized defaults

Act like an adversarial reviewer looking for what the default process may have missed.

For CNAP, prioritize hidden risk in:
- UUAP login and session-loss handling
- `AIExecutorProvider` state transitions
- `agentLoop` SSE/tool_calls flow
- `src/capabilities/` registry and execution contract
- generated `/ai-context.json` assumptions
- qiankun/iCloud integration boundaries

Return findings first, ordered by severity.
If blocking issues are found, say `needs revision` and list the exact hidden risks or missing follow-up artifacts.
If no blocking issue remains, say `passes open-ended audit` and list residual unknowns that still deserve watchfulness.
```
