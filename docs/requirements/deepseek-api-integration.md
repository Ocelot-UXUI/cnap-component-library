# Feature: 重构 AI Chat LLM 接口为 DeepSeek API

> REQ-AI-15 | 状态：已完成

## Goal

将 `src/api/ai/chat.ts` 中与 LLM 的接口交互从当前不存在的后端 mock 改为直接调用 DeepSeek API，使 AI Chat 和 AI Debug 功能可以真实地与 LLM 进行对话。

## In Scope

- 重构 `streamChat` 方法：移除 mock 模式和虚假后端路径，改为调用 DeepSeek Chat Completions API（流式 SSE）
- API Key 管理：通过 `.env` 环境变量配置 DeepSeek API Key（`VITE_DEEPSEEK_API_KEY`）
- 复用现有 SSE 解析逻辑（`parseSseStream`），适配 DeepSeek 的流式响应格式
- 保持 `streamChat` 的函数签名和返回类型（`StreamResult`）不变，对上层调用方透明
- 保持 `tools.ts` 中的 `AI_TOOLS` schema 不变（DeepSeek API 兼容 OpenAI function calling 格式）
- `.env.example` 中补充 `VITE_DEEPSEEK_API_KEY` 占位

## Out Of Scope

- 不涉及 `types.ts` 中的类型定义变更
- 不涉及 `tools.ts` 中 tool schema 的逻辑变更
- 不涉及上层组件（AIChatPanel、AIDebugPanel、agentLoop 等）的变更
- 不涉及 prompt engineering 或 system prompt 优化
- 不涉及 DeepSeek API 的鉴权/代理/费用管理

## Main User Flows

### 开发者配置 API Key

1. 在项目根目录 `.env` 文件中设置 `VITE_DEEPSEEK_API_KEY=sk-xxx`
2. Vite 构建时通过 `import.meta.env.VITE_DEEPSEEK_API_KEY` 注入

### AI Chat 调用 LLM

1. 用户发送消息
2. `streamChat` 构建 DeepSeek API 请求体（messages + tools + stream=true）
3. 通过 `fetch` 调用 DeepSeek API endpoint
4. `parseSseStream` 逐 chunk 解析 SSE 响应，回调 `onChunk`
5. 返回 `StreamResult`（content / toolCalls / finishReason）

## Business Rules

### DeepSeek API 配置

- API endpoint：`https://api.deepseek.com/chat/completions`（硬编码，与 API Key 一起管理）
- 请求格式遵循 OpenAI Chat Completions API 规范（DeepSeek 兼容）
- 流式响应格式遵循 SSE `data: {...}` + `data: [DONE]`

### 环境变量

| 变量名                  | 必填 | 说明                               |
| ----------------------- | ---- | ---------------------------------- |
| `VITE_DEEPSEEK_API_KEY` | 是   | DeepSeek API Key（仅用于本地调试） |

## Data Model

### 请求体（发送给 DeepSeek）

```typescript
{
    model: string;
    messages: ChatMessage[];
    tools: AiTool[];
    stream: true;
    temperature?: number;
}
```

### 响应体 SSE chunk（DeepSeek 返回）

```typescript
{
    id: string;
    object: 'chat.completion.chunk';
    choices: [{
        delta: {
            content?: string;
            tool_calls?: ToolCall[];
        };
        finish_reason: 'stop' | 'tool_calls' | null;
    }];
}
```

> 与现有 `StreamChunk` 类型兼容，无需变更。

## Edge Cases

- **流式中断**：网络断开或用户主动中断（AbortSignal）时，需确保 reader 正确释放
- **API 限流**：DeepSeek API 有 rate limit，前端不做限流控制，依赖 API 返回的错误码

## Acceptance Criteria

- [x] `.env.example` 包含 `VITE_DEEPSEEK_API_KEY` 占位
- [x] `.gitignore` 包含 `.env`
- [x] `streamChat` 调用 DeepSeek API（`https://api.deepseek.com/chat/completions`），使用环境变量中的 API Key
- [x] 流式 SSE 解析正常工作，`onChunk` 回调逐字输出
- [x] `streamChat` 函数签名和返回类型（`StreamResult`）保持不变
- [x] `AI_TOOLS`（function calling schema）正确传入请求
- [x] `USE_MOCK` 和 `mockStreamChat` 被移除
- [x] `yarn lint-type` 通过
- [x] `yarn lint` 通过
- [x] `yarn build` 通过
