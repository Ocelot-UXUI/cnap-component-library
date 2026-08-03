/**
 * 工作负载操作弹窗共享数据编排：Group/Workload 顺序加载与容器名聚合（无 UI，与具体操作无关）。
 *
 * 纵向扩缩 / 横向扩缩 / 重启 三个弹窗共用此加载与聚合逻辑。
 */

import runtimeResourceApi from '@/api/runtimeResource';
import type {RuntimeWorkload, WorkloadGroup} from '@/interface/entities/workload';

/** 容器选项：名称 + 类型（MAIN / NORMAL / SIDECAR / INIT） */
export interface ContainerOption {
    name: string;
    type: string;
}

/** 聚合所有 Workload 的容器（去重，保持出现顺序，保留类型） */
export function aggregateContainerNames(workloads: RuntimeWorkload[]): ContainerOption[] {
    const seen = new Set<string>();
    const containers: ContainerOption[] = [];
    for (const workload of workloads) {
        for (const container of workload.podContainers) {
            if (!seen.has(container.name)) {
                seen.add(container.name);
                containers.push({ name: container.name, type: container.type });
            }
        }
    }
    return containers;
}

/** 加载 Group 列表（受集群参数影响） */
export function loadGroups(appEnvID: string, clusterId?: string): Promise<WorkloadGroup[]> {
    return runtimeResourceApi.getWorkloadGroups({ appEnvID, clusterId });
}

export interface WorkloadsBundle {
    workloads: RuntimeWorkload[];
    containerNames: ContainerOption[];
}

/** 加载某 Group 下 Workload 列表并聚合容器名 */
export async function loadWorkloads(appEnvID: string, groupId: string): Promise<WorkloadsBundle> {
    const workloads = await runtimeResourceApi.getRuntimeWorkloads({ appEnvID, groupId });
    return { workloads, containerNames: aggregateContainerNames(workloads) };
}
