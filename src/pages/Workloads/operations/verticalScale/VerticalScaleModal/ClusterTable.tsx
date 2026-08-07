import {Table} from '@/design';
import type {TableColumnsType} from '@/design';

import {ClusterNameLabel} from '@/components/ClusterNameLabel';
import type {ResourceKind} from '@/domain/workload';
import type {FieldState, RowState} from '../rows';
import {toggledKeys} from '../../shared/selection';
import {ResourceCell} from './ResourceCell';

interface ClusterTableProps {
    rows: RowState[];
    onToggleCluster: (key: string) => void;
    onToggleLimit: (key: string, kind: ResourceKind) => void;
    onEdit: (key: string, kind: ResourceKind, side: 'req' | 'lim', patch: Partial<FieldState>) => void;
}

export const ClusterTable = ({ rows, onToggleCluster, onToggleLimit, onEdit }: ClusterTableProps) => {
    const resourceColumn = (kind: ResourceKind, title: string) => ({
        title,
        key: kind,
        width: 226,
        render: (_: unknown, row: RowState) => (
            <ResourceCell
                kind={kind}
                pair={row[kind]}
                selected={row.selected}
                onEdit={(side, patch) => onEdit(row.key, kind, side, patch)}
                onToggleLimit={() => onToggleLimit(row.key, kind)}
            />
        ),
    });

    const columns: TableColumnsType<RowState> = [
        {
            title: '集群',
            key: 'clusterName',
            width: 168,
            render: (_, row) => <ClusterNameLabel clusterName={row.clusterName} clusterId={row.key} />,
            fixed: 'left',
        },
        resourceColumn('cpu', 'CPU'),
        resourceColumn('memory', '内存'),
        resourceColumn('ephemeralStorage', '存储'),
        { title: '最大不可用', dataIndex: 'maxUnavailable', key: 'maxUnavailable', width: 110 },
        { title: '最大可超出', dataIndex: 'maxSurge', key: 'maxSurge', width: 110 },
        {
            title: '可用度',
            key: 'availabilityTarget',
            width: 96,
            render: (_, row) => row.availabilityTarget || '未启用',
        },
    ];

    return (
        <Table<RowState>
            rowKey="key"
            columns={columns}
            dataSource={rows}
            pagination={false}
            scroll={{ y: 320 }}
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
