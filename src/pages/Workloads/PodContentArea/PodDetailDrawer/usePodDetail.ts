import {useEffect, useState} from 'react';

import runtimeResourceApi from '@/api/runtimeResource';

import type {Container, ContainerUsage, Pod, PodDetailUsage} from '@/interface/entities/pod';

function mergeContainerUsages(containers: Container[] | undefined, usages: ContainerUsage[] | null | undefined) {
    const usageByName = new Map<string, ContainerUsage['resourceUsages']>();
    const duplicates = new Set<string>();
    (usages ?? []).forEach(usage => {
        if (usageByName.has(usage.name)) {
            duplicates.add(usage.name);
        } else {
            usageByName.set(usage.name, usage.resourceUsages);
        }
    });
    duplicates.forEach(name => usageByName.delete(name));
    return containers?.map(container => ({ ...container, resourceUsages: usageByName.get(container.name) }));
}

export function mergePodDetailUsage(pod: Pod, usage?: PodDetailUsage): Pod {
    return {
        ...pod,
        resourceUsages: usage?.resourceUsages,
        containers: mergeContainerUsages(pod.containers, usage?.containers),
        initContainers: mergeContainerUsages(pod.initContainers, usage?.initContainers),
    };
}

export interface PodDetailState {
    pod: Pod | undefined;
    loading: boolean;
    error: boolean;
    reload: () => void;
}

interface UsePodDetailParams {
    appEnvID: string;
    clusterId: string;
    podName: string;
    /** 是否启用拉取（Drawer 未打开时可关闭，避免无谓请求） */
    enabled?: boolean;
}

/**
 * Pod 详情数据获取：合并 `getPodDetail` 与 `getPodDetailUsage`（usage 失败降级为无用量）。
 * 供详情 Drawer 与独立详情页面共用。
 */
export function usePodDetail({ appEnvID, clusterId, podName, enabled = true }: UsePodDetailParams): PodDetailState {
    const [pod, setPod] = useState<Pod | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [nonce, setNonce] = useState(0);

    useEffect(() => {
        if (!enabled) {
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError(false);
        const detailParams = { appEnvID, clusterId, podName };
        Promise.all([
            runtimeResourceApi.getPodDetail(detailParams),
            runtimeResourceApi.getPodDetailUsage(detailParams).catch(() => undefined),
        ])
            .then(([result, usage]) => !cancelled && setPod(mergePodDetailUsage(result, usage)))
            .catch(() => !cancelled && setError(true))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [enabled, appEnvID, clusterId, podName, nonce]);

    return { pod, loading, error, reload: () => setNonce(value => value + 1) };
}
