/**
 * 用户设置页面
 */
import {Tabs} from '@/components/ai';
import {Typography} from '@/design';
import {useTranslation} from '@/utils/i18n';
import {
    ApiOutlined,
    BellOutlined,
    KeyOutlined,
    SafetyOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {ApiKeysTab} from './ApiKeysTab';
import {NotificationsTab} from './NotificationsTab';
import {ProfileTab} from './ProfileTab';
import {SecurityTab} from './SecurityTab';
import {pageDescClass, pageHeaderClass, pageTitleClass} from './styles';
import {WebhooksTab} from './WebhooksTab';

const SettingsPage = () => {
    const { t } = useTranslation();

    const tabItems = [
        {
            key: 'profile',
            label: (
                <span>
                    <UserOutlined />
                    {t('pages.settings.profile')}
                </span>
            ),
            children: <ProfileTab />,
        },
        {
            key: 'notifications',
            label: (
                <span>
                    <BellOutlined />
                    {t('pages.settings.notifications')}
                </span>
            ),
            children: <NotificationsTab />,
        },
        {
            key: 'security',
            label: (
                <span>
                    <SafetyOutlined />
                    {t('pages.settings.security')}
                </span>
            ),
            children: <SecurityTab />,
        },
        {
            key: 'api',
            label: (
                <span>
                    <KeyOutlined />
                    {t('settings.apiKeys')}
                </span>
            ),
            children: <ApiKeysTab />,
        },
        {
            key: 'webhooks',
            label: (
                <span>
                    <ApiOutlined />
                    {t('settings.webhooks')}
                </span>
            ),
            children: <WebhooksTab />,
        },
    ];

    return (
        <div>
            <div className={pageHeaderClass}>
                <Typography.Title level={2} className={pageTitleClass}>
                    {t('pages.settings.title')}
                </Typography.Title>
                <Typography.Text type="secondary" className={pageDescClass}>
                    {t('pages.settings.description')}
                </Typography.Text>
            </div>
            <Tabs defaultActiveKey="profile" items={tabItems} destroyOnHidden />
        </div>
    );
};

export default SettingsPage;
