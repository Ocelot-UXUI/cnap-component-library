import {PlusOutlined} from '@ant-design/icons';
import {Empty, Spin, Table} from 'antd';
import {useMemo, useState} from 'react';

import {ClusterRetryButton, ClusterStateBox, ClusterTableWrapper} from './ClusterDropdown.styles';
import {DimensionFooter, DimensionSearchBox, DropdownPanel} from './dimensionDropdownParts';

import type {AppEnvironmentCluster} from '@/interface/entities/applicationEnvironment';
import type {ColumnsType} from 'antd/es/table';

const footerActions = ['绑定新集群'];

const columns: ColumnsType<AppEnvironmentCluster> = [
    { title: '集群名称', dataIndex: 'clusterName', key: 'clusterName' },
    { title: '类型', dataIndex: 'clusterConnector', key: 'clusterConnector', width: 96 },
    {
        title: '期望副本/可用副本',
        key: 'replicas',
        width: 128,
        render: (_value, record) => `${record.availableReplicas}/${record.desiredReplicas}`,
    },
];

interface ClusterDropdownProps {
    clusters: AppEnvironmentCluster[];
    loading: boolean;
    error: boolean;
    hasEnvironment: boolean;
    value?: string;
    onSelect: (clusterId?: string) => void;
    onRetry: () => void;
}

export function ClusterDropdown({
    clusters,
    loading,
    error,
    hasEnvironment,
    value,
    onSelect,
    onRetry,
}: ClusterDropdownProps) {
    const [keyword, setKeyword] = useState('');

    const filtered = useMemo(() => {
        const normalized = keyword.trim().toLowerCase();
        if (!normalized) {
            return clusters;
        }
        return clusters.filter(item => item.clusterName.toLowerCase().includes(normalized));
    }, [clusters, keyword]);

    return (
        <DropdownPanel onMouseDown={event => event.preventDefault()}>
            <DimensionSearchBox keyword={keyword} placeholder="请输入集群名称" onChange={setKeyword} />
            {renderBody({ hasEnvironment, loading, error, clusters, filtered, value, onSelect, onRetry })}
            <DimensionFooter
                actions={footerActions}
                icon={<PlusOutlined />}
                onAction={action => console.log(`[ClusterDropdown] ${action}`)}
            />
        </DropdownPanel>
    );
}

interface ClusterBodyProps {
    hasEnvironment: boolean;
    loading: boolean;
    error: boolean;
    clusters: AppEnvironmentCluster[];
    filtered: AppEnvironmentCluster[];
    value?: string;
    onSelect: (clusterId?: string) => void;
    onRetry: () => void;
}

function renderBody(props: ClusterBodyProps) {
    const { hasEnvironment, loading, error, clusters, filtered, value, onSelect, onRetry } = props;

    if (!hasEnvironment) {
        return (
            <ClusterStateBox>
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请先选择环境" />
            </ClusterStateBox>
        );
    }
    if (loading) {
        return (
            <ClusterStateBox>
                <Spin />
            </ClusterStateBox>
        );
    }
    if (error) {
        return (
            <ClusterStateBox>
                <span>集群加载失败</span>
                <ClusterRetryButton type="button" onClick={onRetry}>重试</ClusterRetryButton>
            </ClusterStateBox>
        );
    }
    if (clusters.length === 0) {
        return (
            <ClusterStateBox>
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无集群，请绑定新集群" />
            </ClusterStateBox>
        );
    }

    return (
        <ClusterTableWrapper>
            <Table
                columns={columns}
                dataSource={filtered}
                rowKey="clusterId"
                size="small"
                pagination={false}
                locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                rowClassName={record => record.clusterId === value ? 'cluster-row cluster-row-selected' : 'cluster-row'}
                onRow={record => ({
                    onClick: () => onSelect(record.clusterId === value ? undefined : record.clusterId),
                })}
            />
        </ClusterTableWrapper>
    );
}
