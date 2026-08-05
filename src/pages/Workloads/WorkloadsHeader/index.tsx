import {Dropdown, Select} from '@/design';
import type {MenuProps} from '@/design';

import {useState} from 'react';

import moreDot from '@/assets/images/workloads-header-actions-more-dot.png';
import {useAppEnvID, useNavigationSnapshot} from '@/contexts/NavigationContext';

import {useWorkloadsRuntime} from '../useWorkloadsRuntime';

import {MODAL_CAPABILITIES, WorkloadOperationModals} from './OperationModals';
import {
    HeaderContainer,
    HeaderDivider,
    HeaderLeft,
    HeaderRight,
    HeaderTitle,
    WorkloadGroupSelector,
} from './WorkloadsHeader.style';
import {ActionButton, menuOverlayClass, MoreButton, MoreDots} from './WorkloadsHeaderActions.style';
import {getMenuOperationIcon, getPrimaryOperationIcon} from './WorkloadsHeaderIcons';

import type {OperationCapability, RuntimeOperation} from '@/interface/entities/runtimeOperation';

const dangerousCapabilities: Set<OperationCapability> = new Set([
    'ApplicationUninstall',
    'PodDelete',
    'PodDeleteForce',
]);

function isDangerous(operation: RuntimeOperation): boolean {
    return dangerousCapabilities.has(operation.capability);
}

// 标题栏仅展示 targetKind 为 None 的操作（Workload 操作归 Group 头部，Pod 操作归 Pod 行内/批量）
function isHeaderOperation(operation: RuntimeOperation): boolean {
    return (operation.targetKind === 'None' || operation.targetKind === 'Workload') && !operation.disabled;
}

function buildMoreMenuItems(
    operations: RuntimeOperation[],
    onClick: (operation: RuntimeOperation) => void,
): MenuProps['items'] {
    const items: NonNullable<MenuProps['items']> = [];
    operations.forEach((operation, index) => {
        if (isDangerous(operation) && index > 0) {
            items.push({ type: 'divider' });
        }
        items.push({
            key: operation.name,
            label: operation.displayName,
            icon: getMenuOperationIcon(operation.capability, operation.displayName),
            danger: isDangerous(operation),
            onClick: () => onClick(operation),
        });
    });
    return items;
}

export const WorkloadsHeader = () => {
    const appEnvID = useAppEnvID();
    const snapshot = useNavigationSnapshot();
    const clusterId = snapshot.clusterId;
    const environmentName = snapshot.environments.find(item => item.id === snapshot.environmentId)?.environmentName;

    const { groups, groupId, setGroupId, operations } = useWorkloadsRuntime();
    const [activeOp, setActiveOp] = useState<OperationCapability | null>(null);
    const [activeOperationName, setActiveOperationName] = useState<string | null>(null);

    const handleActionClick = (operation: RuntimeOperation) => {
        if (MODAL_CAPABILITIES.has(operation.capability)) {
            setActiveOp(operation.capability);
            setActiveOperationName(operation.name);
            return;
        }
        // 占位：其余操作弹窗后续接入
        console.log('action:', operation.name);
    };

    const headerOps = operations.filter(isHeaderOperation);
    const primaryOps = headerOps.slice(0, 3);
    const moreOps = headerOps.slice(3);

    return (
        <HeaderContainer>
            <HeaderLeft>
                <HeaderTitle>工作负载</HeaderTitle>
                <HeaderDivider />
                <WorkloadGroupSelector>
                    <Select
                        variant="borderless"
                        placeholder="全部工作负载"
                        allowClear
                        value={groupId}
                        options={groups.map(group => ({ value: group.id, label: group.name }))}
                        onChange={setGroupId}
                        style={{ minWidth: 140 }}
                    />
                </WorkloadGroupSelector>
            </HeaderLeft>
            <HeaderRight>
                {primaryOps.map(operation => (
                    <ActionButton
                        key={operation.name}
                        icon={getPrimaryOperationIcon(operation.capability)}
                        onClick={() => handleActionClick(operation)}
                    >
                        {operation.displayName}
                    </ActionButton>
                ))}
                {moreOps.length > 0 && (
                    <Dropdown
                        menu={{ items: buildMoreMenuItems(moreOps, handleActionClick) }}
                        trigger={['click']}
                        overlayClassName={menuOverlayClass}
                    >
                        <MoreButton
                            type="text"
                            aria-label="更多操作"
                            icon={
                                <MoreDots>
                                    <img src={moreDot} alt="" aria-hidden="true" />
                                    <img src={moreDot} alt="" aria-hidden="true" />
                                    <img src={moreDot} alt="" aria-hidden="true" />
                                </MoreDots>
                            }
                        />
                    </Dropdown>
                )}
            </HeaderRight>
            {appEnvID !== undefined && (
                <WorkloadOperationModals
                    active={activeOp}
                    operationName={activeOperationName}
                    appEnvID={appEnvID}
                    clusterId={clusterId}
                    environmentName={environmentName}
                    defaultGroupId={groupId}
                    onClose={() => {
                        setActiveOp(null);
                        setActiveOperationName(null);
                    }}
                />
            )}
        </HeaderContainer>
    );
};
