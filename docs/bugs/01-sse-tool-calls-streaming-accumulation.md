# 01 SSE tool_calls 流式解析丢失字段

## Problem

- LLM 调用 navigate 工具后，agentic 循环第二轮请求 DeepSeek API 报错
- 错误信息：`Failed to deserialize the JSON body into the target type: messages[2]: missing field 'name'`
- 影响：所有 tool_calls 场景均无法完成多轮 agentic 循环

## Reproduction

- 前置：VITE_LLM_PROVIDER=deepseek，发起 AI 对话并触发 tool_call（如要求 LLM 导航到首页）
- 触发：LLM 返回 tool_calls → 前端执行工具 → 将结果作为历史发回 API → 第二轮请求失败

## Diagnostic Method

- 错误指向 `messages[2]`（assistant message with tool_calls），提示 `name` 字段缺失
- 初步假设：缺少 assistant message 配对 → 修复后错误不变
- 进一步检查发现 `ChatMessage` 字段名 camelCase（`toolCallId`/`toolCalls`）与 API 要求的 snake_case（`tool_call_id`/`tool_calls`）不匹配 → 修复 snake_case 后仍报 `missing field 'name'`
- 最终定位：`parseSseStream` 中 `toolCalls = choice.delta.tool_calls` 是覆盖赋值，而非按 index 累积

## Root Cause

- OpenAI/DeepSeek 流式 tool_calls 是分片发送的：第一个 chunk 包含 `id`/`type`/`function.name`，后续 chunks 仅包含 `function.arguments` 片段
- `parseSseStream` 使用直接赋值 `toolCalls = choice.delta.tool_calls`，最终只保留了最后一个 chunk（仅含 arguments 片段），`id`/`type`/`name` 丢失
- 丢失的 tool_calls 被作为历史消息发回 API，反序列化失败

## Fix

- `src/api/ai/chat.ts:parseSseStream` — 用 `Map<number, ToolCall>` 按 `index` 累积每个 tool_call 的 `id`、`type`、`function.name`（赋值）和 `function.arguments`（拼接）
- `src/api/ai/types.ts:ChatMessage` — 字段名改为 snake_case（`tool_call_id`/`tool_calls`），与 API 对齐
- `src/executor/agentLoop.ts:handleToolCalls` — ChatMessage 字段同步改为 snake_case

## Tests

- 手动验证：发起 AI 对话，LLM 调用 navigate 工具，第二轮请求成功返回
- 自动化测试不现实：依赖 DeepSeek API 流式响应，需 mock SSE stream

## Affected Artifacts

- `src/api/ai/chat.ts:17-66` — parseSseStream 改为 Map 累积
- `src/api/ai/types.ts:19-24` — ChatMessage 字段改为 snake_case
- `src/executor/agentLoop.ts:105-114` — handleToolCalls 返回值字段改为 snake_case

## Notes For Future Refactors

- 任何涉及 OpenAI-compatible streaming tool_calls 解析的代码，必须按 `index` 累积而非覆盖赋值
- 与 OpenAI/DeepSeek API 直接交互的类型定义，字段名应使用 snake_case 以避免序列化不匹配
- `handleToolCalls` 的 error 分支必须同时返回 assistant message + tool message 配对，否则 API 拒绝孤立的 tool message

## Prevention Gap

- parseSseStream 初始实现未参考 OpenAI streaming tool_calls 分片协议，缺少对增量字段和全量字段的区分
- closure audit 三轮均未覆盖 SSE 解析逻辑的流式分片行为
