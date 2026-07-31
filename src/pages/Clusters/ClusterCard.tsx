/* eslint-disable max-lines */
/**
 * 集群卡片组件
 */
import {Dropdown} from '@/components/ai';
import {CloudProvider, Cluster} from '@/types/cluster';
import {
    CheckCircleOutlined,
    CloudOutlined,
    DeleteOutlined,
    EyeOutlined,
    KeyOutlined,
    MoreOutlined,
    ShareAltOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import {Card, Progress, Space, Tag} from 'antd';
import type {MenuProps} from 'antd';
import {
    appCountClass,
    clusterActionsIconClass,
    clusterCardClass,
    clusterHeaderClass,
    clusterInfoClass,
    clusterNameClass,
    clusterNameTextClass,
    clusterRegionClass,
    fullWidthClass,
    gpuItemClass,
    gpuSectionClass,
    providerIconClass,
    resourceLabelClass,
    resourceTextClass,
    resourceValueClass,
    statusHealthyClass,
    statusWarningClass,
} from './styles';

interface ClusterCardProps {
    cluster: Cluster;
}

const getProviderColor = (provider: CloudProvider): string => {
    const colors = {
        aws: '#FF9900',
        gcp: '#4285F4',
        baidu: '#DE3F41',
    };
    return colors[provider];
};

const getProgressStatus = (percent: number): 'success' | 'normal' | 'exception' => {
    if (percent > 80) {
        return 'exception';
    }
    if (percent > 60) {
        return 'normal';
    }
    return 'success';
};

export const ClusterCard = ({ cluster }: ClusterCardProps) => {
    const menuItems: MenuProps['items'] = [
        {
            key: 'view',
            icon: <EyeOutlined />,
            label: (
                <span data-ai-action="viewCluster" data-ai-entity={`cluster:${cluster.id}`}>
                    查看详情
                </span>
            ),
        },
        {
            key: 'credentials',
            icon: <KeyOutlined />,
            label: (
                <span data-ai-action="manageCredentials" data-ai-entity={`cluster:${cluster.id}`}>
                    管理凭证
                </span>
            ),
        },
        {
            key: 'share',
            icon: <ShareAltOutlined />,
            label: (
                <span data-ai-action="shareCluster" data-ai-entity={`cluster:${cluster.id}`}>
                    共享集群
                </span>
            ),
        },
        {
            type: 'divider',
        },
        {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: (
                <span data-ai-action="deleteCluster" data-ai-entity={`cluster:${cluster.id}`}>
                    删除
                </span>
            ),
            danger: true,
        },
    ];

    return (
        <Card className={clusterCardClass}>
            <div className={clusterHeaderClass}>
                <div className={clusterInfoClass}>
                    <div className={providerIconClass(getProviderColor(cluster.provider))}>
                        <CloudOutlined />
                    </div>
                    <div>
                        <div className={clusterNameClass}>
                            <span className={clusterNameTextClass}>{cluster.name}</span>
                            {cluster.status === 'healthy'
                                ? <CheckCircleOutlined className={statusHealthyClass} />
                                : <WarningOutlined className={statusWarningClass} />}
                        </div>
                        <div className={clusterRegionClass}>
                            {cluster.region}
                        </div>
                    </div>
                </div>
                <Dropdown
                    menu={{ items: menuItems }}
                    placement="bottomRight"
                    data-ai-action="openClusterMenu"
                    data-ai-entity={`cluster:${cluster.id}`}
                >
                    <MoreOutlined className={clusterActionsIconClass} />
                </Dropdown>
            </div>

            <Space direction="vertical" className={fullWidthClass} size="middle">
                <div>
                    <Space size="small" wrap>
                        <Tag>K8s {cluster.version}</Tag>
                        <Tag>{cluster.nodes} 节点</Tag>
                        <Tag>
                            {cluster.pods.running}/{cluster.pods.total} Pods
                        </Tag>
                        {cluster.shared && <Tag color="blue">共享</Tag>}
                    </Space>
                </div>

                <div>
                    <div className={resourceLabelClass}>
                        <span className={resourceTextClass}>CPU 使用率</span>
                        <span className={resourceValueClass}>{cluster.cpu.used}%</span>
                    </div>
                    <Progress
                        percent={cluster.cpu.used}
                        status={getProgressStatus(cluster.cpu.used)}
                        showInfo={false}
                        strokeLinecap="round"
                    />
                </div>

                <div>
                    <div className={resourceLabelClass}>
                        <span className={resourceTextClass}>内存使用率</span>
                        <span className={resourceValueClass}>{cluster.memory.used}%</span>
                    </div>
                    <Progress
                        percent={cluster.memory.used}
                        status={getProgressStatus(cluster.memory.used)}
                        showInfo={false}
                        strokeLinecap="round"
                    />
                </div>

                {cluster.gpus && cluster.gpus.length > 0 && (
                    <div>
                        <div className={gpuSectionClass}>GPU</div>
                        {cluster.gpus.map((gpu, index) => (
                            <div key={index} className={gpuItemClass}>
                                {gpu.type}: {gpu.used}/{gpu.total}
                            </div>
                        ))}
                    </div>
                )}

                <div className={appCountClass}>
                    {cluster.applications} 个应用
                </div>
            </Space>
        </Card>
    );
};
