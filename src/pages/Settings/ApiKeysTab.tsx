/* eslint-disable max-len */
/**
 * API 密钥管理 Tab
 */
import {APIKey} from '@/types/settings';
import {
    CheckOutlined,
    CopyOutlined,
    DeleteOutlined,
    EyeInvisibleOutlined,
    EyeOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import {Button, Card, message, Space} from 'antd';
import {useState} from 'react';
import {
    apiKeyActionsClass,
    apiKeyCardClass,
    apiKeyCodeClass,
    apiKeyMetaClass,
    apiKeyNameClass,
    settingItemClass,
    settingLabelClass,
} from './styles';

const mockApiKeys: APIKey[] = [
    {
        id: '1',
        name: 'Production API Key',
        key: 'cnap_prod_a1b2c3d4e5f6',
        created: 'Dec 15, 2024',
        lastUsed: '2 hours ago',
    },
    {
        id: '2',
        name: 'Development API Key',
        key: 'cnap_dev_x7y8z9w0v1u2',
        created: 'Jan 3, 2025',
        lastUsed: '5 minutes ago',
    },
    { id: '3', name: 'CI/CD Integration', key: 'cnap_ci_m3n4o5p6q7r8', created: 'Jan 20, 2025', lastUsed: '1 day ago' },
];

export const ApiKeysTab = () => {
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [copied, setCopied] = useState<string | null>(null);

    const toggleKeyVisibility = (id: string) => {
        setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        message.success('已复制到剪贴板');
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <Card
            title="API 密钥"
            extra={
                <Button type="primary" icon={<PlusOutlined />}>
                    生成密钥
                </Button>
            }
        >
            <div>
                {mockApiKeys.map(apiKey => (
                    <Card key={apiKey.id} className={apiKeyCardClass} size="small">
                        <div className={settingItemClass}>
                            <div className={settingLabelClass}>
                                <div className={apiKeyNameClass}>{apiKey.name}</div>
                                <div className={apiKeyActionsClass}>
                                    <code className={apiKeyCodeClass}>
                                        {showKeys[apiKey.id] ? apiKey.key : '•'.repeat(24)}
                                    </code>
                                    <Space>
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={showKeys[apiKey.id] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                            onClick={() => toggleKeyVisibility(apiKey.id)}
                                        />
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={copied === apiKey.id ? <CheckOutlined /> : <CopyOutlined />}
                                            onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                                        />
                                    </Space>
                                </div>
                                <div className={apiKeyMetaClass}>
                                    创建于 {apiKey.created} • 最后使用 {apiKey.lastUsed}
                                </div>
                            </div>
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </div>
                    </Card>
                ))}
            </div>
        </Card>
    );
};
