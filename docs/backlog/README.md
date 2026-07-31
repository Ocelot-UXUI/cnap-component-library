# Backlog

## Purpose

使用此文件列出 AI 可以检查或执行的候选工作项。backlog 不是需求的替代品，只帮助选择下一个切片。

## Work Items

| Priority | Item                       | Requirement                                       | Owner Doc                                | Plan                                                       | Status | AI Autonomy | Blocker | Last Checked |
| -------- | -------------------------- | ------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------- | ------ | ----------- | ------- | ------------ |
| P1       | 移除导航 fallback 自动回退 | `docs/requirements/remove-navigation-fallback.md` | `docs/architecture/navigation-system.md` | `docs/plans/2026-06-30-remove-navigation-fallback-plan.md` | done   | plan-first  | none    | 2026-06-30   |

## Status Values

- `idea` - 尚未准备好实现
- `needs-requirement` - 原始输入存在但没有实现级需求
- `needs-design` - 需求存在但 owner doc 缺失或过时
- `ready` - AI 可根据 autonomy 标签继续
- `in-progress` - 正在实现或规划中
- `blocked` - 阻塞未解决
- `done` - 已完成并验证

## AI Autonomy Values

- `implement` - AI 可以在阅读需求、owner doc 和验证命令后直接实现
- `plan-first` - AI 可以起草计划，但实现需等待审核
- `ask-first` - AI 必须在修改代码前询问
- `research-only` - AI 只能调研和提出建议
- `blocked` - AI 不可继续

## Selection Rule

当被要求继续但没有指定任务时，选择最高优先级、autonomy 为 `implement` 且 blocker 为 `none` 的 `ready` 项。
