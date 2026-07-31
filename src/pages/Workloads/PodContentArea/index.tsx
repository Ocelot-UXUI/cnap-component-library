import {Alert, Empty, Spin} from 'antd';
import {useMemo, useState} from 'react';

import {useAppEnvID, useNavigationSnapshot} from '@/contexts/NavigationContext';
import type {Pod, PodOperation} from '@/interface/entities/pod';
import {useWorkloadsRuntime} from '../useWorkloadsRuntime';
import {DrawerHost} from './DrawerHost';
import type {DrawerView} from './DrawerHost';
import {AreaContainer, GroupSection} from './PodContentArea.style';
import {PodContentHeader} from './PodContentHeader';
import {PodFilterBar} from './PodFilterBar';
import {PodGroupTable} from './PodGroupTable';
import {statusLabel} from './podStatus';
import {computeQuickCounts, quickFilterBlocked, quickFilterStatusValues} from './quickFilter';
import type {QuickFilterKey} from './quickFilter';
import {groupKeys} from './selection';
import type {SelectedPods} from './selection';
import {DEFAULT_FILTER} from './types';
import type {PodFilterState, ViewMode} from './types';
import {podYamlTarget, workloadYamlTarget} from './yamlTarget';

const EMPTY_COUNTS = { all: 0, normal: 0, abnormal: 0, blocked: 0 };

interface PodContentAreaProps {
    selection: SelectedPods;
    onGroupSelectionChange: (groupId: string, keys: string[], rows: Pod[]) => void;
    onPodOperation: (pod: Pod, operation: PodOperation) => void;
}

export const PodContentArea = ({ selection, onGroupSelectionChange, onPodOperation }: PodContentAreaProps) => {
    const appEnvID = useAppEnvID();
    const clusterId = useNavigationSnapshot().clusterId;

    const {
        groups: allGroups,
        summary,
        operations,
        groupId,
        groupsLoading,
        groupsError,
        reload,
    } = useWorkloadsRuntime();
    const groups = groupId ? allGroups.filter(group => group.id === groupId) : allGroups;
    const stats = summary?.podStatistics;
    const [filter, setFilter] = useState<PodFilterState>(DEFAULT_FILTER);
    const [mode, setMode] = useState<ViewMode>('detailed');
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
    const [refreshNonce, setRefreshNonce] = useState(0);
    const [drawer, setDrawer] = useState<DrawerView | null>(null);

    const availableStatuses = useMemo(() => stats?.statuses.map(item => item.status) ?? [], [stats]);
    const statusOptions = (stats?.statuses ?? []).map(item => ({
        value: item.status,
        label: `${statusLabel(item.status)}（${item.count}）`,
    }));
    const quickCounts = stats ? computeQuickCounts(stats) : EMPTY_COUNTS;

    const onQuickSelect = (key: QuickFilterKey) => {
        setFilter(prev => ({
            ...prev,
            status: quickFilterStatusValues(key, availableStatuses),
            blocked: quickFilterBlocked(key),
            quick: key,
        }));
    };

    const refresh = () => {
        reload();
        setRefreshNonce(value => value + 1);
    };

    const toggleGroup = (id: string) =>
        setCollapsed(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });

    if (appEnvID === undefined) {
        return (
            <AreaContainer>
                <Empty description="请选择应用环境" />
            </AreaContainer>
        );
    }

    return (
        <AreaContainer>
            <PodContentHeader
                mode={mode}
                onModeChange={setMode}
                onExpandAll={() => setCollapsed(new Set())}
                onCollapseAll={() => setCollapsed(new Set(groups.map(group => group.id)))}
                onRefresh={refresh}
            />
            <PodFilterBar
                filter={filter}
                statusOptions={statusOptions}
                quickCounts={quickCounts}
                onStatusChange={status => setFilter(prev => ({ ...prev, status, quick: null }))}
                onBlockedChange={blocked => setFilter(prev => ({ ...prev, blocked, quick: null }))}
                onKeywordChange={keyword => setFilter(prev => ({ ...prev, keyword }))}
                onQuickSelect={onQuickSelect}
            />
            {groupsError && <Alert type="error" message="工作负载加载失败" action={<a onClick={reload}>重试</a>} />}
            {groupsLoading
                ? <Spin />
                : groups.length === 0
                ? <Empty description="暂无工作负载实例" />
                : (
                    <GroupSection>
                        {groups.map(group => (
                            <PodGroupTable
                                key={`${group.id}-${refreshNonce}`}
                                group={group}
                                appEnvID={appEnvID}
                                clusterId={clusterId}
                                filter={filter}
                                mode={mode}
                                expanded={!collapsed.has(group.id)}
                                operations={operations}
                                selectedKeys={groupKeys(selection, group.id)}
                                onToggle={() => toggleGroup(group.id)}
                                onSelectionChange={onGroupSelectionChange}
                                onOpenDetail={pod => setDrawer({ type: 'detail', pod })}
                                onYamlView={() => {
                                    const target = workloadYamlTarget(appEnvID, group);
                                    if (target) {
                                        setDrawer({ type: 'yaml', target });
                                    }
                                }}
                                onPodYamlView={pod => setDrawer({ type: 'yaml', target: podYamlTarget(appEnvID, pod) })}
                                onPodOperation={onPodOperation}
                            />
                        ))}
                    </GroupSection>
                )}
            {drawer && <DrawerHost appEnvID={appEnvID} drawer={drawer} onClose={() => setDrawer(null)} />}
        </AreaContainer>
    );
};
