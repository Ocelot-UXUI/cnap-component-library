# CNAP 前端文档索引

## Purpose

此 `docs/` 目录树是 CNAP 前端的持久化记忆和路由面。

- 在进行工作流、需求、设计或实现变更之前，先从这里开始
- 优先选择能回答当前问题的最小文件
- 将持久的结论保存在文件中，而不仅仅是聊天中

## Routing Authority

- `docs/index.md` 拥有导航和目录职责
- `AGENTS.md` 拥有 agent 工作流规则和执行期望
- `docs/design/` 和 `docs/architecture/` 拥有稳定的项目吸引子
- `docs/process/application-development-workflow.md` 拥有默认开发流程

## Read This First

| 如果你需要...                      | 先读这个                                                | 然后读                                                |
| ---------------------------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| 理解强制性 AI 上下文和当前项目状态 | `docs/context/README.md`                                | `project-context.md`, `ai-autonomy-policy.md`         |
| 理解完整工作流                     | `docs/process/application-development-workflow.md`      | `AGENTS.md`, `docs/context/project-context.md`        |
| 选择下一个 AI-ready 工作项         | `docs/backlog/README.md`                                | project-context.md 中的 active work                   |
| 路由一个任务（编码前）             | `AGENTS.md`                                             | 相关的 owner doc 和 `docs/context/codebase-map.md`    |
| 处理原始输入                       | `docs/input/00-input-processing-guide.md`               | `docs/requirements/00-requirement-synthesis-guide.md` |
| 合成实现级需求                     | `docs/requirements/00-requirement-synthesis-guide.md`   | `docs/design/`, `docs/architecture/`                  |
| 理解项目目标和产品形态             | `docs/design/app-overview.md`                           | `docs/architecture/system-baseline.md`                |
| 理解当前应用层基线                 | `docs/design/app-overview.md`                           | `docs/design/feature-inventory.md`                    |
| 理解导航系统                       | `docs/design/navigation-system.md`                      | `docs/architecture/navigation-system.md`              |
| 理解 Agent 上下文能力边界          | `docs/architecture/agent-context-capabilities.md`       | `docs/architecture/navigation-system.md`              |
| 理解当前技术基线                   | `docs/architecture/system-baseline.md`                  | `docs/architecture/module-boundaries.md`              |
| 理解 owner-doc 优先级和真源边界    | `docs/context/source-of-truth-and-precedence.md`        | 相关的 owner doc                                      |
| 查找代码库入口点和变更路径         | `docs/context/codebase-map.md`                          | 目标文件的实际代码                                    |
| 创建或执行计划                     | `docs/plans/00-plan-authoring-and-execution-guide.md`   | `docs/audits/00-audit-execution-guide.md`             |
| 执行审计                           | `docs/audits/00-audit-execution-guide.md`               | `docs/skills/README.md`                               |
| 选择可复用 prompt / playbook       | `docs/skills/README.md`                                 | 具体 prompt 文件                                      |
| 记录测试证明                       | `docs/testing/index.md`                                 | `docs/testing/known-good-baselines.md`                |
| 查看最近的实现历史                 | `docs/logs/`                                            | 最新带日期的日志文件                                  |
| 查看已知良好基线                   | `docs/testing/known-good-baselines.md`                  | `docs/logs/`                                          |
| 记录非显而易见 bug                 | `docs/bugs/00-bug-fix-note-writing-guide.md`            | `docs/testing/`                                       |
| 记录实现后差距                     | `docs/retrospectives/00-retrospective-writing-guide.md` | `docs/lessons/`                                       |

## Recommended Default Path

1. `docs/context/`
2. `docs/backlog/`（选择工作时）
3. `docs/input/`
4. `docs/requirements/`
5. `docs/design/` 和 `docs/architecture/`
6. `docs/skills/`（选择方法时）
7. `docs/plans/`（当 planning triggers 适用时）
8. `docs/audits/`（plan draft review / closure audit）
9. `docs/testing/`（验证证明）
10. `docs/logs/`

## Directory Roles

- `docs/context/` - 强制 AI 上下文、真源优先级、项目约定
- `docs/backlog/` - 优先排序的候选工作和 AI-ready 下一步
- `docs/process/` - 默认应用开发工作流和阶段门控
- `docs/input/` - 原始外部输入
- `docs/discussions/` - 可选的需求澄清讨论
- `docs/requirements/` - 实现级需求文档
- `docs/design/` - 稳定的应用层功能和行为设计
- `docs/architecture/` - 稳定的技术基线和模块边界
- `docs/plans/` - 执行计划和关闭条件
- `docs/audits/` - 审计方法、draft review 和 closure audit 记录
- `docs/logs/` - 带日期的实现记忆
- `docs/testing/` - 手动/探索性测试记录和 known-good baselines
- `docs/bugs/` - 复杂回归历史和根因分析
- `docs/skills/` - 可选的可复用 AI 提示词、审查 playbook 和 audit prompt
- `docs/retrospectives/` - 可选的事后回顾和差距分析
- `docs/lessons/` - 从重复失败或重要恢复中提炼出的持久经验
- `docs/analysis/` - 可选的设计调研和权衡分析
- `docs/references/` - 稳定的参考指南；不要放默认强规则
- `docs/articles/` - AGE 方法论文章
- `docs/examples/` - 示例文档和 walkthrough
- `docs/archive/` - 已归档的历史文档

## Core Principle

使用文件进行持久真源。

- input 记录需求从哪里来
- context 记录强制项目规则
- backlog 记录优先排序的下一步
- requirements 记录应该构建什么
- design 和 architecture 记录必须保持真实的东西
- skills 记录可复用方法，而不是业务真源
- plans 记录如何关闭一个非平凡的切片
- audits 记录独立审查与关闭判断
- testing 记录证明和已知良好基线
- logs 保留实现记忆
