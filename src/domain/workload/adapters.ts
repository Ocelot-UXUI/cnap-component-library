/**
 * DTO → Domain 适配器：将接口实体转换为领域模型。
 * 隔离接口波动，是唯一知道 DTO 形状的地方。
 */

import type {RuntimeWorkload, RuntimeWorkloadContainer} from '@/interface/entities/workload';
import type {ResourceRef} from './model';
import type {ResourceSpec} from './resource';
import {toResourceSpec} from './resource';

/** 容器的资源规格（requests / limits 已解析为 ResourceSpec） */
export interface ContainerResourceSpecs {
    name: string;
    requests: ResourceSpec;
    limits: ResourceSpec;
}

/** RuntimeWorkload → ResourceRef */
export function toResourceRef(workload: RuntimeWorkload): ResourceRef {
    return {
        clusterId: workload.clusterId,
        resourceType: workload.resourceType,
        name: workload.name,
    };
}

/** RuntimeWorkloadContainer → 已解析的资源规格 */
export function toContainerResourceSpecs(container: RuntimeWorkloadContainer): ContainerResourceSpecs {
    return {
        name: container.name,
        requests: toResourceSpec(container.resourceRequests),
        limits: toResourceSpec(container.resourceLimits),
    };
}
