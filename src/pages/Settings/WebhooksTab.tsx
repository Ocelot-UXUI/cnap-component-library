/**
 * Webhooks 管理 Tab
 */
import {Webhook} from '@/types/settings';
import {DeleteOutlined, PlusOutlined} from '@ant-design/icons';
import {Badge, Button, Card, Space, Tag} from 'antd';
import {
    apiKeyCardClass,
    sessionFlexClass,
    webhookActionsClass,
    webhookUrlClass,
} from './styles';

const mockWebhooks: Webhook[] = [
    {
        id: '1',
        url: 'https://api.slack.com/webhooks/...',
        events: ['deployment.success', 'deployment.failed'],
        status: 'active',
    },
    { id: '2', url: 'https://hooks.pagerduty.com/...', events: ['alert.critical'], status: 'active' },
];

export const WebhooksTab = () => {
    return (
        <Card
            title="Webhooks"
            extra={
                <Button type="primary" icon={<PlusOutlined />}>
                    添加 Webhook
                </Button>
            }
        >
            <div>
                {mockWebhooks.map(webhook => (
                    <Card key={webhook.id} className={apiKeyCardClass} size="small">
                        <div className={sessionFlexClass}>
                            <div>
                                <div className={webhookActionsClass}>
                                    <code className={webhookUrlClass}>{webhook.url}</code>
                                    <Badge
                                        status={webhook.status === 'active' ? 'success' : 'default'}
                                        text={webhook.status === 'active' ? '活跃' : '非活跃'}
                                    />
                                </div>
                                <Space wrap>
                                    {webhook.events.map(event => <Tag key={event}>{event}</Tag>)}
                                </Space>
                            </div>
                            <Space>
                                <Button type="default" size="small">测试</Button>
                                <Button type="text" danger icon={<DeleteOutlined />} />
                            </Space>
                        </div>
                    </Card>
                ))}
            </div>
        </Card>
    );
};
