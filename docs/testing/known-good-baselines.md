# Known-Good Baselines

## Purpose

记录最近一次已验证的项目状态，帮助后续 AI session 判断失败是新增问题还是既有问题。

本文件保持轻量，只记录有意义的基线，不记录每一次本地命令运行。

## Baselines

| Date       | Source | Git State          | Scope     | Commands Passed | Known Failures | Evidence                  | Notes                                                                        |
| ---------- | ------ | ------------------ | --------- | --------------- | -------------- | ------------------------- | ---------------------------------------------------------------------------- |
| _none yet_ | local  | dirty working tree | docs-only | none            | none           | `docs/logs/2026/06-10.md` | 当前仅完成 AGE 文档迁移，尚未运行完整验证；不得视为 known-good code baseline |

## When To Update

Update this file when:

- full typecheck/build/lint/test verification passes after a meaningful change
- a previously failing command becomes green and should be remembered
- a team intentionally accepts a known failing command and records it as a known failure, not as a passed command

## Rule

Do not mark a command as passed unless it actually ran in the current repository state.

`Commands Passed` must contain only passing commands. Put accepted failures in `Known Failures` with the reason and evidence.

A dirty working-tree baseline must name the changed files in `Notes` or link to a dated log/testing note that does.

`full` means all real verification commands configured in `docs/context/project-context.md`. Commands explicitly marked `none` are excluded and should be noted.
