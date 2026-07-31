/**
 * 运行时汇总信息实体
 *
 * 来源接口：GET /rest/v1/application-environments/:appEnvID/runtime/summary
 */

/**
 * 资源需求汇总
 *
 * 各字段为带单位的字符串值，例如 cpu="32c"、memory="128Gi"、gpu="6"。
 */
export interface ResourceRequirements {
    /** CPU 需求，例如 "32c" */
    cpu: string;
    /** 内存需求，例如 "128Gi" */
    memory: string;
    /** GPU 需求，例如 "6" */
    gpu: string;
}

/**
 * Pod 状态汇总
 */
export interface PodStatusSummary {
    /** Pod 状态，例如 Running Ready */
    status: string;
    /** 数量 */
    count: number;
}

/**
 * Pod 统计信息
 *
 * 包含总计、已屏蔽计数和状态分布。
 */
export interface PodStatistics {
    /** Pod 总数 */
    totalCount: number;
    /** 已屏蔽 Pod 数量 */
    blockedCount: number;
    /** Pod 状态分布 */
    statuses: PodStatusSummary[];
}

/**
 * 运行时汇总信息
 */
export interface RuntimeSummary {
    /** 资源需求汇总 */
    resourceRequirements: ResourceRequirements;
    /** Pod 统计信息 */
    podStatistics: PodStatistics;
}
