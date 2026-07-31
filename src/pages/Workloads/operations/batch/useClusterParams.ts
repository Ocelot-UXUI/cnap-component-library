import {useEffect, useState} from 'react';

import runtimeResourceApi from '@/api/runtimeResource';
import type {Pod} from '@/interface/entities/pod';
import type {RuntimeWorkload} from '@/interface/entities/workload';
import {uniqueClusters} from './podTargets';

export interface ClusterParam {
    clusterId: string;
    clusterName: string;
    /** 最大不可用数值（已去除 %），无参数为 '' */
    maxUnavailable: string;
    maxSurge: string;
    availabilityTarget: string;
}

function strip(value?: string): string {
    return (value ?? '').replace('%', '').trim();
}

/**
 * 集群参数数据链：Pod.workloadName → WorkloadGroup.workloads[].name 求 groupId
 * → getRuntimeWorkloads(groupId) → 按 clusterId 取 updateStrategy / availabilityTarget。
 */
export function useClusterParams(appEnvID: string, pods: Pod[]) {
    const [params, setParams] = useState<ClusterParam[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const podsKey = pods.map(pod => `${pod.clusterId}/${pod.name}`).join(',');

    useEffect(() => {
        if (pods.length === 0) {
            setParams([]);
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError(false);
        runtimeResourceApi
            .getWorkloadGroups({ appEnvID })
            .then(groups => {
                const nameToGroupId = new Map<string, string>();
                for (const group of groups) {
                    for (const workload of group.workloads) {
                        nameToGroupId.set(workload.name, group.id);
                    }
                }
                const groupIds = [
                    ...new Set(pods.map(pod => nameToGroupId.get(pod.workloadName ?? '')).filter(Boolean)),
                ] as string[];
                return Promise.all(
                    groupIds.map(groupId => runtimeResourceApi.getRuntimeWorkloads({ appEnvID, groupId })),
                );
            })
            .then(workloadLists => {
                if (cancelled) {
                    return;
                }
                const byCluster = new Map<string, RuntimeWorkload>();
                for (const list of workloadLists) {
                    for (const workload of list) {
                        if (!byCluster.has(workload.clusterId)) {
                            byCluster.set(workload.clusterId, workload);
                        }
                    }
                }
                setParams(
                    uniqueClusters(pods).map(cluster => {
                        const workload = byCluster.get(cluster.clusterId);
                        return {
                            clusterId: cluster.clusterId,
                            clusterName: cluster.clusterName,
                            maxUnavailable: strip(workload?.updateStrategy?.maxUnavailable),
                            maxSurge: workload?.updateStrategy?.maxSurge ?? '',
                            availabilityTarget: workload?.availabilityTarget ?? '',
                        };
                    }),
                );
            })
            .catch(() => {
                if (!cancelled) {
                    setError(true);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appEnvID, podsKey]);

    return { params, loading, error };
}
