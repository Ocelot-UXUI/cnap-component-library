/**
 * Agentic 循环：tool_calls 解析 → execute → 结果回传
 */
import {getAgentCapability} from '@/agentCapabilities';
import {streamChat} from '@/api/ai/chat';
import type {AgentStep, ChatMessage, ToolCall} from '@/api/ai/types';
import type {TaskPlan} from '@/types/aiExecutor';

type ExecuteFn = (plan: TaskPlan) => Promise<void>;
type OnDeltaFn = (delta: string) => void;
type OnStepsFn = (steps: AgentStep[]) => void;

/** 将 tool_calls 转换为 TaskPlan（navigate 工具特殊处理） */
const toolCallsToTaskPlan = (toolCalls: ToolCall[]): TaskPlan => {
    const steps = toolCalls.map(tc => {
        let args: Record<string, unknown> = {};
        try {
            args = JSON.parse(tc.function.arguments) as Record<string, unknown>;
        } catch {
            // 忽略解析失败
        }
        return {
            type: 'action' as const,
            action: tc.function.name,
            actionParams: args,
            description: tc.function.name,
        };
    });

    return {
        id: `agent-${Date.now()}`,
        description: toolCalls.map(tc => tc.function.name).join(', '),
        steps,
    };
};

/** 将 TaskPlan steps 转为 AgentStep 列表 */
const planToAgentSteps = (plan: TaskPlan, status: AgentStep['status']): AgentStep[] =>
    plan.steps.map((s, i) => ({
        id: `${plan.id}-${i}`,
        title: s.description ?? s.action ?? s.type,
        status,
    }));

/** 处理 tool_calls 阶段：执行工具并更新 messages */
const handleToolCalls = async (
    toolCalls: ToolCall[],
    deltaBuffer: string,
    onSteps: OnStepsFn,
    execute: ExecuteFn,
): Promise<ChatMessage[]> => {
    const plan = toolCallsToTaskPlan(toolCalls);
    onSteps(planToAgentSteps(plan, 'running'));

    try {
        const firstTool = toolCalls[0];
        const capability = getAgentCapability(firstTool.function.name);
        if (capability) {
            let args: Record<string, unknown> = {};
            try {
                args = JSON.parse(firstTool.function.arguments) as Record<string, unknown>;
            } catch {
                // 忽略
            }
            const toolResult = capability.execute(args);
            onSteps(planToAgentSteps(plan, toolResult.ok ? 'success' : 'error'));
            return [
                { role: 'assistant', content: deltaBuffer, tool_calls: toolCalls },
                { role: 'tool', content: JSON.stringify(toolResult), tool_call_id: firstTool.id },
            ];
        }
        await execute(plan);
        onSteps(planToAgentSteps(plan, 'success'));

        return [
            { role: 'assistant', content: deltaBuffer, tool_calls: toolCalls },
            { role: 'tool', content: JSON.stringify({ ok: true }), tool_call_id: firstTool.id },
        ];
    } catch (err) {
        const errMsg = err instanceof Error ? err.message : '未知错误';
        onSteps(planToAgentSteps(plan, 'error'));
        return [
            { role: 'assistant', content: deltaBuffer, tool_calls: toolCalls },
            { role: 'tool', content: `执行失败: ${errMsg}`, tool_call_id: toolCalls[0].id },
        ];
    }
};

/**
 * 运行 Agentic 循环
 * @returns 更新后的完整消息历史
 */
export const runAgentLoop = async (
    userInput: string,
    history: ChatMessage[],
    onDelta: OnDeltaFn,
    onSteps: OnStepsFn,
    execute: ExecuteFn,
    signal?: AbortSignal,
): Promise<ChatMessage[]> => {
    const messages: ChatMessage[] = [
        ...history,
        { role: 'user', content: userInput },
    ];

    const MAX_ROUNDS = 5;
    let round = 0;

    while (round < MAX_ROUNDS && !signal?.aborted) {
        round++;
        let deltaBuffer = '';

        const result = await streamChat(
            messages,
            delta => {
                deltaBuffer += delta;
                onDelta(delta);
            },
            signal,
        );

        if (result.finishReason === 'stop') {
            messages.push({ role: 'assistant', content: result.content });
            break;
        }
        console.log(result.finishReason);
        if (result.finishReason === 'tool_calls' && result.toolCalls?.length) {
            const toolMessages = await handleToolCalls(
                result.toolCalls,
                deltaBuffer,
                onSteps,
                execute,
            );
            messages.push(...toolMessages);
        }
    }

    return messages;
};
