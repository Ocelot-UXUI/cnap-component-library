import {ClockCircleOutlined, LinkOutlined, MoreOutlined} from '@ant-design/icons';
import {css} from '@emotion/css';
import {Badge, Button, Card, Col, List, Row, Space, Tag, theme, Typography} from 'antd';
import {favoriteApps, recentItems} from './data';
import type {AppStatus} from './data';

const { Text } = Typography;

const statusColor: Record<AppStatus, string> = {
    healthy: 'green',
    warning: 'orange',
    error: 'red',
};

const appItemClass = css`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    &:not(:last-child) { border-bottom: 1px solid; }
`;

export const FavoriteApps = () => {
    const { token } = theme.useToken();

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
                <Card
                    title="收藏的应用"
                    extra={
                        <Button type="link" size="small" data-ai-action="manageFavorites" data-ai-entity="application">
                            管理
                        </Button>
                    }
                >
                    {favoriteApps.map(app => (
                        <div
                            key={app.id}
                            className={appItemClass}
                            style={{ borderBottomColor: token.colorBorderSecondary }}
                        >
                            <Badge color={statusColor[app.status]} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <Space size={6}>
                                    <Text strong>{app.name}</Text>
                                    <Tag>{app.environment}</Tag>
                                </Space>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {app.account} · {app.lastDeployed}
                                    </Text>
                                </div>
                            </div>
                            <Space size={4}>
                                {app.url && (
                                    <Button
                                        size="small"
                                        icon={<LinkOutlined />}
                                        type="text"
                                        data-ai-action="openAppUrl"
                                        data-ai-entity={`application:${app.id}`}
                                    />
                                )}
                                <Button
                                    size="small"
                                    icon={<MoreOutlined />}
                                    type="text"
                                    data-ai-action="openAppMenu"
                                    data-ai-entity={`application:${app.id}`}
                                />
                            </Space>
                        </div>
                    ))}
                </Card>
            </Col>
            <Col xs={24} lg={8}>
                <Card title="最近访问">
                    <List
                        dataSource={recentItems}
                        renderItem={item => (
                            <List.Item style={{ padding: '8px 0' }}>
                                <List.Item.Meta
                                    avatar={
                                        <ClockCircleOutlined
                                            style={{ color: token.colorTextTertiary, marginTop: 4, fontSize: 16 }}
                                        />
                                    }
                                    title={<Text strong style={{ fontSize: 13 }}>{item.name}</Text>}
                                    description={
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {item.action} · {item.time}
                                            <Tag style={{ marginLeft: 6 }}>{item.account}</Tag>
                                        </Text>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </Card>
            </Col>
        </Row>
    );
};
