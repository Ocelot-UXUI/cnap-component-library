/**
 * 集群统计卡片组件
 */
import {Cluster} from '@/types/cluster';
import {CloudOutlined, ClusterOutlined, HddOutlined, ShareAltOutlined} from '@ant-design/icons';
import {Card, Col, Row} from '@/design';
import {statsCardContentClass, statsIconClass, statsLabelClass, statsValueClass} from './styles';

interface StatsCardsProps {
    clusters: Cluster[];
    providerCount: number;
}

export const StatsCards = ({ clusters, providerCount }: StatsCardsProps) => {
    const totalNodes = clusters.reduce((sum, c) => sum + c.nodes, 0);
    const sharedCount = clusters.filter(c => c.shared).length;

    const stats = [
        {
            icon: <ClusterOutlined />,
            value: clusters.length,
            label: '总集群数',
        },
        {
            icon: <HddOutlined />,
            value: totalNodes,
            label: '节点总数',
        },
        {
            icon: <CloudOutlined />,
            value: providerCount,
            label: '云提供商',
        },
        {
            icon: <ShareAltOutlined />,
            value: sharedCount,
            label: '共享集群',
        },
    ];

    return (
        <Row gutter={[16, 16]}>
            {stats.map((stat, index) => (
                <Col key={index} xs={24} sm={12} lg={6}>
                    <Card>
                        <div className={statsCardContentClass}>
                            <div className={statsIconClass}>
                                {stat.icon}
                            </div>
                            <div>
                                <div className={statsValueClass}>{stat.value}</div>
                                <div className={statsLabelClass}>{stat.label}</div>
                            </div>
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};
