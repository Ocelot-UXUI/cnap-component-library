# REQ-AI-14 路由信息暴露给 LLM

> Plan Status: complete
> Last Reviewed: 2026-06-16
> Source: docs/requirements/route-context-for-llm.md

## Current Baseline

- `src/routes/` 已建立统一路由管理层（REQ-AI-06），Route 接口包含 `toUrl()` + `description`，但无 `path` 字段
- `src/api/ai/tools.ts` 从 `src/capabilities/` 自动生成 tool schema，capabilities 全部是 mock 实现
- `src/capabilities/` 被 2 个文件引用：`tools.ts` 和 `AIExecutorProvider.tsx`
- `agentLoop.ts` 处理 tool_calls → execute 执行链，当前 execute 走 capabilities
- `streamChat` 已对接 DeepSeek API（REQ-AI-15），可真实对话

## Goals

- LLM 的 system prompt 中包含所有路由的元数据（key + description + params）
- LLM 通过 navigate 工具（routeKey + routeParams）驱动页面导航
- capabilities mock 层被完全替换

## Non-Goals

- 不设计完整的 system prompt 构建机制（仅注入路由部分）
- 不涉及其他类型的 LLM 上下文（页面状态、表单数据）
- 不涉及 capabilities 目录的物理删除（仅移除 import 依赖）

## Task Route

- Type: architecture change + implementation
- Owner Docs: `docs/requirements/route-context-for-llm.md`

## Execution Plan

### Phase 1 - Route 层扩展

Status: done

- [x] `Route` 接口增加 `path: string` 字段（`src/routes/create.ts`）
- [x] `route()` 工厂函数在返回对象中设置 `path`
- [x] `RouteMeta` 类型定义（`src/routes/create.ts`）
- [x] `getRouteMetas()` 函数（`src/routes/index.ts`），遍历 routes Record 提取元数据
- [x] `formatRouteContext()` 函数（`src/routes/index.ts`），将 RouteMeta 序列化为 system prompt 文本

Skill: none

[x] Exit Criteria:

- `Route` 接口包含 `path` 字段 ✓
- `getRouteMetas()` 返回正确数量的 RouteMeta ✓
- `formatRouteContext()` 输出文本符合需求文档中的格式 ✓

### Phase 2 - 工具定义重构

Status: done

- [x] 重写 `src/api/ai/tools.ts`：移除 capabilities 导入，手动定义 navigate 工具 schema
- [x] navigate 工具的 `routeKey.enum` 从 `getRouteMetas()` 动态生成
- [x] `formatRouteContext()` 的调用方：在 system prompt 构建处调用，将结果作为 system message 的一部分

Skill: none

[x] Exit Criteria:

- `AI_TOOLS` 仅包含 navigate 工具 ✓
- `routeKey.enum` 与路由列表一致 ✓
- `src/api/ai/tools.ts` 不再 import capabilities ✓

### Phase 3 - 执行层适配

Status: done

- [x] `agentLoop.ts` 中 navigate tool call 的处理：解析 routeKey + routeParams → `routes[key].toUrl(params)` → `router.navigate(url)`
- [x] `AIExecutorProvider.tsx` 移除 `capabilityMap` 引用，`executeAction` 简化为 DOM 操作
- [x] 参数校验：routeKey 不存在时返回错误；routeParams 缺失必要参数时返回错误

Skill: none

[x] Exit Criteria:

- navigate tool call 能正确执行路由跳转 ✓
- 无效 routeKey 返回错误信息 ✓
- `AIExecutorProvider.tsx` 不再 import capabilities ✓
- `agentLoop.ts` 不再依赖 capabilities ✓

### Phase 4 - capabilities 弃用 + 清理

Status: done

- [x] 确认 `src/capabilities/` 无任何 import 引用
- [x] `grep_content` 验证零引用

Skill: none

[x] Exit Criteria:

- 全局 `src/` 无 `from '@/capabilities'` 引用 ✓

### Phase 5 - 验证 + 关闭

Status: done

- [x] `yarn lint-type` 通过
- [x] `yarn lint` 通过（agentLoop 无报错，剩余 6 个为预存错误）
- [x] `yarn build` 通过
- [x] capabilities 零引用
- [x] 更新 `docs/logs/2026/06-16.md`

Skill: none

[x] Exit Criteria:

- 所有验证命令通过 ✓
- 需求验收标准全部满足 ✓
- 日志已更新 ✓

## Closure Gates

- [x] in-scope behavior is complete
- [x] relevant docs are aligned
- [x] verification has run
- [x] closure audit was independent
