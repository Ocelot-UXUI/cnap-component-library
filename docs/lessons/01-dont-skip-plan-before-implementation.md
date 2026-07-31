# 跳过 Plan 直接实现需求导致流程不规范

来源：REQ-AI-06（统一路由链接管理）实现过程回顾

## 问题描述

REQ-AI-06 满足 AGENTS.md Planning Rule 中多条 trigger 条件，但 AI agent 在收到"开始执行计划"的指令后直接进入编码，跳过了 plan 创建和 draft review 阶段。

## 触发的 Planning Rule 条件

- 修改超过 5 个文件（实际涉及 9 个迁移文件 + 路由定义文件 + ESLint 插件 + 配置文件）
- 跨多个模块改动（capabilities、routers、pages、executor）
- 存在未解决的技术风险（react-router-template-link 与 react-router-dom v7 的兼容性问题）
- 跨越了多次 AI 会话

## 后果

- 中途遇到依赖兼容性问题需要临时决策（最终替换为自包含实现），缺少 plan 意味着缺少风险预判和方案备选
- 缺少 draft review 阶段，实现方案未经人工审阅就直接编码
- 需求文档中残留了过时内容（如对 `react-router-template-link` 的引用），未能提前在 plan 中识别并更新

## 规则

实现需求前，必须对照 AGENTS.md Planning Rule 逐条检查。满足任一条件时，必须在 `docs/plans/` 下创建 plan，遵循 `docs/plans/00-plan-authoring-and-execution-guide.md` 完成 draft review 后再开始编码。

仅对以下场景跳过 plan：文案修改、小型样式修复、仅测试清理、有明确现有测试的单文件行为修复。
