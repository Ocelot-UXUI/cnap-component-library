/**
 * Workload 领域模型：身份与写模型
 *
 * 见 docs/architecture/workload-domain-model.md（L1 值对象 / L2 聚合 / L4 读写分离）。
 */

import type {OperationCapability} from '@/interface/entities/runtimeOperation';

/**
 * 资源身份：Workload / Pod / OperationTarget 的共同标识。
 * 作为读模型与写模型（OperationCommand）之间的接缝。
 *
 * 注：CNAP 2.0 不向用户暴露 K8s namespace，故资源身份不含 namespace 维度。
 */
export interface ResourceRef {
    clusterId: string;
    // K8s资源类型，提交操作时被映射进各封装 API
    resourceType: string;
    name: string;
}

/** 写模型：单个操作目标 */
export interface CommandTarget {
    ref: ResourceRef;
    /** 目标容器名（Restart / VerticalScale 等按容器维度操作时使用） */
    container?: string;
    /** per-target 参数（如 resourceLimits / resourceRequests / replicas 等） */
    params?: Record<string, unknown>;
}

/**
 * 写模型：一次操作命令。
 * 由能力注册表的 build 函数产出；由页面层映射为对应封装 API 的入参后提交。
 */
export interface OperationCommand {
    capability: OperationCapability;
    targets: CommandTarget[];
    params?: Record<string, unknown>;
}
