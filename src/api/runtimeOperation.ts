import type {
    OperationContext,
    RuntimeOperation,
    TriggerOperationParams,
    TriggerOperationResult,
} from '@/interface/entities/runtimeOperation';
import {createInterface} from './services/primary';

interface ParamsGetOperations {
    /** 应用环境关系 ID */
    appEnvID: string;
    /** 集群 ID */
    clusterId?: string;
}

interface ParamsGetOperationContext {
    /** 应用环境关系 ID */
    appEnvID: string;
    /** 操作名，来自操作列表的 name */
    operation: string;
}

interface ParamsTriggerOperation {
    /** 应用环境关系 ID */
    appEnvID: string;
    /** 操作名，来自操作列表的 name */
    operation: string;
}

/**
 * 查询可用操作列表
 *
 * GET /rest/v1/application-environments/:appEnvID/runtime/operations
 */
const getOperations = createInterface<ParamsGetOperations, RuntimeOperation[]>(
    'GET',
    '/application-environments/{appEnvID}/runtime/operations',
);

/**
 * 查询操作上下文
 *
 * GET /rest/v1/application-environments/:appEnvID/runtime/operations/:operation/context
 *
 * 部分操作发起时需要展示当前状态信息，统一走此接口。
 */
const getOperationContext = createInterface<ParamsGetOperationContext, OperationContext>(
    'GET',
    '/application-environments/{appEnvID}/runtime/operations/{operation}/context',
);

/**
 * 触发运行时操作
 *
 * POST /rest/v1/application-environments/:appEnvID/runtime/operations/:operation/trigger
 *
 * 请求体通过第二个参数传入，包含 targets 和 params。
 */
const triggerOperation = createInterface<
    ParamsTriggerOperation & TriggerOperationParams,
    TriggerOperationResult
>(
    'POST',
    '/application-environments/{appEnvID}/runtime/operations/{operation}/trigger',
);

// ── 业务层操作封装 ──────────────────────────────────────────

/** Restart 重启（targetKind: Workload） */
export interface RestartTarget {
    clusterId: string;
    resourceType?: string;
    name: string;
    container?: string;
    maxUnavailable?: string;
}

export interface RestartInput {
    appEnvID: string;
    targets: RestartTarget[];
    exitTimeoutSeconds?: number;
}

export const restartWorkload = (input: RestartInput) =>
    triggerOperation({
        appEnvID: input.appEnvID,
        operation: 'workload-restart',
        targets: input.targets.map(t => ({
            clusterId: t.clusterId,
            resourceType: t.resourceType,
            name: t.name,
            container: t.container,
            params: { maxUnavailable: t.maxUnavailable },
        })),
        params: { exitTimeoutSeconds: input.exitTimeoutSeconds },
    });

/** HorizontalScale 横向扩缩（targetKind: Workload） */
export interface HorizontalScaleTarget {
    clusterId: string;
    resourceType?: string;
    name: string;
    replicas: number;
}

export interface HorizontalScaleInput {
    appEnvID: string;
    targets: HorizontalScaleTarget[];
}

export const horizontalScale = (input: HorizontalScaleInput) =>
    triggerOperation({
        appEnvID: input.appEnvID,
        operation: 'workload-horizontal-scale',
        targets: input.targets.map(t => ({
            clusterId: t.clusterId,
            resourceType: t.resourceType,
            name: t.name,
            params: { replicas: t.replicas },
        })),
    });

/** VerticalScale 纵向扩缩（targetKind: Workload） */
export interface VerticalScaleTarget {
    clusterId: string;
    resourceType?: string;
    name: string;
    container?: string;
    resourceLimits?: Record<string, string>;
    resourceRequests?: Record<string, string>;
}

export interface VerticalScaleInput {
    appEnvID: string;
    targets: VerticalScaleTarget[];
}

export const verticalScale = (input: VerticalScaleInput) =>
    triggerOperation({
        appEnvID: input.appEnvID,
        operation: 'workload-vertical-scale',
        targets: input.targets.map(t => ({
            clusterId: t.clusterId,
            resourceType: t.resourceType,
            name: t.name,
            container: t.container,
            params: {
                resourceLimits: t.resourceLimits,
                resourceRequests: t.resourceRequests,
            },
        })),
    });

/** PodRestart 实例重启（targetKind: Pod） */
export interface PodRestartTarget {
    clusterId: string;
    resourceType?: string;
    name: string;
}

export interface PodRestartInput {
    appEnvID: string;
    targets: PodRestartTarget[];
    clusters?: { clusterId: string; maxUnavailable?: string; }[];
    exitTimeoutSeconds?: number;
}

export const restartPod = (input: PodRestartInput) =>
    triggerOperation({
        appEnvID: input.appEnvID,
        operation: 'pod.restart',
        targets: input.targets.map(t => ({
            clusterId: t.clusterId,
            resourceType: t.resourceType ?? 'v1/pods',
            name: t.name,
        })),
        params: {
            clusters: input.clusters,
            exitTimeoutSeconds: input.exitTimeoutSeconds,
        },
    });

/** PodDelete 删除/重建 & PodDeleteForce 强制删除（targetKind: Pod） */
export interface PodDeleteTarget {
    clusterId: string;
    resourceType?: string;
    name: string;
}

export interface PodDeleteInput {
    appEnvID: string;
    targets: PodDeleteTarget[];
    force?: boolean;
}

export const deletePod = (input: PodDeleteInput) =>
    triggerOperation({
        appEnvID: input.appEnvID,
        operation: input.force ? 'pod.delete-force' : 'pod-delete',
        targets: input.targets.map(t => ({
            clusterId: t.clusterId,
            resourceType: t.resourceType ?? 'v1/pods',
            name: t.name,
        })),
    });

export default {
    getOperations,
    getOperationContext,
    triggerOperation,
    restartWorkload,
    horizontalScale,
    verticalScale,
    restartPod,
    deletePod,
};
