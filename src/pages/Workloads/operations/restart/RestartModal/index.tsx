import {useMachine} from '@xstate/react';
import {Button, Input, message, Modal} from 'antd';
import {useEffect} from 'react';

import {OperationModalTitle} from '../../shared/OperationModalTitle';
import {WorkloadContainerSelector} from '../../shared/WorkloadContainerSelector';
import {restartMachine} from '../machine';
import {isTimeoutValid} from '../rows';
import {selectBottomHint, selectCanSubmit} from '../selectors';
import {ClusterTable} from './ClusterTable';
import {
    FooterBar,
    FooterHint,
    NoticeBar,
    SectionHint,
    SectionTitle,
    SubTitle,
    TimeoutRow,
} from './RestartModal.style';

interface RestartModalProps {
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

const SUBTITLE =
    '重启操作会按照部署并发度对所选工作负载下、指定集群的 Workload 进行重启，且多个集群并行执行。重启过程中不销毁容器，仅重新拉起进程。';

export const RestartModal = ({
    appEnvID,
    environmentName,
    defaultGroupId,
    clusterId,
    operationName,
    open,
    onClose,
    onSuccess,
}: RestartModalProps) => {
    const [snapshot, send] = useMachine(restartMachine, {
        input: { appEnvID, clusterId, defaultGroupId, operationName },
    });
    const context = snapshot.context;
    const submitting = snapshot.matches('submitting');

    useEffect(() => {
        if (snapshot.status === 'done') {
            message.success('重启命令已下发');
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
            title={<OperationModalTitle title="重启" environmentName={environmentName} />}
            onCancel={onClose}
            footer={footer}
            destroyOnHidden
        >
            <SubTitle>{SUBTITLE}</SubTitle>
            <NoticeBar>
                <p>1. 重启过程中不会销毁容器，仅重新拉起进程。</p>
                <p>2. 重启过程中会对重启 Pod 进行流量屏蔽操作，请关注重启完成后 ENS 的恢复状态。</p>
            </NoticeBar>
            <WorkloadContainerSelector
                groups={context.groups}
                groupId={context.groupId}
                containerNames={context.containerNames}
                container={context.container}
                onSelectGroup={groupId => send({ type: 'SELECT_GROUP', groupId })}
                onSelectContainer={container => send({ type: 'SELECT_CONTAINER', container })}
            />
            <SectionTitle>超时时间配置</SectionTitle>
            <TimeoutRow>
                <span className="timeout-label">超时时间</span>
                <Input
                    style={{ width: 80 }}
                    value={context.exitTimeout}
                    status={isTimeoutValid(context.exitTimeout) ? undefined : 'error'}
                    onChange={event => send({ type: 'SET_TIMEOUT', value: event.target.value })}
                />
                <span className="timeout-unit">秒</span>
            </TimeoutRow>
            <SectionTitle>
                集群与参数配置<SectionHint>（必填）</SectionHint>
            </SectionTitle>
            <ClusterTable
                rows={context.rows}
                onToggleCluster={key => send({ type: 'TOGGLE_CLUSTER', key })}
                onEditMaxUnavailable={(key, value) => send({ type: 'EDIT_MAX_UNAVAILABLE', key, value })}
            />
        </Modal>
    );
};
