import {navigationActions, useNavigationSnapshot} from '@/contexts/NavigationContext';
import {
    applicationDeployments,
    applicationOverview,
    applicationRuntimeConfig,
    applications,
    applicationSettings,
    applicationStartupConfig,
} from '@/routes';
import {ArrowLeftOutlined} from '@ant-design/icons';
import {css} from '@emotion/css';
import {Button, Space, Tabs} from 'antd';
import {useEffect, useRef} from 'react';
import {Outlet, useLocation, useNavigate, useParams} from 'react-router-dom';

const headerClass = css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
`;

const titleClass = css`
    font-size: 20px;
    font-weight: 600;
    margin: 0;
`;

type ApplicationTabKey = 'overview' | 'deployments' | 'runtime-config' | 'startup-config' | 'settings';

const tabRouteMap: Record<ApplicationTabKey, (appId: string) => string> = {
    overview: (appId) => applicationOverview.toPath({ appId }),
    deployments: (appId) => applicationDeployments.toPath({ appId }),
    'runtime-config': (appId) => applicationRuntimeConfig.toPath({ appId }),
    'startup-config': (appId) => applicationStartupConfig.toPath({ appId }),
    settings: (appId) => applicationSettings.toPath({ appId }),
};

const tabs = [
    { key: 'overview', label: '概览' },
    { key: 'deployments', label: '部署管理' },
    { key: 'runtime-config', label: '运行配置' },
    { key: 'startup-config', label: '启动配置' },
    { key: 'settings', label: '设置' },
];

function getActiveTab(pathname: string): ApplicationTabKey {
    const tabKey = pathname.split('/').pop();
    return tabKey && tabKey in tabRouteMap ? tabKey as ApplicationTabKey : 'overview';
}

export function ApplicationLayout() {
    const { appId } = useParams<{ appId: string; }>();
    const { applicationId, availableApplications } = useNavigationSnapshot();
    const { syncRouteContext } = navigationActions;
    const navigate = useNavigate();
    const location = useLocation();
    const activeTab = getActiveTab(location.pathname);
    const routeAppId = appId ?? undefined;
    const activeApplication = availableApplications.find(item => item.id === routeAppId);
    const routeSyncedAppId = useRef<string | undefined>(undefined);
    const routeSyncPending = useRef(false);

    useEffect(() => {
        if (routeAppId && String(routeAppId) !== applicationId && routeAppId !== routeSyncedAppId.current) {
            routeSyncedAppId.current = routeAppId;
            routeSyncPending.current = true;
            syncRouteContext({ applicationId: String(routeAppId) });
            return;
        }
        if (routeAppId && String(routeAppId) === applicationId) {
            routeSyncedAppId.current = routeAppId;
            routeSyncPending.current = false;
        }
    }, [routeAppId, applicationId, syncRouteContext]);

    useEffect(() => {
        if (routeSyncPending.current) {
            return;
        }
        if (applicationId && routeAppId && applicationId !== routeAppId) {
            routeSyncedAppId.current = applicationId;
            navigate(tabRouteMap[activeTab](applicationId), { replace: true });
        }
    }, [activeTab, routeAppId, applicationId, navigate]);

    const handleTabChange = (key: string) => {
        const route = tabRouteMap[key as ApplicationTabKey];
        const targetAppId = applicationId ?? routeAppId;
        if (route && targetAppId) {
            navigate(route(String(targetAppId)));
        }
    };

    const handleBack = () => {
        navigate(applications.toPath());
    };

    return (
        <div>
            <div className={headerClass}>
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>返回应用列表</Button>
                    <h2 className={titleClass}>{activeApplication?.name ?? `应用 ${appId ?? ''}`}</h2>
                </Space>
            </div>
            <Tabs activeKey={activeTab} items={tabs} onChange={handleTabChange} />
            <div style={{ marginTop: 16 }}>
                <Outlet />
            </div>
        </div>
    );
}
