import {Dropdown, Popover} from 'antd';

import ChevronDown from '@/assets/chevron-down.svg?react';
import moreDot from '@/assets/group-header-more-dot.png';

import {
    CountText,
    Divider,
    GroupHeaderBar,
    GroupHeaderLeft,
    GroupHeaderRight,
    GroupName,
    KindTag,
    StatusCount,
    StatusGroup,
    StatusItem,
    ToggleButton,
    VersionText,
} from './GroupHeader.style';
import {MoreDots, MoreTrigger, VersionList, VersionRow} from './GroupHeaderPopover.style';
import {computeQuickCounts} from './quickFilter';

import type {RuntimeOperation} from '@/interface/entities/runtimeOperation';
import type {PodStatistics} from '@/interface/entities/runtimeSummary';
import type {WorkloadGroup} from '@/interface/entities/workload';
import type {MenuProps} from 'antd';

interface GroupHeaderProps {
    group: WorkloadGroup;
    expanded: boolean;
    summary?: PodStatistics;
    operations: RuntimeOperation[];
    clusterSelected: boolean;
    onToggle: () => void;
    onYamlView?: () => void;
    onWorkloadOperation: (operation: RuntimeOperation) => void;
}

function buildMenu(operations: RuntimeOperation[], clusterSelected: boolean): MenuProps['items'] {
    const items: NonNullable<MenuProps['items']> = operations
        .filter(op => op.targetKind === 'Workload')
        .map(op => ({ key: op.name, label: op.displayName, disabled: op.disabled }));
    items.push({ type: 'divider' });
    items.push({
        key: 'workload-yaml',
        label: '工作负载 YAML',
        disabled: !clusterSelected,
    });
    return items;
}

export const GroupHeader = (
    { group, expanded, summary, operations, clusterSelected, onToggle, onYamlView, onWorkloadOperation }: GroupHeaderProps,
) => {
    const counts = summary ? computeQuickCounts(summary) : undefined;

    const handleMenuClick: NonNullable<MenuProps['onClick']> = ({ key }) => {
        if (key === 'workload-yaml') {
            onYamlView?.();
            return;
        }
        const operation = operations.find(op => op.name === key);
        if (operation) {
            onWorkloadOperation(operation);
        }
    };
    const versionContent = (
        <VersionList>
            {group.workloads.map(workload => (
                <VersionRow key={workload.clusterId}>
                    <span>{workload.clusterName ?? workload.clusterId}</span>
                    <span>{workload.currentVersion}</span>
                </VersionRow>
            ))}
        </VersionList>
    );

    return (
        <GroupHeaderBar>
            <GroupHeaderLeft>
                <ToggleButton
                    type="button"
                    expanded={expanded}
                    aria-label={expanded ? '收起分组' : '展开分组'}
                    onClick={onToggle}
                >
                    <ChevronDown />
                </ToggleButton>
                <GroupName type="button" onClick={onToggle}>{group.name}</GroupName>
                <KindTag>{group.kind}</KindTag>
                <Divider />
                <Popover content={versionContent} title="各集群版本">
                    <VersionText>{group.currentVersion}</VersionText>
                </Popover>
            </GroupHeaderLeft>
            <GroupHeaderRight>
                {counts && (
                    <>
                        <StatusGroup>
                            <StatusItem>
                                运行中
                                <StatusCount status="success">{counts.normal}</StatusCount>
                            </StatusItem>
                            <StatusItem>
                                异常
                                <StatusCount status="error">{counts.abnormal}</StatusCount>
                            </StatusItem>
                            <StatusItem>
                                已屏蔽
                                <StatusCount status="warning">{counts.blocked}</StatusCount>
                            </StatusItem>
                        </StatusGroup>
                        <Divider />
                        <CountText>共 {counts.all} pod</CountText>
                    </>
                )}
                <Dropdown
                    menu={{ items: buildMenu(operations, clusterSelected), onClick: handleMenuClick }}
                    trigger={['hover']}
                >
                    <MoreTrigger type="button" aria-label="更多操作">
                        <MoreDots>
                            <img src={moreDot} alt="" aria-hidden="true" />
                            <img src={moreDot} alt="" aria-hidden="true" />
                            <img src={moreDot} alt="" aria-hidden="true" />
                        </MoreDots>
                    </MoreTrigger>
                </Dropdown>
            </GroupHeaderRight>
        </GroupHeaderBar>
    );
};
