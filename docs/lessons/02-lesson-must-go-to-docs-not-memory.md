# 项目经验应记录在项目文档中，而非 AI 侧 memory

来源：REQ-AI-06 流程回顾

## 问题描述

AI agent 将项目开发中提取的经验教训写入了 AI 侧的 `memory/` 目录，而非项目仓库的 `docs/` 体系。

## 为什么是问题

- `memory/` 是 AI 个人的记忆系统，脱离项目文档体系，其他开发者无法查看和维护
- 项目经验属于团队共享资产，应存在于仓库唯一真源中
- AI 侧 memory 不可提交、不可审查、不可持久化到项目知识库

## 正确做法

按 AGENTS.md Documentation Ownership 将内容归入对应目录：

- 流程教训 → `docs/lessons/`
- 实现后差距分析 → `docs/retrospectives/`
- 重复失败模式 → `docs/skills/` 或 `docs/audits/`
- 实现日志 → `docs/logs/`

## 规则

项目开发过程中产生的任何经验、教训、改进，必须记录在 `docs/` 下的对应目录中。不得写入 AI 侧的 `memory/` 系统。
