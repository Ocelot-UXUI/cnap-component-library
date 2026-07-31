import constate from 'constate';
import {useCallback, useEffect, useState} from 'react';

import runtimeOperationApi from '@/api/runtimeOperation';
import runtimeResourceApi from '@/api/runtimeResource';
import {useAppEnvID, useNavigationSnapshot} from '@/contexts/NavigationContext';
import type {RuntimeOperation} from '@/interface/entities/runtimeOperation';
import type {RuntimeSummary} from '@/interface/entities/runtimeSummary';
import type {WorkloadGroup} from '@/interface/entities/workload';

function useWorkloadsRuntimeValue() {
    const appEnvID = useAppEnvID();
    const clusterId = useNavigationSnapshot().clusterId;

    const [groupId, setGroupId] = useState<string | undefined>(undefined);
    const [groups, setGroups] = useState<WorkloadGroup[]>([]);
    const [operations, setOperations] = useState<RuntimeOperation[]>([]);
    const [summary, setSummary] = useState<RuntimeSummary | undefined>(undefined);
    const [groupsLoading, setGroupsLoading] = useState(false);
    const [groupsError, setGroupsError] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summaryError, setSummaryError] = useState(false);
    const [nonce, setNonce] = useState(0);

    const reload = useCallback(() => setNonce(value => value + 1), []);

    // 全量分组 + 操作列表；切换环境/集群时重置选中组（新集群可能不含旧组）
    useEffect(() => {
        if (appEnvID === undefined) {
            setGroups([]);
            setOperations([]);
            setGroupId(undefined);
            return;
        }
        let cancelled = false;
        setGroupsLoading(true);
        setGroupsError(false);
        setGroupId(undefined);
        Promise.all([
            runtimeResourceApi.getWorkloadGroups({ appEnvID, clusterId }),
            runtimeOperationApi.getOperations({ appEnvID }),
        ])
            .then(([groupList, ops]) => {
                if (cancelled) {
                    return;
                }
                setGroups(groupList);
                setOperations(ops);
            })
            .catch(() => {
                if (!cancelled) {
                    setGroupsError(true);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setGroupsLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [appEnvID, clusterId, nonce]);

    // 运行时汇总，随选中组变化；独立加载态，不阻塞分组列表
    useEffect(() => {
        if (appEnvID === undefined) {
            setSummary(undefined);
            return;
        }
        let cancelled = false;
        setSummaryLoading(true);
        setSummaryError(false);
        runtimeResourceApi.getRuntimeSummary({ appEnvID, clusterId, groupId })
            .then(result => {
                if (!cancelled) {
                    setSummary(result);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setSummaryError(true);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setSummaryLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [appEnvID, clusterId, groupId, nonce]);

    return {
        appEnvID,
        clusterId,
        groupId,
        setGroupId,
        groups,
        operations,
        summary,
        groupsLoading,
        groupsError,
        summaryLoading,
        summaryError,
        reload,
    };
}

export const [WorkloadsRuntimeProvider, useWorkloadsRuntime] = constate(useWorkloadsRuntimeValue);
