import {Tooltip} from '@/design';
import {Fragment} from 'react';

import type {Pod} from '@/interface/entities/pod';
import {ActionButton, Actions, BatchBarWrapper, CloseButton, CountText, VDivider} from './BatchActionBar.style';
import {BATCH_ACTION_ICONS, closeIcon} from './BatchActionIcons';
import {aggregateAction, BATCH_ACTIONS} from './batchActions';

interface BatchActionBarProps {
    pods: Pod[];
    onAction: (key: string, operationName?: string) => void;
    onClose: () => void;
}

export const BatchActionBar = ({ pods, onAction, onClose }: BatchActionBarProps) => {
    /** 从第一个 Pod 的 operations 中按 capability 查找对应的操作名 */
    const resolveOperationName = (capability: string): string | undefined => {
        const firstPod = pods[0];
        if (!firstPod?.operations) return undefined;
        return firstPod.operations.find(op => op.capability === capability)?.name;
    };

    return (
        <BatchBarWrapper>
            <CountText>已选择 {pods.length} 个实例</CountText>
            <Actions>
                {BATCH_ACTIONS.map(action => {
                    const { enabled, reasons } = aggregateAction(pods, action.capability);
                    const tooltip = !enabled && reasons.length > 0 ? reasons.join('；') : undefined;
                    return (
                        <Fragment key={action.key}>
                            {action.danger && <VDivider />}
                            <Tooltip title={tooltip}>
                                <ActionButton
                                    type="button"
                                    danger={action.danger}
                                    disabled={!enabled}
                                    onClick={() => {
                                        if (enabled && !action.placeholder) {
                                            onAction(action.key, resolveOperationName(action.capability));
                                        }
                                    }}
                                >
                                    {BATCH_ACTION_ICONS[action.key]}
                                    {action.label}
                                </ActionButton>
                            </Tooltip>
                        </Fragment>
                    );
                })}
                <VDivider />
                <CloseButton type="button" aria-label="关闭批量操作栏" onClick={onClose}>
                    {closeIcon}
                </CloseButton>
            </Actions>
        </BatchBarWrapper>
    );
};
