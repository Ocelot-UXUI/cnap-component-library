import {AlertOutlined, LoadingOutlined, PauseCircleOutlined} from '@ant-design/icons';
import {css} from '@emotion/css';
import {Alert, Button, Card, Progress, Space, Tag, theme, Typography} from '@/design';
import {deployments, userAlerts} from './data';
import {dashboardCardClass, dashboardSectionClass} from './styles';

const { Text } = Typography;

const deployItemClass = css`
    padding: 10px 0;
    &:not(:last-child) { border-bottom: 1px solid; }
`;

const deployHeaderClass = css`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    flex-wrap: wrap;
`;

const deployFooterClass = css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 4px;
`;

export const AlertsSection = () => {
    const { token } = theme.useToken();

    return (
        <Space direction="vertical" className={dashboardSectionClass} size={16}>
            {userAlerts.length > 0 && (
                <Card
                    className={dashboardCardClass}
                    title={
                        <>
                            <AlertOutlined style={{ color: token.colorError, marginRight: 6 }} />活跃告警
                        </>
                    }
                    size="small"
                >
                    <Space direction="vertical" style={{ width: '100%' }} size={8}>
                        {userAlerts.map(alert => (
                            <Alert
                                key={alert.id}
                                type={alert.type}
                                message={
                                    <>
                                        <Text strong>{alert.app}</Text> — {alert.message}
                                    </>
                                }
                                description={<Text type="secondary" style={{ fontSize: 12 }}>{alert.time}</Text>}
                                action={<Button size="small" danger>立即排查</Button>}
                                showIcon
                            />
                        ))}
                    </Space>
                </Card>
            )}
            {deployments.length > 0 && (
                <Card
                    className={dashboardCardClass}
                    title="进行中的部署"
                    size="small"
                >
                    {deployments.map(dep => (
                        <div
                            key={dep.id}
                            className={deployItemClass}
                            style={{ borderBottomColor: token.colorBorderSecondary }}
                        >
                            <div className={deployHeaderClass}>
                                {dep.status === 'in_progress'
                                    ? <LoadingOutlined style={{ color: token.colorPrimary }} />
                                    : <PauseCircleOutlined style={{ color: token.colorWarning }} />}
                                <Text strong>{dep.app}</Text>
                                <Tag color="blue">{dep.environment}</Tag>
                                <Tag>{dep.strategy}</Tag>
                                <Text type="secondary" style={{ marginLeft: 'auto', fontSize: 12 }}>
                                    {dep.cluster} · {dep.version}
                                </Text>
                            </div>
                            <Progress
                                percent={dep.progress}
                                size="small"
                                status={dep.status === 'paused' ? 'exception' : 'active'}
                            />
                            <div className={deployFooterClass}>
                                <Text type="secondary" style={{ fontSize: 12 }}>{dep.currentStep}</Text>
                                <Space size={4}>
                                    {dep.status === 'paused'
                                        ? <Button size="small" type="primary">继续</Button>
                                        : <Button size="small">暂停</Button>}
                                    <Button size="small" danger>取消</Button>
                                </Space>
                            </div>
                        </div>
                    ))}
                </Card>
            )}
        </Space>
    );
};
