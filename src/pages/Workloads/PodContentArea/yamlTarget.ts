import type {Pod} from '@/interface/entities/pod';
import type {WorkloadGroup} from '@/interface/entities/workload';
import type {YamlDrawerProps} from './YamlDrawer';

export type YamlTarget = Omit<YamlDrawerProps, 'open' | 'onClose'>;

/** 由工作负载组构建 YAML 抽屉入参（取组下第一个 workload） */
export function workloadYamlTarget(appEnvID: string, group: WorkloadGroup): YamlTarget | null {
    const workload = group.workloads[0];
    if (!workload) {
        return null;
    }
    return {
        entry: 'workload',
        appEnvID,
        clusterId: workload.clusterId,
        resourceType: workload.resourceType,
        resourceName: workload.name,
    };
}

/** 由 Pod 构建 YAML 抽屉入参（core/v1/pods） */
export function podYamlTarget(appEnvID: string, pod: Pod): YamlTarget {
    return {
        entry: 'pod',
        appEnvID,
        clusterId: pod.clusterId,
        resourceType: 'core/v1/pods',
        resourceName: pod.name,
    };
}
