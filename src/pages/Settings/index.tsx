/**
 * 用户设置页面
 */
import {Tabs} from '@/components/ai';
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
                <h1 className={pageTitleClass}>{t('pages.settings.title')}</h1>
                <p className={pageDescClass}>{t('pages.settings.description')}</p>
            </div>
            <Tabs defaultActiveKey="profile" items={tabItems} destroyOnHidden />
        </div>
    );
};

export default SettingsPage;
