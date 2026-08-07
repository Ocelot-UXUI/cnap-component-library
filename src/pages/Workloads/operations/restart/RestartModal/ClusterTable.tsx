import {InputNumber, Table} from '@/design';
import type {TableColumnsType} from '@/design';

import {ClusterNameLabel} from '@/components/ClusterNameLabel';

import {isMaxUnavailableValid} from '../rows';
import type {RestartRow} from '../rows';
import {toggledKeys} from '../../shared/selection';

interface ClusterTableProps {
    rows: RestartRow[];
    onToggleCluster: (key: string) => void;
    onEditMaxUnavailable: (key: string, value: string) => void;
}

export const ClusterTable = ({ rows, onToggleCluster, onEditMaxUnavailable }: ClusterTableProps) => {
    const columns: TableColumnsType<RestartRow> = [
        {
            title: '集群',
            key: 'clusterName',
            width: 240,
            render: (_, row) => <ClusterNameLabel clusterName={row.clusterName} clusterId={row.clusterId} />,
        },
        {
            title: '最大不可用',
            key: 'maxUnavailable',
            width: 160,
            render: (_, row) => (
                <InputNumber
                    style={{ width: 80 }}
                    value={row.maxUnavailable}
                    suffix="%"
                    status={isMaxUnavailableValid(row.maxUnavailable) ? undefined : 'error'}
                    onChange={value => onEditMaxUnavailable(row.key, value ?? '')}
                    max='100'
                    min='1'
                />
            ),
        },
        { title: '最大可超出', dataIndex: 'maxSurge', key: 'maxSurge', width: 160 },
        {
            title: '可用度',
            key: 'availabilityTarget',
            width: 160,
            render: (_, row) => row.availabilityTarget || '未启用',
        },
    ];

    return (
        <Table<RestartRow>
            rowKey="key"
            columns={columns}
            dataSource={rows}
            pagination={false}
            scroll={{ y: 280 }}
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
