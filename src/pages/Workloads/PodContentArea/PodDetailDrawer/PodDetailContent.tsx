import {Alert, Spin} from 'antd';

import {ClusterNameLabel} from '@/components/ClusterNameLabel';

import {BasicInfoCard} from './BasicInfoCard';
import {ContainerArea} from './ContainerArea';
import {OwnershipRow} from './PodDetailDrawer.style';

import type {PodDetailState} from './usePodDetail';

interface PodDetailContentProps {
    appEnvID: string;
    clusterId: string;
    podName: string;
    detail: PodDetailState;
}

/**
 * Pod 详情内容：所有权信息 + 基本信息卡片 + 容器区。
 * 与拉取状态解耦，供详情 Drawer 与独立详情页面以相同视图渲染。
 */
export const PodDetailContent = ({ appEnvID, clusterId, podName, detail }: PodDetailContentProps) => {
    const { pod, loading, error, reload } = detail;

    if (loading) {
        return <Spin />;
    }
    if (error) {
        return <Alert type="error" message="加载失败" action={<a onClick={reload}>重试</a>} />;
    }
    if (!pod) {
        return null;
    }

    return (
        <>
            <OwnershipRow>
                <span>
                    <b>应用:</b>
                    {pod.applicationName ?? '-'}
                </span>
                <span>
                    <b>集群:</b>
                    <ClusterNameLabel clusterName={pod.clusterName ?? pod.clusterId} clusterId={pod.clusterId} />
                </span>
                <span>
                    <b>工作负载:</b>
                    {pod.workloadName ?? '-'}
                </span>
            </OwnershipRow>
            <BasicInfoCard pod={pod} />
            <ContainerArea appEnvID={appEnvID} clusterId={clusterId} podName={podName} pod={pod} />
        </>
    );
};
