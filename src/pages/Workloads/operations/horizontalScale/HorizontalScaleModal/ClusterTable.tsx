import {Checkbox, Input, Table} from '@/design';
import type {TableColumnsType} from '@/design';

import {ClusterNameLabel} from '@/components/ClusterNameLabel';

import {isDesiredValid} from '../rows';
import type {HorizontalRow} from '../rows';

interface ClusterTableProps {
    rows: HorizontalRow[];
    onToggleCluster: (key: string) => void;
    onEditDesired: (key: string, desired: string) => void;
}

export const ClusterTable = ({ rows, onToggleCluster, onEditDesired }: ClusterTableProps) => {
    const columns: TableColumnsType<HorizontalRow> = [
        {
            title: '',
            key: 'select',
            width: 40,
            render: (_, row) => <Checkbox checked={row.selected} onChange={() => onToggleCluster(row.key)} />,
        },
        {
            title: '集群',
            key: 'clusterName',
            width: 220,
            render: (_, row) => <ClusterNameLabel clusterName={row.clusterName} clusterId={row.clusterId} />,
        },
        { title: '当前副本数', dataIndex: 'replicas', key: 'replicas', width: 110 },
        {
            title: '期望副本数',
            key: 'desired',
            width: 140,
            render: (_, row) => (
                <Input
                    style={{ width: 80 }}
                    value={row.desired}
                    status={isDesiredValid(row.desired) ? undefined : 'error'}
                    onChange={event => onEditDesired(row.key, event.target.value)}
                />
            ),
        },
        { title: '最大不可用', dataIndex: 'maxUnavailable', key: 'maxUnavailable', width: 110 },
        {
            title: '可用度',
            key: 'availabilityTarget',
            width: 110,
            render: (_, row) => row.availabilityTarget || '未启用',
        },
    ];

    return (
        <Table<HorizontalRow>
            rowKey="key"
            columns={columns}
            dataSource={rows}
            pagination={false}
            scroll={{ y: 320 }}
            locale={{ emptyText: '该工作负载下暂无集群' }}
        />
    );
};
