/* eslint-disable max-lines */
/* eslint-disable no-console */
/* eslint-disable react-hooks/exhaustive-deps */
/**
 * AI 命令执行器 Provider
 */
import {router} from '@/routers';
import {routes} from '@/routes';
import type {
    AIContext,
    ExecutorConfig,
    ExecutorState,
    TaskPlan,
    TaskStep,
} from '@/types/aiExecutor';
import {createContext, useCallback, useEffect, useRef, useState} from 'react';

interface AIExecutorContextValue {
    state: ExecutorState;
    execute: (plan: TaskPlan) => Promise<void>;
    pause: () => void;
    resume: () => void;
    abort: () => void;
    getContext: () => AIContext | null;
}

export const AIExecutorContext = createContext<AIExecutorContextValue | null>(null);

const DEFAULT_CONFIG: ExecutorConfig = {
    stepTimeout: 10000,
    navigateDelay: 300,
    skipOnElementNotFound: false,
};

interface AIExecutorProviderProps {
    children: React.ReactNode;
    config?: Partial<ExecutorConfig>;
}

export const AIExecutorProvider = ({ children, config }: AIExecutorProviderProps) => {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };

    const [state, setState] = useState<ExecutorState>({
        status: 'idle',
        currentPlan: null,
        currentStepIndex: 0,
        context: null,
    });

    // 使用 ref 避免闭包问题
    const executingRef = useRef(false);
    const pausedRef = useRef(false);
    const waitingForNavigateRef = useRef(false);
    const pendingStepsRef = useRef<TaskStep[]>([]);
    const resolveExecutionRef = useRef<(() => void) | null>(null);
    const configRef = useRef(mergedConfig);

    // 更新 config ref
    useEffect(
        () => {
            configRef.current = mergedConfig;
        },
        [mergedConfig],
    );

    // 加载 AI 上下文
    useEffect(
        () => {
            fetch('/ai-context.json')
                .then(res => res.json())
                .then((context: AIContext) => {
                    setState(prev => ({ ...prev, context }));
                    console.log('[AIExecutor] 上下文加载完成', context);
                })
                .catch(err => {
                    console.error('[AIExecutor] 加载上下文失败', err);
                });
        },
        [],
    );

    /**
     * 执行下一步 (声明提前以便在 subscribe 中使用)
     */
    const executeNextStepRef = useRef<(() => Promise<void>) | undefined>(undefined);

    // 监听路由变化
    useEffect(
        () => {
            const unsubscribe = router.subscribe(routerState => {
                if (
                    waitingForNavigateRef.current
                    && executingRef.current
                    && !pausedRef.current
                    && routerState.navigation.state === 'idle'
                ) {
                    waitingForNavigateRef.current = false;
                    console.log('[AIExecutor] 路由跳转完成，继续执行');

                    setTimeout(
                        () => {
                            executeNextStepRef.current?.();
                        },
                        configRef.current.navigateDelay,
                    );
                }
            });

            return unsubscribe;
        },
        [],
    );

    /**
     * 根据路由名称和参数构建 URL
     */
    const resolveRoutePath = (routeName: string, params?: Record<string, string>): string => {
        const routeObj = routes[routeName];
        if (routeObj) {
            return routeObj.toPath(params);
        }
        return routeName;
    };

    /**
     * 执行输入操作
     */
    const executeInput = async (step: TaskStep): Promise<void> => {
        const selector = `[data-ai-param="${step.param}"]`;
        const el = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;

        if (!el) {
            const msg = `[AIExecutor] 未找到输入元素: ${selector}`;
            console.warn(msg);
            if (!configRef.current.skipOnElementNotFound) {
                throw new Error(msg);
            }
            return;
        }

        el.focus();
        el.value = step.value || '';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`[AIExecutor] 输入完成: ${step.param} = ${step.value}`);
    };

    /**
     * 执行动作操作（DOM 查询方式）
     */
    const executeAction = async (step: TaskStep): Promise<void> => {
        const actionName = step.action;
        if (!actionName) {
            console.warn('[AIExecutor] action 步骤缺少 action 名称');
            return;
        }

        let selector = `[data-ai-action="${actionName}"]`;
        if (step.entity) {
            selector += `[data-ai-entity="${step.entity}"]`;
        }

        const el = document.querySelector(selector) as HTMLElement;

        if (!el) {
            const msg = `[AIExecutor] 未找到动作元素: ${selector}`;
            console.warn(msg);
            if (!configRef.current.skipOnElementNotFound) {
                throw new Error(msg);
            }
            return;
        }

        el.click();
        console.log(`[AIExecutor] DOM 动作执行: ${actionName}`);

        await new Promise(resolve => requestAnimationFrame(resolve));
    };

    /**
     * 执行下一步
     */
    const executeNextStep = async (): Promise<void> => {
        // 检查是否暂停或终止
        if (pausedRef.current || !executingRef.current) {
            return;
        }

        const step = pendingStepsRef.current.shift();

        if (!step) {
            // 所有步骤完成
            executingRef.current = false;
            setState(prev => ({ ...prev, status: 'completed' }));
            console.log('[AIExecutor] 任务完成');
            resolveExecutionRef.current?.();
            return;
        }

        // 更新当前步骤索引
        setState(prev => ({
            ...prev,
            currentStepIndex: prev.currentStepIndex + 1,
        }));

        console.log(`[AIExecutor] 执行步骤: ${step.type}`, step);

        try {
            switch (step.type) {
                case 'navigate': {
                    const path = resolveRoutePath(step.route!, step.params);
                    waitingForNavigateRef.current = true;
                    router.navigate(path);
                    // 不调用 executeNextStep，等待 router.subscribe 触发
                    break;
                }

                case 'input':
                    await executeInput(step);
                    await executeNextStep();
                    break;

                case 'action':
                    await executeAction(step);
                    await executeNextStep();
                    break;

                case 'wait':
                    await new Promise(resolve => setTimeout(resolve, step.duration || 500));
                    await executeNextStep();
                    break;

                default:
                    console.warn(`[AIExecutor] 未知步骤类型: ${step.type}`);
                    await executeNextStep();
            }
        } catch (error) {
            console.error('[AIExecutor] 步骤执行失败', error);
            executingRef.current = false;
            setState(prev => ({
                ...prev,
                status: 'error',
                error: error instanceof Error ? error.message : '未知错误',
            }));
        }
    };

    // 保存 executeNextStep 引用
    executeNextStepRef.current = executeNextStep;

    /**
     * 执行任务计划
     */
    const execute = useCallback(
        async (plan: TaskPlan): Promise<void> => {
            if (executingRef.current) {
                console.warn('[AIExecutor] 已有任务在执行中');
                return;
            }

            console.log('[AIExecutor] 开始执行任务', plan);

            executingRef.current = true;
            pausedRef.current = false;
            pendingStepsRef.current = [...plan.steps];

            setState(prev => ({
                status: 'running',
                currentPlan: plan,
                currentStepIndex: 0,
                context: prev.context,
            }));

            return new Promise(resolve => {
                resolveExecutionRef.current = resolve;
                executeNextStep();
            });
        },
        [],
    );

    /**
     * 暂停执行
     */
    const pause = useCallback(
        () => {
            if (executingRef.current && !pausedRef.current) {
                pausedRef.current = true;
                setState(prev => ({ ...prev, status: 'paused' }));
                console.log('[AIExecutor] 任务暂停');
            }
        },
        [],
    );

    /**
     * 继续执行
     */
    const resume = useCallback(
        () => {
            if (executingRef.current && pausedRef.current) {
                pausedRef.current = false;
                setState(prev => ({ ...prev, status: 'running' }));
                console.log('[AIExecutor] 任务继续');
                executeNextStep();
            }
        },
        [],
    );

    /**
     * 终止执行
     */
    const abort = useCallback(
        () => {
            if (executingRef.current) {
                executingRef.current = false;
                pausedRef.current = false;
                waitingForNavigateRef.current = false;
                pendingStepsRef.current = [];
                setState(prev => ({
                    ...prev,
                    status: 'idle',
                    currentPlan: null,
                    currentStepIndex: 0,
                }));
                console.log('[AIExecutor] 任务终止');
                resolveExecutionRef.current?.();
            }
        },
        [],
    );

    /**
     * 获取上下文
     */
    const getContext = useCallback(
        () => state.context,
        [state.context],
    );

    return (
        <AIExecutorContext.Provider
            value={{
                state,
                execute,
                pause,
                resume,
                abort,
                getContext,
            }}
        >
            {children}
        </AIExecutorContext.Provider>
    );
};
