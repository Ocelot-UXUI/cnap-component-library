# Requirement Synthesis Guide

## Purpose

使用本指南将原始输入转换为实现级需求。

## Inputs

- `docs/input/` 原始材料
- `docs/discussions/` 澄清笔记
- 现有的 `docs/design/` 和 `docs/architecture/` owner docs

## Output Expectations

需求文件应清晰说明：

- 目标
- 范围
- 非目标
- 核心用户流程
- 业务规则
- 权限或角色影响
- 已知的边缘情况
- 未解决的问题
- 验收标准

## Rule

不要将未解决的模糊性隐藏在优美的语言后面。明确写下它。

## Implementation-Ready Gate

需求是实现就绪的，仅当以下都为真：

- [ ] 范围内的行为具体到足以实现而不需要猜测用户可见行为
- [ ] 非目标是显式的
- [ ] 主要用户流程已描述
- [ ] 角色/权限已覆盖或明确不相关
- [ ] 数据/模型影响已覆盖或明确不相关
- [ ] API/集成影响已覆盖或明确不相关
- [ ] 空状态、加载、错误和权限拒绝状态已覆盖
- [ ] 验收标准是可测试的
- [ ] 未解决问题是非阻塞的或明确阻塞实现

如果未解决问题改变用户可见行为、数据/模型形状、API 行为、auth/权限行为或外部集成行为，请停止并寻求澄清。

## Minimal Requirement Skeleton

```md
# Feature: <name>

## Goal

## In Scope

## Out Of Scope

## Main User Flows

## Business Rules

## Roles / Permissions

## Edge Cases

## Open Questions

## Acceptance Criteria
```
