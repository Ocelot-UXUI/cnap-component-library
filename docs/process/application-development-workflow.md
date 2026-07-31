# Application Development Workflow

## Purpose

定义 CNAP 前端的 AI 辅助应用开发默认轻量级工作流。

应用层项目常常在编码质量成为主要问题之前就失败了：

- 原始输入不完整
- 需求边界不稳定
- 原型保真度被误解为实现就绪
- 过程记录缺失
- 团队直接从讨论跳到代码

此工作流使这些失败模式显性化。

## Default Flow

1. `context` — 阅读上下文
2. `backlog` — 选择工作时
3. `input` — 收集原始输入
4. `requirements` — 合成实现级需求
5. `design` — 更新设计基线
6. `task routing and skill selection` — 路由任务
7. `plan` — 当满足 planning triggers 时编写计划
8. `draft review` — 创建的 plan 需要独立审查
9. `implementation` — 实现最小完整切片
10. `verification` — 验证
11. `closure audit` — 创建的 plan 需要独立关闭审查
12. `logs / bugs` — 记录日志

仅在模糊、有风险或反复失败时才使用文档审计、回顾、技能提取和额外测试笔记。

## No-Plan Conditions

仅当任务属于以下低风险本地编辑时才跳过正式 plan：

- 文案或错别字修改
- 小型样式修复
- 仅测试清理
- 有明确现有测试保护的单文件行为修复

任何涉及 API、auth、AI executor、capability contract、跨功能面行为、超过 5 个文件或约 200 行改动、显式关闭门控的任务都必须进入 plan 流程。

## Stale Docs Rule

如果 live code 与 docs 不一致，先判断是实现漂移还是文档过期：

- 如果当前代码是正确基线，更新 owner docs 后再继续
- 如果 docs 是正确基线，计划中必须包含修复实现漂移的工作
- 如果无法判断，不要继续实现；在 `docs/discussions/` 或 plan 中记录冲突并请求确认

## Stage 0 — Read Context

非平凡工作之前，阅读：

- `docs/context/project-context.md`
- `docs/context/ai-autonomy-policy.md`
- `docs/context/codebase-map.md`
- `docs/context/source-of-truth-and-precedence.md`
- `docs/context/conventions.md`

## Stage 1 — Collect Raw Inputs

将源材料存储在 `docs/input/` 下。

典型来源：PM 笔记、卡片文档、原型、系统截图、复制的业务规则、外部文章或参考资料。

规则：保持源材料尽可能接近其原始含义，不要过早将其改写为优化过的需求。

## Stage 2 — Clarify Ambiguity When Needed

如果源材料不完整或矛盾，在 `docs/discussions/` 下创建文件。

输出：未解决的问题、假设、待确认事项、解锁合成的决策。

## Stage 3 — Synthesize Requirements

将澄清后的输入转换为 `docs/requirements/` 下的实现级文件。

应回答：当前范围内的内容、范围外的内容、所需的用户可见行为、重要的数据/权限/业务规则、仍未解决的问题。

规则：如果需求仍然不是实现就绪的，不要通过编写弱计划来假装它已就绪。

## Stage 4 — Update Stable Design Baseline

将持久决策移至 owner docs：

- 应用层功能、角色、页面和流程决策 → `docs/design/`
- 跨模块技术决策 → `docs/architecture/`

保持需求/应用设计与技术架构设计分离，然后交叉引用。

## Stage 5 — Route The Task And Select Skills

在实现之前，明确决定如何执行工作：

- 分类任务类型
- 确认控制工作的 owner docs
- 检查 `docs/skills/README.md` 是否有可复用的方法技能

如果没有现有技能明显适合，继续进行正常的文档驱动工作流，而不是强制一个弱技能匹配。

## Stage 6 — Write The Plan When Planning Triggers Apply

当工作超过很小的低风险编辑或 plan 指南中的任何 planning trigger 适用时，在 `docs/plans/` 下创建计划。

计划应包含：当前基线、目标、非目标、任务路由和技能选择、分阶段执行、证明要求、关闭门控。

计划不应成为低级别的实现设计转储。

## Stage 7 — Audit The Plan

实现之前，独立挑战每个创建的 plan。

审计应测试：范围是否诚实、关闭门控是否真实、是否有隐藏的依赖、计划是否默默地依赖未解决的需求差距。

如果计划跨越多个 owner-doc 边界、保护区域或验证面，使用 `docs/audits/00-audit-execution-guide.md` 和 `docs/skills/multi-dimensional-audit-prompt.md` 加强审计。

## Stage 7.5 — Document Audit When Needed

当需求、设计或架构文档发生较大更新，且后续会进入较大实现时，先做 document audit。

检查重点：

- 原始输入与合成需求是否一致
- 需求与 owner docs 是否一致
- 是否有未解决问题被伪装成确定范围
- 是否有跨设计/架构边界的隐性影响

## Stage 8 — Implement Small Complete Slices

实现产生真实支持结果的最小完整切片。

规则：不要为演示广度优化、不要创建大型占位面仅为了看起来完整、偏爱一个真实的功能切片胜过五个薄弱的页面壳。

## Stage 9 — Verify

运行仓库的真实验证命令：

- `yarn lint-type` — TypeScript 类型检查
- `yarn test` — 单元测试
- `yarn lint` — 代码风格检查

在 `docs/testing/`（手动证明）、`docs/bugs/`（回归记录）、`docs/logs/`（落地记录）中捕获额外证明。

## Stage 10 — Independent Closure Audit

由计划跟踪的工作不会仅因为实现 agent 说完成就自动关闭。

关闭需要独立的重新检查：活代码、当前文档、验证结果、声明的关闭门控。

如果验证失败、关闭门控未满足、文档与实现不一致，plan 不得标记为 completed。

## Stage 11 — Extract Lessons Or Skills When Patterns Repeat

当同类缺陷、审查遗漏或执行错误重复出现时，优先把方法沉淀为可复用资产：

- 低频但重要的经验 → `docs/lessons/`
- 可复用审查方法 → `docs/skills/`
- 可复用审计流程 → `docs/audits/`
- 仍反复出现的机械性错误 → 考虑脚本、静态检查、lint rule 或 CI guard

## Optional Extended Layers

以下层按需启用，不是每个任务都必须使用：

- `docs/audits/` - 非平凡审计记录和审计方法
- `docs/testing/` - 手动/探索性测试证明和已知良好基线
- `docs/retrospectives/` - 需求/原型/实现差距分析
- `docs/skills/` - 可复用 prompt 和 review playbook
- `docs/lessons/` - 持久工程经验
- `docs/analysis/` - 调研与权衡分析

## Recommended Loop

对于大多数非平凡任务：

1. 阅读或更新 context
2. 编写或更新 input/requirement 文件
3. 如果支持的基线发生了变化，更新 design 或 architecture docs
4. 当 planning triggers 适用时编写或更新 plan
5. 审计计划
6. 实现
7. 验证
8. 为创建的 plan 运行关闭审计
9. 需要时记录日志和 bug 笔记
