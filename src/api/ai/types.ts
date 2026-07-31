/**
 * AI 对话相关类型定义
 */

/** 消息角色 */
export type MessageRole = 'user' | 'assistant' | 'tool' | 'system';

/** 工具调用 */
export interface ToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
}

/** 对话消息（用于 API 请求，字段与 OpenAI/DeepSeek API 对齐） */
export interface ChatMessage {
    role: MessageRole;
    content: string;
    tool_call_id?: string;
    tool_calls?: ToolCall[];
}

/** DeepSeek/OpenAI 流式 SSE chunk（单个 choice） */
export interface StreamChunkChoice {
    delta: {
        content?: string;
        tool_calls?: ToolCall[];
    };
    finish_reason?: 'stop' | 'tool_calls' | null;
}

/** DeepSeek/OpenAI 流式 SSE chunk */
export interface StreamChunk {
    choices?: StreamChunkChoice[];
}

/** 流式请求结果 */
export interface StreamResult {
    content: string;
    toolCalls?: ToolCall[];
    finishReason: 'stop' | 'tool_calls';
}

/** OpenAI function calling tool schema */
export interface AiTool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: {
            type: 'object';
            properties: Record<string, unknown>;
            required: string[];
        };
    };
}

/** Agent 执行步骤状态 */
export type AgentStepStatus = 'pending' | 'running' | 'success' | 'error';

/** Agent 执行步骤 */
export interface AgentStep {
    id: string;
    title: string;
    description?: string;
    status: AgentStepStatus;
    error?: string;
}

/** 展示消息类型 */
export type DisplayMessageType = 'text' | 'agent_steps' | 'error';

/** 展示消息（用于 Bubble.List 渲染） */
export interface DisplayMessage {
    id: string;
    role: MessageRole;
    type: DisplayMessageType;
    content: string;
    agentSteps?: AgentStep[];
}
