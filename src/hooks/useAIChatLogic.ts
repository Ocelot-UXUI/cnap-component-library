/**
 * AI 对话核心逻辑 Hook
 */
import type {AgentStep, ChatMessage, DisplayMessage} from '@/api/ai/types';
import {useAIExecutor} from '@/executor';
import {runAgentLoop} from '@/executor/agentLoop';
import {formatAgentNavigationContext} from '@/navigation';
import {useCallback, useRef, useState} from 'react';

let msgIdCounter = 0;
const nextId = () => `msg-${++msgIdCounter}`;

export function useAIChatLogic() {
    const { execute } = useAIExecutor();
    const [messages, setMessages] = useState<DisplayMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const historyRef = useRef<ChatMessage[]>([]);
    const abortRef = useRef<AbortController | null>(null);

    const send = useCallback(
        async (input: string) => {
            if (isStreaming) {
                return;
            }

            const userMsg: DisplayMessage = { id: nextId(), role: 'user', type: 'text', content: input };
            setMessages(prev => [...prev, userMsg]);

            const assistantId = nextId();
            const stepsId = nextId();
            setMessages(prev => [
                ...prev,
                { id: assistantId, role: 'assistant', type: 'text', content: '' },
            ]);

            setIsStreaming(true);
            abortRef.current = new AbortController();

            // 构建含页面上下文的历史记录（仅传给 LLM，不展示）
            const contextMsg: ChatMessage = {
                role: 'system',
                content: [
                    '你是一个页面助手，可以帮助用户导航到不同的页面。你可以回答问题并在合适时帮用户跳转页面。',
                    formatAgentNavigationContext(),
                ].join('\n'),
            };
            const historyWithContext = [contextMsg, ...historyRef.current];

            try {
                const updatedHistory = await runAgentLoop(
                    input,
                    historyWithContext,
                    delta => {
                        setMessages(prev =>
                            prev.map(m => (m.id === assistantId ? { ...m, content: m.content + delta } : m))
                        );
                    },
                    (steps: AgentStep[]) => {
                        setMessages(prev => {
                            const hasSteps = prev.some(m => m.id === stepsId);
                            const stepsMsg: DisplayMessage = {
                                id: stepsId,
                                role: 'assistant',
                                type: 'agent_steps',
                                content: '',
                                agentSteps: steps,
                            };
                            return hasSteps
                                ? prev.map(m => (m.id === stepsId ? stepsMsg : m))
                                : [...prev.slice(0, -1), stepsMsg, prev[prev.length - 1]];
                        });
                    },
                    execute,
                    abortRef.current.signal,
                );
                // 存储不含 system context 的历史（避免重复堆叠）
                historyRef.current = updatedHistory.filter(m => m.role !== 'system');
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    const errMsg = err instanceof Error ? err.message : '请求失败';
                    setMessages(prev =>
                        prev.map(m => (m.id === assistantId ? { ...m, type: 'error', content: errMsg } : m))
                    );
                }
            } finally {
                setIsStreaming(false);
                abortRef.current = null;
            }
        },
        [isStreaming, execute],
    );

    const stop = useCallback(() => {
        abortRef.current?.abort();
        setIsStreaming(false);
    }, []);

    const clear = useCallback(() => {
        setMessages([]);
        historyRef.current = [];
    }, []);

    const regenerate = useCallback(
        async () => {
            if (isStreaming) {
                return;
            }
            setMessages(prev => {
                let end = prev.length - 1;
                while (end >= 0 && prev[end].role !== 'user') {
                    end--;
                }
                return prev.slice(0, end + 1);
            });
            const history = historyRef.current;
            const lastUser = [...history].reverse().find(m => m.role === 'user');
            if (!lastUser) {
                return;
            }
            historyRef.current = history.slice(0, history.lastIndexOf(lastUser));
            await send(lastUser.content);
        },
        [isStreaming, send],
    );

    return { messages, isStreaming, send, regenerate, stop, clear };
}
