/**
 * AI 命令执行器类型定义
 */

/**
 * 任务步骤类型
 */
export type TaskStepType = 'navigate' | 'input' | 'action' | 'wait';

/**
 * 任务步骤
 */
export interface TaskStep {
    /** 步骤类型 */
    type: TaskStepType;
    /** 路由路径 (navigate) */
    route?: string;
    /** 路由参数 (navigate) */
    params?: Record<string, string>;
    /** 输入参数名 (input) - 对应 data-ai-param */
    param?: string;
    /** 输入值 (input) */
    value?: string;
    /** 动作名称 (action) - 对应 data-ai-action 或能力名称 */
    action?: string;
    /** 实体标识 (action) - 对应 data-ai-entity */
    entity?: string;
    /** 能力调用参数 (action) - 用于能力层调用 */
    actionParams?: Record<string, unknown>;
    /** 等待时长 ms (wait) */
    duration?: number;
    /** 步骤描述 */
    description?: string;
}

/**
 * 任务计划
 */
export interface TaskPlan {
    /** 任务 ID */
    id: string;
    /** 任务描述 */
    description?: string;
    /** 步骤列表 */
    steps: TaskStep[];
}

/**
 * 路由配置
 */
export interface RouteConfig {
    /** 路由路径 */
    path: string;
    /** 页面组件名 */
    page: string;
    /** 页面标题 */
    title: string;
    /** 页面支持的 actions */
    actions: string[];
    /** 路由参数 */
    params: string[];
}

/**
 * AI 上下文
 */
export interface AIContext {
    /** 版本号 */
    version: string;
    /** 路由配置列表 */
    routes: RouteConfig[];
}

/**
 * 执行器状态
 */
export type ExecutorStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error';

/**
 * 执行器状态
 */
export interface ExecutorState {
    /** 执行状态 */
    status: ExecutorStatus;
    /** 当前任务计划 */
    currentPlan: TaskPlan | null;
    /** 当前步骤索引 */
    currentStepIndex: number;
    /** AI 上下文 */
    context: AIContext | null;
    /** 错误信息 */
    error?: string;
}

/**
 * 步骤执行结果
 */
export interface StepResult {
    /** 是否成功 */
    success: boolean;
    /** 错误信息 */
    error?: string;
    /** 执行耗时 ms */
    duration: number;
}

/**
 * 执行器配置
 */
export interface ExecutorConfig {
    /** 步骤执行超时 ms */
    stepTimeout?: number;
    /** 路由跳转后等待时间 ms */
    navigateDelay?: number;
    /** 元素未找到时是否跳过 */
    skipOnElementNotFound?: boolean;
}
