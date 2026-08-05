import {Tag, Table} from '@/design';
import type {TableColumnsType} from '@/design';

import {ClusterNameLabel} from '@/components/ClusterNameLabel';
import {semantic} from '@/constants/colors';
import type {Pod} from '@/interface/entities/pod';
import {statusLabel, statusTone} from '../../PodContentArea/podStatus';

const toneColor = {
    success: semantic.state.success.default,
    info: semantic.state.info.default,
    warning: semantic.state.warning.default,
    error: semantic.state.error.default,
};

interface PodPreviewTableProps {
    pods: Pod[];
}

export const PodPreviewTable = ({ pods }: PodPreviewTableProps) => {
    const columns: TableColumnsType<Pod> = [
        { title: 'Pod 名称', dataIndex: 'name', key: 'name', width: 280 },
        { title: '所属工作负载', dataIndex: 'workloadName', key: 'workloadName', width: 186 },
        {
            title: '集群',
            key: 'clusterName',
            width: 186,
            render: (_, pod) => <ClusterNameLabel clusterName={pod.clusterName ?? pod.clusterId} clusterId={pod.clusterId} />,
        },
        {
            title: '状态',
            key: 'status',
            width: 100,
            render: (_, pod) => <Tag color={toneColor[statusTone(pod.status)]}>{statusLabel(pod.status)}</Tag>,
        },
    ];

    return (
        <Table<Pod>
            rowKey={pod => `${pod.clusterId}/${pod.name}`}
            columns={columns}
            dataSource={pods}
            pagination={false}
            scroll={{ y: 200 }}
        />
    );
};
