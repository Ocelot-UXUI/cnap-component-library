/**
 * AI 能力类型定义
 */

/**
 * 能力参数定义
 */
export interface CapabilityParam {
    type: 'string' | 'number' | 'boolean';
    description: string;
    required?: boolean;
}

/**
 * 能力定义
 */
export interface Capability {
    /** 能力名称，唯一标识 */
    name: string;
    /** 能力描述，供 AI 理解 */
    description: string;
    /** 参数定义 */
    params?: Record<string, CapabilityParam>;
    /** 执行函数 */
    execute: (params: Record<string, unknown>) => Promise<unknown>;
}

/**
 * 能力描述（用于传递给 AI）
 */
export interface CapabilityDescription {
    name: string;
    description: string;
    params?: Record<string, CapabilityParam>;
}

/**
 * 能力执行结果
 */
export interface CapabilityResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}
