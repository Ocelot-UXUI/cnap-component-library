import {InputNumber, Table} from '@/design';
import type {TableColumnsType} from '@/design';

import {ClusterNameLabel} from '@/components/ClusterNameLabel';

import {isDesiredValid} from '../rows';
import type {HorizontalRow} from '../rows';
import {toggledKeys} from '../../shared/selection';

interface ClusterTableProps {
    rows: HorizontalRow[];
    onToggleCluster: (key: string) => void;
    onEditDesired: (key: string, desired: string) => void;
}

export const ClusterTable = ({ rows, onToggleCluster, onEditDesired }: ClusterTableProps) => {
    const columns: TableColumnsType<HorizontalRow> = [
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
            render: (_, row) => (
                <InputNumber
                    style={{ width: 80 }}
                    value={row.desired}
                    status={isDesiredValid(row.desired) ? undefined : 'error'}
                    onChange={value => onEditDesired(row.key, value ?? '')}
                    min='1'
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
            rowSelection={{
                selectedRowKeys: rows.filter(row => row.selected).map(row => row.key),
                columnWidth: 40,
                selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
                onChange: keys => {
                    toggledKeys(rows, keys).forEach(onToggleCluster);
                },
            }}
        />
    );
};
