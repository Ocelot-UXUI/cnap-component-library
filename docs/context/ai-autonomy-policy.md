# AI Autonomy Policy

## Purpose

This file defines when AI agents may proceed without asking and when they must stop for human input.

## Autonomy Levels

- `implement` - AI may implement after reading the listed requirement, owner doc, and verification commands.
- `plan-first` - AI may draft or update the plan, but implementation waits for plan audit and any protected-area approval.
- `ask-first` - AI must ask before changing code or user-visible behavior.
- `research-only` - AI may inspect, summarize, and propose options, but must not modify product behavior.
- `blocked` - AI must not proceed until the blocker is resolved in files or by human confirmation.

## Reviewer Availability

- Reviewer availability: none

## AI May Proceed Without Asking When

- the work item is marked `implement` or the user directly requests a local low-risk change
- the active requirement has concrete acceptance criteria
- the active owner doc is listed in `docs/context/project-context.md`
- verification commands are real commands, not placeholders
- documentation freshness is `fresh`
- the task does not touch a protected area below

## AI Must Ask Or Stop Before

- changing auth/login behavior (UUAP flow, session management)
- changing the AI executor core loop (agentLoop, AIExecutorProvider)
- changing capability execution contracts (types.ts, index.ts)
- skipping required verification because commands are missing or broken
- proceeding when live code and owner docs conflict

## Protected Areas

| Area                 | Rule       | Required Evidence  |
| -------------------- | ---------- | ------------------ |
| auth/login           | ask first  | owner doc + review |
| AI executor core     | plan-first | owner doc + tests  |
| capability contracts | plan-first | owner doc + tests  |

## Backlog Selection Rule

If the user asks AI to continue work without naming a task, choose the highest-priority item in `docs/backlog/README.md` whose autonomy is `implement` and whose blockers are `none`.
