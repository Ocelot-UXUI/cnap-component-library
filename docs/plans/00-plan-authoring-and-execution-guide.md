# Plan Authoring And Execution Guide

## Goal

`docs/plans/` 用于需要显式范围、关闭条件和证明的非平凡执行切片。

## When To Write A Plan

编写计划的条件:

- 修改超过 5 个文件或可能超过约 200 行改动
- 跨多个模块并改变共享行为
- 更改 API 契约或 auth 行为
- 跨越多个用户可见功能面
- 需要分阶段执行或显式关闭门控
- 有未解决的产品或技术风险

仅在以下情况跳过正式计划：文案修改、小型样式修复、仅测试清理、有明确现有测试的单文件行为修复。

## Plan Decision Table

| 范围                                          | Plan Level | Audit Rule           | 示例                                    |
| --------------------------------------------- | ---------- | -------------------- | --------------------------------------- |
| 平凡本地编辑                                  | No plan    | 无审查               | 错字/文案变更、单一样式调整、仅测试清理 |
| 非平凡跟踪工作                                | Full plan  | 需独立审查和关闭审计 | 小型 UI 完善+文档/测试更新              |
| 契约/数据/API/auth/权限/集成/部署/跨面/高风险 | Full plan  | 需独立审查和关闭审计 | 登录行为、数据迁移、多模块重构          |

不确定时，使用完整计划。

## Minimum Rules

1. **从活基线开始。** 先读仓库，然后写 Current Baseline。不要依赖记忆或旧计划。
2. **写 Goals 和 Non-Goals。** 如果任意一项不清楚，计划边界尚未就绪。
3. **使用勾选框进行执行和关闭。** 未勾选项表示直到关闭前仍未完成的工作。
4. **一个计划，一个结果面。** 如果计划需要多个独立的关闭条件，它太宽了。拆分它。
5. **关闭前提供证明。** 在仓库包含每个退出标准的可验证证明之前，不要标记计划为完成。
6. **不要放置代码设计转储。** 计划捕获范围、证明和关闭逻辑，而非低级别实现细节。
7. **标记项目类型。** 每个执行项必须是 `Fix`、`Add`、`Decision`、`Proof` 或 `Follow-up`。
8. **记录技能使用。** 每个依赖可复用技能的项目记录 `Skill: <name>` 或 `Skill: none`。
9. **记录决策和理由。** 每个 `Decision` 项目必须记录选择、考虑的替代方案和剩余风险。
10. **关闭前清单完整性。** 范围外项目移动需记录理由。
11. **关闭前文本一致性。** 验证 Plan Status、每个阶段 Status、Exit Criteria、Closure Gates 和日志条目全部一致。
12. **Owner 字段必填。** 所有新建 Plan 必须包含 `> Owner: <gitname>` 元数据行，值为创建该 Plan 的用户的 git name（通过 `git config user.name` 获取）。支持多个 owner 时使用逗号分隔。
13. **Owner 权限控制。** AI agent 在执行 Plan 前必须检查当前用户的 gitname 是否在 Plan 的 Owner 列表中。如果不在，agent 应拒绝执行并提示用户确认。仅当用户明确要求加入 Owner 列表后，agent 才可将该用户追加到 Owner 字段并继续执行。

## Plan Status Flow

- `proposed` — 初始草稿存在但尚未通过独立审查
- `planned` — 独立审查已收敛为可接受的执行合同，可开始实现
- `in progress` — 实现进行中
- `partially completed` — 部分范围内工作已落地但关闭尚未诚实
- `completed` — 独立关闭审计接受关闭
- `superseded | replaced | deferred | cancelled` — 计划不再拥有活关闭

## When Closing

在设置 `Plan Status: completed` 之前：

1. 检查每个阶段的 Exit Criteria — 每个都必须是 `[x]`
2. 检查每个 Closure Gates 项目 — 每个都必须是 `[x]`
3. 验证文本一致性
4. 运行仓库的真实验证命令
5. 执行独立关闭审计

## Template

```md
# <plan-id> <title>

> Plan Status: proposed
> Owner: <gitname>
> Last Reviewed: YYYY-MM-DD
> Source: <requirement / bug / analysis / request>

## Current Baseline

- <what is true today>

## Goals

- <result to achieve>

## Non-Goals

- <explicitly excluded work>

## Task Route

- Type: <task type>
- Owner Docs: <paths>

## Execution Plan

### Phase 1 - <name>

Status: planned

- <implementation item>
- <Proof item>

[ ] Exit Criteria:

- <behavior lands>
- <docs updated>
- [ ] `docs/logs/` updated

## Closure Gates

- [ ] in-scope behavior is complete
- [ ] relevant docs are aligned
- [ ] verification has run
- [ ] closure audit was independent
```
