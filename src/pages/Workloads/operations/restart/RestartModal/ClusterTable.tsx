import {Checkbox, Input, Table} from 'antd';
import type {TableColumnsType} from 'antd';

import {isMaxUnavailableValid} from '../rows';
import type {RestartRow} from '../rows';

interface ClusterTableProps {
    rows: RestartRow[];
    onToggleCluster: (key: string) => void;
    onEditMaxUnavailable: (key: string, value: string) => void;
}

export const ClusterTable = ({ rows, onToggleCluster, onEditMaxUnavailable }: ClusterTableProps) => {
    const columns: TableColumnsType<RestartRow> = [
        {
            title: '',
            key: 'select',
            width: 40,
            render: (_, row) => <Checkbox checked={row.selected} onChange={() => onToggleCluster(row.key)} />,
        },
        { title: '集群', dataIndex: 'clusterName', key: 'clusterName', width: 240 },
        {
            title: '最大不可用',
            key: 'maxUnavailable',
            width: 160,
            render: (_, row) => (
                <Input
                    style={{ width: 80 }}
                    value={row.maxUnavailable}
                    suffix="%"
                    status={isMaxUnavailableValid(row.maxUnavailable) ? undefined : 'error'}
                    onChange={event => onEditMaxUnavailable(row.key, event.target.value)}
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
        />
    );
};
