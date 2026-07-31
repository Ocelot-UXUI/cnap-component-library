import {Button, message, Modal} from 'antd';
import {useState} from 'react';

import runtimeOperationApi from '@/api/runtimeOperation';
import type {Pod} from '@/interface/entities/pod';
import {FooterBar} from '../batch/batchModal.style';
import {ClusterParamsTable} from '../batch/ClusterParamsTable';
import {PodPreviewTable} from '../batch/PodPreviewTable';
import {toPodTargets} from '../batch/podTargets';
import {useClusterParams} from '../batch/useClusterParams';
import {OperationModalTitle} from '../shared/OperationModalTitle';
import {NoticeBar, SectionTitle, SubTitle} from './DeleteModalBase.style';

export interface DeleteModalBaseProps {
    appEnvID: string;
    pods: Pod[];
    environmentName?: string;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    title: string;
    description: string;
    alertMessages: string[];
    successText: string;
    force: boolean;
}

export const DeleteModalBase = ({
    appEnvID,
    pods,
    environmentName,
    open,
    onClose,
    onSuccess,
    title,
    description,
    alertMessages,
    successText,
    force,
}: DeleteModalBaseProps) => {
    const { params, loading, error } = useClusterParams(appEnvID, pods);
    const [submitting, setSubmitting] = useState(false);
    const modalTitle = pods.length > 1 ? `批量${title}` : title;

    const handleSubmit = () => {
        setSubmitting(true);
        runtimeOperationApi
            .deletePod({ appEnvID, targets: toPodTargets(pods), force })
            .then(() => {
                message.success(successText);
                onSuccess();
            })
            .catch(() => message.error('提交失败，请重试'))
            .finally(() => setSubmitting(false));
    };

    const footer = (
        <FooterBar>
            <Button onClick={onClose} style={{ marginRight: 12 }}>取消</Button>
            <Button type="primary" disabled={pods.length === 0} loading={submitting} onClick={handleSubmit}>
                确定
            </Button>
        </FooterBar>
    );

    return (
        <Modal
            open={open}
            width={800}
            title={<OperationModalTitle title={modalTitle} environmentName={environmentName} />}
            onCancel={onClose}
            footer={footer}
            destroyOnHidden
        >
            <SubTitle>{description}</SubTitle>
            <NoticeBar>
                {alertMessages.map(text => <p key={text}>{text}</p>)}
            </NoticeBar>
            <SectionTitle>待操作Pod（{pods.length}）</SectionTitle>
            <PodPreviewTable pods={pods} />
            <SectionTitle>集群与参数配置</SectionTitle>
            <ClusterParamsTable params={params} loading={loading} error={error} />
        </Modal>
    );
};
