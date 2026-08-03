import {Button, Input, message, Modal} from 'antd';
import {useState} from 'react';

import runtimeOperationApi from '@/api/runtimeOperation';
import type {Pod} from '@/interface/entities/pod';
import {FooterBar, NoticeBar, SectionTitle, SubTitle, TimeoutField} from '../../batch/batchModal.style';
import {ClusterParamsTable} from '../../batch/ClusterParamsTable';
import {PodPreviewTable} from '../../batch/PodPreviewTable';
import {toPodTargets, toRestartClusters} from '../../batch/podTargets';
import {useClusterParams} from '../../batch/useClusterParams';
import {isMaxUnavailableValid, isTimeoutValid} from '../../restart/rows';
import {OperationModalTitle} from '../../shared/OperationModalTitle';

export interface BatchRestartPodModalProps {
    appEnvID: string;
    pods: Pod[];
    environmentName?: string;
    /** 操作名，来自 RuntimeOperation.name */
    operationName: string;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const SUBTITLE =
    '重启操作会按照部署并发度对所选 Pod 进行重启，且多个集群并行执行。重启过程中不销毁容器，仅重新拉起进程。';

export const BatchRestartPodModal = (
    { appEnvID, pods, environmentName, operationName, open, onClose, onSuccess }: BatchRestartPodModalProps,
) => {
    const { params, loading, error } = useClusterParams(appEnvID, pods);
    const [timeout, setTimeout] = useState('60');
    const [values, setValues] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const effective = (clusterId: string, fallback: string) => values[clusterId] ?? fallback;
    const canSubmit = pods.length > 0 && !loading && !error && isTimeoutValid(timeout)
        && params.every(param => isMaxUnavailableValid(effective(param.clusterId, param.maxUnavailable)));

    const handleSubmit = () => {
        const record: Record<string, string> = {};
        params.forEach(param => {
            record[param.clusterId] = effective(param.clusterId, param.maxUnavailable);
        });
        setSubmitting(true);
        runtimeOperationApi
            .restartPod({
                appEnvID,
                targets: toPodTargets(pods),
                clusters: toRestartClusters(record),
                exitTimeoutSeconds: Number(timeout),
                operation: operationName,
            })
            .then(() => {
                message.success('批量重启命令已下发，查看执行详情');
                onSuccess();
            })
            .catch(() => message.error('提交失败，请重试'))
            .finally(() => setSubmitting(false));
    };

    const footer = (
        <FooterBar>
            <Button onClick={onClose} style={{ marginRight: 12 }}>取消</Button>
            <Button type="primary" disabled={!canSubmit} loading={submitting} onClick={handleSubmit}>确定</Button>
        </FooterBar>
    );

    return (
        <Modal
            open={open}
            width={800}
            title={
                <OperationModalTitle
                    title={pods.length > 1 ? '批量重启Pod' : '重启Pod'}
                    environmentName={environmentName}
                />
            }
            onCancel={onClose}
            footer={footer}
            destroyOnHidden
        >
            <SubTitle>{SUBTITLE}</SubTitle>
            <NoticeBar>
                <p>1. 重启过程中不会销毁容器，仅重新拉起进程。</p>
                <p>2. 重启过程中会对重启 Pod 进行流量屏蔽操作，请关注重启完成后 ENS 的恢复状态。</p>
            </NoticeBar>
            <TimeoutField>
                <span>超时时间</span>
                <Input
                    style={{ width: 80 }}
                    value={timeout}
                    status={isTimeoutValid(timeout) ? undefined : 'error'}
                    onChange={event => setTimeout(event.target.value)}
                />
                <span>秒</span>
            </TimeoutField>
            <SectionTitle>待重启Pod（{pods.length}）</SectionTitle>
            <PodPreviewTable pods={pods} />
            <SectionTitle>集群与参数配置</SectionTitle>
            <ClusterParamsTable
                params={params}
                loading={loading}
                error={error}
                editable
                values={values}
                onChange={(clusterId, value) => setValues(prev => ({ ...prev, [clusterId]: value }))}
            />
        </Modal>
    );
};
