import {useMachine} from '@xstate/react';
import {Button, message, Modal} from '@/design';
import {useEffect} from 'react';

import {OperationModalTitle} from '../../shared/OperationModalTitle';
import {WorkloadContainerSelector} from '../../shared/WorkloadContainerSelector';
import {verticalScaleMachine} from '../machine';
import {selectBottomHint, selectCanSubmit} from '../selectors';
import {ClusterTable} from './ClusterTable';
import {FooterBar, FooterHint, SubTitle} from './VerticalScaleModal.style';

interface VerticalScaleModalProps {
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

const SUBTITLE1 = `纵向扩缩是在保持当前集群Pod数量的前提下，调整Pod的资源规格，Pod规格可按集群调整。\n
Request为Pod调度时保障的最小资源量，Limit为Pod运行时允许使用的资源上限。Limit不填写时，默认与Request一致。
`;

export const VerticalScaleModal = ({
    appEnvID,
    environmentName,
    defaultGroupId,
    clusterId,
    operationName,
    open,
    onClose,
    onSuccess,
}: VerticalScaleModalProps) => {
    const [snapshot, send] = useMachine(verticalScaleMachine, {
        input: { appEnvID, clusterId, defaultGroupId, operationName },
    });
    const context = snapshot.context;
    const submitting = snapshot.matches('submitting');

    useEffect(() => {
        if (snapshot.status === 'done') {
            message.success('纵向扩缩命令已下发，查看执行详情');
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
            width={1024}
            title={<OperationModalTitle title="纵向扩缩" environmentName={environmentName} />}
            onCancel={onClose}
            footer={footer}
            destroyOnHidden
        >
            <SubTitle>{SUBTITLE1}</SubTitle>
            <WorkloadContainerSelector
                groups={context.groups}
                groupId={context.groupId}
                containerNames={context.containerNames}
                container={context.container}
                onSelectGroup={groupId => send({ type: 'SELECT_GROUP', groupId })}
                onSelectContainer={container => send({ type: 'SELECT_CONTAINER', container })}
            />
            <ClusterTable
                rows={context.rows}
                onToggleCluster={key => send({ type: 'TOGGLE_CLUSTER', key })}
                onToggleLimit={(key, kind) => send({ type: 'TOGGLE_LIMIT', key, kind })}
                onEdit={(key, kind, side, patch) => send({ type: 'EDIT_FIELD', key, kind, side, patch })}
            />
        </Modal>
    );
};
