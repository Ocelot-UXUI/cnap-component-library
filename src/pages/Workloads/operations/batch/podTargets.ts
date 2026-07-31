/** 批量 Pod 操作的目标/集群参数映射（纯逻辑）。 */

import type {PodDeleteTarget, PodRestartTarget} from '@/api/runtimeOperation';
import type {Pod} from '@/interface/entities/pod';

/** 所选 Pod → operation targets（resourceType 固定 v1/pods） */
export function toPodTargets(pods: Pod[]): (PodRestartTarget & PodDeleteTarget)[] {
    return pods.map(pod => ({ clusterId: pod.clusterId, resourceType: 'v1/pods', name: pod.name }));
}

/** 所选 Pod 的集群去重（保持出现顺序），返回 {clusterId, clusterName} */
export function uniqueClusters(pods: Pod[]): { clusterId: string; clusterName: string; }[] {
    const seen = new Set<string>();
    const result: { clusterId: string; clusterName: string; }[] = [];
    for (const pod of pods) {
        if (!seen.has(pod.clusterId)) {
            seen.add(pod.clusterId);
            result.push({ clusterId: pod.clusterId, clusterName: pod.clusterName ?? pod.clusterId });
        }
    }
    return result;
}

/** 集群最大不可用编辑值（数值字符串）→ restartPod clusters 入参（拼接 %） */
export function toRestartClusters(
    values: Record<string, string>,
): { clusterId: string; maxUnavailable: string; }[] {
    return Object.entries(values).map(([clusterId, value]) => ({ clusterId, maxUnavailable: `${value}%` }));
}
