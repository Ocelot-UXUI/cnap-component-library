import {useMachine} from '@xstate/react';
import {Button, message, Modal, Select} from 'antd';
import {useEffect} from 'react';

import {OperationModalTitle} from '../../shared/OperationModalTitle';
import {horizontalScaleMachine} from '../machine';
import {selectBottomHint, selectCanSubmit} from '../selectors';
import {ClusterTable} from './ClusterTable';
import {FooterBar, FooterHint, SelectorBar, SubTitle} from './HorizontalScaleModal.style';

interface HorizontalScaleModalProps {
    appEnvID: string;
    environmentName?: string;
    defaultGroupId?: string;
    clusterId?: string;
    /** 操作名，来自 RuntimeOperation.name */
    operationName: string;
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const SUBTITLE = '横向扩缩是在保持当前 Pod 配置和规格的前提下，调整集群内 Pod 的数量。';

export const HorizontalScaleModal = ({
    appEnvID,
    environmentName,
    defaultGroupId,
    clusterId,
    operationName,
    open,
    onClose,
    onSuccess,
}: HorizontalScaleModalProps) => {
    const [snapshot, send] = useMachine(horizontalScaleMachine, {
        input: { appEnvID, clusterId, defaultGroupId, operationName },
    });
    const context = snapshot.context;
    const submitting = snapshot.matches('submitting');

    useEffect(() => {
        if (snapshot.status === 'done') {
            message.success('横向扩缩命令已下发');
            onSuccess?.();
            onClose();
        }
    }, [snapshot.status, onSuccess, onClose]);

    useEffect(() => {
        if (context.submitError) {
            message.error(context.submitError);
        }
    }, [context.submitError]);

    const footer = (
        <FooterBar>
            <FooterHint>{selectBottomHint(context)}</FooterHint>
            <div>
                <Button onClick={onClose} style={{ marginRight: 12 }}>取消</Button>
                <Button
                    type="primary"
                    disabled={!selectCanSubmit(context)}
                    loading={submitting}
                    onClick={() => send({ type: 'SUBMIT' })}
                >
                    确定
                </Button>
            </div>
        </FooterBar>
    );

    return (
        <Modal
            open={open}
            width={800}
            title={<OperationModalTitle title="横向扩缩" environmentName={environmentName} />}
            onCancel={onClose}
            footer={footer}
            destroyOnHidden
        >
            <SubTitle>{SUBTITLE}</SubTitle>
            <SelectorBar>
                <Select
                    style={{ width: 240 }}
                    placeholder="请选择工作负载"
                    value={context.groupId}
                    options={context.groups.map(group => ({ value: group.id, label: group.name }))}
                    onChange={groupId => send({ type: 'SELECT_GROUP', groupId })}
                />
                <Select
                    style={{ width: 160 }}
                    placeholder="容器"
                    value={context.container}
                    options={context.containerNames.map(name => ({ value: name, label: name }))}
                    onChange={container => send({ type: 'SELECT_CONTAINER', container })}
                />
            </SelectorBar>
            <ClusterTable
                rows={context.rows}
                onToggleCluster={key => send({ type: 'TOGGLE_CLUSTER', key })}
                onEditDesired={(key, desired) => send({ type: 'EDIT_DESIRED', key, desired })}
            />
        </Modal>
    );
};
