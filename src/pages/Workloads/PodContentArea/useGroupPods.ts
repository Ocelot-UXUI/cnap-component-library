import {useCallback, useEffect, useRef, useState} from 'react';

import runtimeResourceApi from '@/api/runtimeResource';
import type {PodList, PodUsage} from '@/interface/entities/pod';
import {toGetPodsParams} from './filterParams';
import {DEFAULT_QUERY} from './types';
import type {GroupQuery, PodFilterState} from './types';

const usageKey = (clusterId: string, name: string) => `${clusterId}\0${name}`;

export function mergePodUsages(data: PodList, usages: PodUsage[]): PodList {
    const usageByPod = new Map<string, PodUsage['resourceUsages']>();
    const duplicates = new Set<string>();
    usages.forEach(usage => {
        const key = usageKey(usage.clusterId, usage.name);
        if (usageByPod.has(key)) {
            duplicates.add(key);
        } else {
            usageByPod.set(key, usage.resourceUsages);
        }
    });
    duplicates.forEach(key => usageByPod.delete(key));
    return {
        ...data,
        items: data.items.map(pod => ({
            ...pod,
            resourceUsages: usageByPod.get(usageKey(pod.clusterId, pod.name)),
        })),
    };
}

export interface GroupPodsState {
    data?: PodList;
    loading: boolean;
    error: boolean;
    query: GroupQuery;
    setPage: (page: number, pageSize: number) => void;
    setSort: (sort?: string) => void;
    reload: () => void;
}

/**
 * 单个分组的 Pod 列表（真实 getPods）。筛选变更时重置到第 1 页；
 * 翻页 / 排序仅影响本组。仅在 enabled（组展开）时请求。
 */
export function useGroupPods(
    appEnvID: string | undefined,
    clusterId: string | undefined,
    groupId: string,
    filter: PodFilterState,
    enabled: boolean,
): GroupPodsState {
    const [data, setData] = useState<PodList | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [query, setQuery] = useState<GroupQuery>(DEFAULT_QUERY);
    const [nonce, setNonce] = useState(0);

    const filterKey = JSON.stringify(filter);
    const prevFilterKey = useRef(filterKey);

    useEffect(() => {
        const filterChanged = prevFilterKey.current !== filterKey;
        prevFilterKey.current = filterKey;
        if (filterChanged && query.page !== 1) {
            setQuery(current => ({ ...current, page: 1 }));
            return;
        }
        if (!enabled || appEnvID === undefined) {
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError(false);
        runtimeResourceApi
            .getPods(toGetPodsParams(appEnvID, clusterId, groupId, filter, query))
            .then(async result => {
                if (!cancelled) {
                    setData(mergePodUsages(result, []));
                }
                if (result.items.length === 0) {
                    return;
                }
                try {
                    const usages = await runtimeResourceApi.getPodUsages({
                        appEnvID,
                        pods: result.items.map(pod => ({ clusterId: pod.clusterId, name: pod.name })),
                    });
                    if (!cancelled) {
                        setData(mergePodUsages(result, usages));
                    }
                } catch {
                    // Usage is supplementary; base Pod data remains available.
                }
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
        // filterKey 覆盖 filter 内容变化；query 覆盖分页/排序
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appEnvID, clusterId, groupId, filterKey, query, enabled, nonce]);

    const setPage = useCallback(
        (page: number, pageSize: number) => setQuery(current => ({ ...current, page, pageSize })),
        [],
    );
    const setSort = useCallback((sort?: string) => setQuery(current => ({ ...current, sort, page: 1 })), []);
    const reload = useCallback(() => setNonce(value => value + 1), []);

    return { data, loading, error, query, setPage, setSort, reload };
}
