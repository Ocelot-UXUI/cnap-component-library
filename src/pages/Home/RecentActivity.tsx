/* eslint-disable max-len */
import {applications, clusters, environments, pipelines} from '@/routes';
import {
    AppstoreOutlined,
    CloudOutlined,
    DeploymentUnitOutlined,
    ForkOutlined,
    PlusOutlined,
    RocketOutlined,
    SettingOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {Button, Card, Col, Row, Timeline, Typography} from '@/design';
import {useNavigate} from 'react-router-dom';
import {activities} from './data';
import {dashboardCardClass, quickActionButtonClass} from './styles';
import type {ActivityType} from './data';

const { Text } = Typography;

const activityDotColor: Record<ActivityType, string> = {
    deployment: 'blue',
    cluster: 'cyan',
    config: 'orange',
    permission: 'purple',
    application: 'green',
    environment: 'geekblue',
};

const activityIcon: Record<ActivityType, React.ReactNode> = {
    deployment: <RocketOutlined />,
    cluster: <CloudOutlined />,
    config: <SettingOutlined />,
    permission: <UserOutlined />,
    application: <AppstoreOutlined />,
    environment: <ForkOutlined />,
};

const quickActions = [
    {
        label: '新建应用',
        icon: <PlusOutlined />,
        path: applications.toPath(),
        aiAction: 'createApplication',
        aiEntity: 'application',
    },
    {
        label: '发起部署',
        icon: <RocketOutlined />,
        path: pipelines.toPath(),
        aiAction: 'deployApplication',
        aiEntity: 'application',
    },
    {
        label: '新建环境',
        icon: <ForkOutlined />,
        path: environments.toPath(),
        aiAction: 'createEnvironment',
        aiEntity: 'environment',
    },
    {
        label: '集群管理',
        icon: <DeploymentUnitOutlined />,
        path: clusters.toPath(),
        aiAction: 'viewCluster',
        aiEntity: 'cluster',
    },
];

export const RecentActivity = () => {
    const navigate = useNavigate();

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
                <Card
                    className={dashboardCardClass}
                    title="最近动态"
                    extra={<Button type="link" size="small">查看全部</Button>}
                >
                    <Timeline
                        items={activities.map(activity => ({
                            dot: activityIcon[activity.type],
                            color: activityDotColor[activity.type],
                            children: (
                                <div>
                                    <Text>{activity.message}</Text>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {activity.user} · {activity.time}
                                        </Text>
                                    </div>
                                </div>
                            ),
                        }))}
                    />
                </Card>
            </Col>
            <Col xs={24} lg={8}>
                <Card className={dashboardCardClass} title="快捷操作">
                    <Row gutter={[8, 8]}>
                        {quickActions.map(action => (
                            <Col span={12} key={action.label}>
                                <Button
                                    block
                                    icon={action.icon}
                                    className={quickActionButtonClass}
                                    onClick={() => navigate(action.path)}
                                    data-ai-action={action.aiAction as never}
                                    data-ai-entity={action.aiEntity as never}
                                >
                                    {action.label}
                                </Button>
                            </Col>
                        ))}
                    </Row>
                </Card>
                <Card
                    className={dashboardCardClass}
                    title="AI 洞察"
                    style={{ marginTop: 16 }}
                >
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        payment-service 在过去一小时内错误率持续升高，建议回滚至 v3.1.2 或排查近期部署变更。
                    </Text>
                    <div style={{ marginTop: 8 }}>
                        <Button type="primary" size="small">查看详情</Button>
                    </div>
                </Card>
            </Col>
        </Row>
    );
};
