/* eslint-disable max-depth */
/**
 * AI 流式对话请求封装
 * 通过 Strategy 模式支持多种 LLM Provider，通过 VITE_LLM_PROVIDER 环境变量切换
 */
import {AI_TOOLS} from './tools';
import type {ChatMessage, StreamChunk, StreamResult, ToolCall} from './types';

type LlmProvider = {
    streamChat: (
        messages: ChatMessage[],
        onChunk: (delta: string) => void,
        signal?: AbortSignal,
    ) => Promise<StreamResult>;
};

// eslint-disable-next-line complexity
const parseSseStream = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onChunk: (delta: string) => void,
): Promise<StreamResult> => {
    const decoder = new TextDecoder();
    let content = '';
    let finishReason: StreamResult['finishReason'] = 'stop';
    let buffer = '';
    const toolCallsAcc = new Map<number, ToolCall>();

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
            if (!line.startsWith('data: ')) {
                continue;
            }
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
                break;
            }
            try {
                const chunk = JSON.parse(data) as StreamChunk;
                const choice = chunk.choices?.[0];
                const delta = choice?.delta?.content;
                if (delta) {
                    content += delta;
                    onChunk(delta);
                }
                if (choice?.delta?.tool_calls) {
                    for (const tc of choice.delta.tool_calls) {
                        const idx = (tc as { index?: number; }).index ?? 0;
                        const existing = toolCallsAcc.get(idx) ?? {
                            id: '',
                            type: 'function',
                            function: { name: '', arguments: '' },
                        };
                        if (tc.id) existing.id = tc.id;
                        if (tc.type) existing.type = tc.type;
                        if (tc.function?.name) existing.function.name += tc.function.name;
                        if (tc.function?.arguments) existing.function.arguments += tc.function.arguments;
                        toolCallsAcc.set(idx, existing);
                    }
                }
                if (choice?.finish_reason === 'tool_calls') {
                    finishReason = 'tool_calls';
                }
            } catch {
                // 忽略解析错误
            }
        }
    }

    const toolCalls = toolCallsAcc.size > 0 ? [...toolCallsAcc.values()] : undefined;
    return { content, toolCalls, finishReason };
};

/** DeepSeek 直连 Provider（本地调试用） */
const deepseekProvider: LlmProvider = {
    streamChat: async (messages, onChunk, signal) => {
        const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
        const model = 'deepseek-v4-flash';
        const baseUrl = 'https://api.deepseek.com';

        if (!apiKey) {
            throw new Error('VITE_DEEPSEEK_API_KEY 未配置，请在 .env 文件中设置');
        }

        const res = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ model, messages, tools: AI_TOOLS, stream: true }),
            signal,
        });

        if (!res.ok || !res.body) {
            throw new Error(`DeepSeek API 请求失败: ${res.status} ${res.statusText}`);
        }

        return parseSseStream(res.body.getReader(), onChunk);
    },
};

/** 后端 API Provider（生产环境） */
const backendProvider: LlmProvider = {
    streamChat: async (messages, onChunk, signal) => {
        const res = await fetch('/api/appspace/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages, tools: AI_TOOLS, stream: true }),
            signal,
        });

        if (!res.ok || !res.body) {
            throw new Error(`后端 AI API 请求失败: ${res.status} ${res.statusText}`);
        }

        return parseSseStream(res.body.getReader(), onChunk);
    },
};

const providerMap: Record<string, LlmProvider> = {
    deepseek: deepseekProvider,
    backend: backendProvider,
};

const providerName = import.meta.env.VITE_LLM_PROVIDER || 'deepseek';
const provider = providerMap[providerName] ?? deepseekProvider;

export const streamChat = provider.streamChat;
