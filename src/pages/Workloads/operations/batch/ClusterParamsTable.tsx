import {Alert, Input, Spin, Table} from 'antd';
import type {TableColumnsType} from 'antd';

import {ClusterNameLabel} from '@/components/ClusterNameLabel';

import {isMaxUnavailableValid} from '../restart/rows';
import type {ClusterParam} from './useClusterParams';

interface ClusterParamsTableProps {
    params: ClusterParam[];
    loading: boolean;
    error: boolean;
    /** 可编辑最大不可用（批量重启）；否则只读（批量删除/强删） */
    editable?: boolean;
    values?: Record<string, string>;
    onChange?: (clusterId: string, value: string) => void;
}

export const ClusterParamsTable = ({
    params,
    loading,
    error,
    editable = false,
    values = {},
    onChange,
}: ClusterParamsTableProps) => {
    if (loading) {
        return <Spin />;
    }
    if (error) {
        return <Alert type="error" message="集群参数加载失败" />;
    }

    const columns: TableColumnsType<ClusterParam> = [
        {
            title: '集群',
            key: 'clusterName',
            width: 280,
            render: (_, row) => <ClusterNameLabel clusterName={row.clusterName} clusterId={row.clusterId} />,
        },
        {
            title: '最大不可用',
            key: 'maxUnavailable',
            width: 160,
            render: (_, row) =>
                editable
                    ? (
                        <Input
                            style={{ width: 80 }}
                            suffix="%"
                            value={values[row.clusterId] ?? row.maxUnavailable}
                            status={isMaxUnavailableValid(values[row.clusterId] ?? row.maxUnavailable)
                                ? undefined
                                : 'error'}
                            onChange={event => onChange?.(row.clusterId, event.target.value)}
                        />
                    )
                    : `${row.maxUnavailable}%`,
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
        <Table<ClusterParam>
            rowKey="clusterId"
            columns={columns}
            dataSource={params}
            pagination={false}
            scroll={{ y: 200 }}
        />
    );
};
