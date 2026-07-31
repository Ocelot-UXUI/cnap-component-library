# Architecture Docs Index

## Purpose

`docs/architecture/` 定义 CNAP 前端的稳定跨模块技术基线。

## Owner Docs

- `system-baseline.md` - 当前技术栈和运行时基线
- `module-boundaries.md` - 模块边界和依赖规则
- `navigation-system.md` - CNAP 2.0 导航系统的跨模块技术结构
- `agent-context-capabilities.md` - Agent 与导航上下文、业务能力之间的技术边界
- `workload-domain-model.md` - Workload 业务领域数据模型与分层（目标设计，待分阶段落地）

## Precedence Boundary

- `docs/design/` 拥有应用行为和功能语义
- `docs/architecture/` 拥有技术结构和跨模块实现规则
- API 契约由 `src/api/` 目录中的 TypeScript 定义确定

## Reading Order

1. `system-baseline.md`
2. `module-boundaries.md`
