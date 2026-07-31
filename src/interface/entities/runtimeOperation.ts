/**
 * 运行时操作实体
 */

/**
 * 操作目标资源类型，决定操作在前端的展示位置。
 * - None / Workload：展示到右上角操作列表
 * - Pod：展示到 Pod 批量操作列表
 * - Workload 需指定一个工作负载名称
 */
export type OperationTargetKind = 'None' | 'Pod' | 'Workload';

/**
 * 操作能力标识，用于前端功能识别。
 *
 * 取值含义：
 * - ApplicationUninstall：删除部署资源/卸载应用
 * - Restart：重启（面向 workload）
 * - HorizontalScale：横向扩缩
 * - VerticalScale：纵向扩缩
 * - PodDelete：删除/重建
 * - PodDeleteForce：强制删除
 * - PodRestart：重启（面向具体 Pod）
 * - PodBlock：屏蔽
 * - PodUnblock：解除屏蔽/接流
 */
export type OperationCapability =
    | 'ApplicationUninstall'
    | 'Restart'
    | 'HorizontalScale'
    | 'VerticalScale'
    | 'PodDelete'
    | 'PodDeleteForce'
    | 'PodRestart'
    | 'PodBlock'
    | 'PodUnblock';

/**
 * 运行时操作定义
 *
 * 来源接口：GET /rest/v1/application-environments/:appEnvID/runtime/operations
 */
export interface RuntimeOperation {
    /** 真实触发 operation 名，后续路径里的 :operation 使用此值 */
    name: string;
    /** 操作能力标识，用于前端功能识别 */
    capability: OperationCapability;
    /** 展示名 */
    displayName: string;
    /** 操作描述 */
    description: string;
    /** 目标资源类型，决定展示位置 */
    targetKind: OperationTargetKind;
    /** 是否禁用 */
    disabled: boolean;
    /** 禁用原因，disabled 为 true 时鼠标悬浮展示 */
    reason: string;
    /** 是否支持批量操作 */
    supportsBatch?: boolean;
}

/**
 * 操作上下文
 *
 * 部分操作发起时需要展示当前状态信息，统一走 context 接口获取。
 *
 * 来源接口：GET /rest/v1/application-environments/:appEnvID/runtime/operations/:operation/context
 */
export interface OperationContext {
    /** 操作定义 */
    operation: RuntimeOperation;
    /** 参数表单校验 schema，暂不使用 */
    paramsSchema: Record<string, unknown>;
    /** 表单 UI schema，暂不使用 */
    paramsUi: Record<string, unknown>;
    /** 前端展示参数 */
    params: Record<string, unknown>;
}

/**
 * 操作目标
 *
 * 触发操作时指定目标资源。
 */
export interface OperationTarget {
    /** 目标所在集群 ID */
    clusterId?: string;
    /** 资源类型，例如 v1/pods、apps/v1/deployments */
    resourceType?: string;
    /** 资源名 */
    name?: string;
    /** 目标容器名（Restart/VerticalScale 等操作使用） */
    container?: string;
    /** per-target 参数（如 replicas、maxUnavailable 等） */
    params?: Record<string, unknown>;
}

/**
 * 触发操作的请求体
 */
export interface TriggerOperationParams {
    /** 操作目标列表 */
    targets?: OperationTarget[];
    /** 操作参数，不同操作有不同参数 */
    params?: Record<string, unknown>;
}

/**
 * 操作订单条目
 *
 * 表示一个操作订单在某集群上的执行条目。
 */
export interface OperationEntry {
    /** 条目 ID */
    id: string;
    /** 所属订单 ID */
    orderId: string;
    /** 集群 ID */
    clusterId: string;
    /** 操作目标列表 */
    targets: OperationTarget[];
    /** 条目状态 */
    status: string;
    /** 应用 ID */
    applicationId: string;
    /** 环境 ID */
    environmentId: string;
}

/**
 * 操作订单
 *
 * 触发操作后返回的订单信息，前端根据 status 展示提交结果。
 */
export interface OperationOrder {
    /** 订单 ID */
    id: string;
    /** 操作名 */
    operation: string;
    /** 操作参数 */
    params: Record<string, unknown>;
    /** 订单状态 */
    status: string;
    /** 订单条目列表 */
    entries: OperationEntry[];
    /** 账号 ID */
    accountId: string;
}

/**
 * 触发操作的响应体
 */
export interface TriggerOperationResult {
    /** 操作订单 */
    order: OperationOrder;
}

// ── 各 Operation 的参数类型 ──────────────────────────────────

/** Restart 重启（targetKind: Workload） — per-target params */
export interface RestartTargetParams {
    maxUnavailable?: string;
    [key: string]: unknown;
}

/** Restart 重启 — 完整 target（intersection 类型，兼容 OperationTarget） */
export type RestartTarget = OperationTarget & {
    container?: string;
    params?: RestartTargetParams;
};

/** HorizontalScale 横向扩缩（targetKind: Workload） — per-target params */
export interface HorizontalScaleTargetParams {
    replicas?: number;
    [key: string]: unknown;
}

/** HorizontalScale — 完整 target */
export type HorizontalScaleTarget = OperationTarget & {
    params?: HorizontalScaleTargetParams;
};

/** VerticalScale 纵向扩缩（targetKind: Workload） — per-target params */
export interface VerticalScaleTargetParams {
    resourceLimits?: Record<string, string>;
    resourceRequests?: Record<string, string>;
    [key: string]: unknown;
}

/** VerticalScale — 完整 target */
export type VerticalScaleTarget = OperationTarget & {
    container?: string;
    params?: VerticalScaleTargetParams;
};

/** PodRestart 实例重启（targetKind: Pod） — 集群级参数 */
export interface PodRestartClusterParams {
    clusterId?: string;
    maxUnavailable?: string;
}

/** PodRestart — 顶层 params */
export interface PodRestartTriggerParams {
    clusters?: PodRestartClusterParams[];
    exitTimeoutSeconds?: number;
}

/** Restart 重启 — 顶层 params */
export interface RestartTriggerParams {
    exitTimeoutSeconds?: number;
}
