/* eslint-disable max-lines */
import {css} from '@emotion/css';
import {ComponentType, lazy, LazyExoticComponent, Suspense} from 'react';
import {createBrowserRouter, Navigate} from 'react-router-dom';

import {APP_BASENAME, APP_IS_ONLINE_PRODUCTION} from '@/constants/app';
import {semantic} from '@/constants/colors';
import {typography} from '@/constants/typography';

import {AppLayout} from './AppLayout';
import {ApplicationLayout} from './ApplicationLayout';

// 懒加载页面组件
const HomePage = lazy(() => import('@/pages/Home'));
const AboutPage = lazy(() => import('@/pages/About'));
const ExamplePage = lazy(() => import('@/pages/Example'));
const ApplicationsPage = lazy(() => import('@/pages/Applications'));
const ApplicationOverview = lazy(() => import('@/pages/Applications/Overview'));
const ApplicationSettings = lazy(() => import('@/pages/Applications/Settings'));
const ApplicationRuntimeConfig = lazy(() => import('@/pages/Applications/RuntimeConfig'));
const ApplicationStartupConfig = lazy(() => import('@/pages/Applications/StartupConfig'));
const AccountsPage = lazy(() => import('@/pages/Accounts'));
const DeploymentsPage = lazy(() => import('@/pages/Deployments'));
const EnvironmentsPage = lazy(() => import('@/pages/Environments'));
const ClustersPage = lazy(() => import('@/pages/Clusters'));
const SettingsPage = lazy(() => import('@/pages/Settings'));
const AIDebugPage = lazy(() => import('@/pages/AIDebug'));
const AIChatPage = lazy(() => import('@/pages/AIChat'));
const FavoritesPage = lazy(() => import('@/pages/Favorites'));
const RecentPage = lazy(() => import('@/pages/Recent'));
const PipelinesPage = lazy(() => import('@/pages/Pipelines'));
const ChangelogPage = lazy(() => import('@/pages/Changelog'));
const WorkloadsPage = lazy(() => import('@/pages/Workloads'));
const PodDetailPage = lazy(() => import('@/pages/Workloads/PodDetailPage'));
const ServiceExposurePage = lazy(() => import('@/pages/ServiceExposure'));
const LogsPage = lazy(() => import('@/pages/Logs'));
const TerminalPage = lazy(() => import('@/pages/Terminal'));
const MonitorPage = lazy(() => import('@/pages/Monitor'));
const AppRuntimeConfigPage = lazy(() => import('@/pages/AppRuntimeConfig'));
const AppSettingsPage = lazy(() => import('@/pages/AppSettings'));
const BorderGlowDemoPage = lazy(() => import('@/pages/BorderGlowDemo'));
const ComponentPlaygroundPage = lazy(() => import('@/pages/ComponentPlayground'));

const pageLoadingCss = css`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100%;
    color: ${semantic.text.secondary};
    font-size: ${typography.body.medium.fontSize}px;
`;

// 页面加载组件
const PageLoading = () => (
    <div className={pageLoadingCss}>
        加载中...
    </div>
);

// 包装懒加载组件
const withSuspense = (Component: LazyExoticComponent<ComponentType>) => (
    <Suspense fallback={<PageLoading />}>
        <Component />
    </Suspense>
);

export const router = createBrowserRouter([
    {
        path: '/',
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <Navigate to="applications" replace />,
            },
            {
                path: 'applications',
                children: [
                    {
                        index: true,
                        element: withSuspense(ApplicationsPage),
                    },
                    {
                        path: ':appId',
                        element: <ApplicationLayout />,
                        children: [
                            {
                                index: true,
                                element: <Navigate to="overview" replace />,
                            },
                            {
                                path: 'overview',
                                element: withSuspense(ApplicationOverview),
                            },
                            {
                                path: 'deployments',
                                element: withSuspense(DeploymentsPage),
                            },
                            {
                                path: 'settings',
                                element: withSuspense(ApplicationSettings),
                            },
                            {
                                path: 'runtime-config',
                                element: withSuspense(ApplicationRuntimeConfig),
                            },
                            {
                                path: 'startup-config',
                                element: withSuspense(ApplicationStartupConfig),
                            },
                        ],
                    },
                ],
            },
            {
                path: 'accounts',
                element: withSuspense(AccountsPage),
            },
            {
                path: 'environments',
                element: withSuspense(EnvironmentsPage),
            },
            {
                path: 'clusters',
                element: withSuspense(ClustersPage),
            },
            {
                path: 'settings',
                element: withSuspense(SettingsPage),
            },
            {
                path: 'ai-debug',
                element: withSuspense(AIDebugPage),
            },
            {
                path: 'ai-chat',
                element: withSuspense(AIChatPage),
            },
            {
                path: 'favorites',
                element: withSuspense(FavoritesPage),
            },
            {
                path: 'recent',
                element: withSuspense(RecentPage),
            },
            {
                path: 'pipelines',
                element: withSuspense(PipelinesPage),
            },
            {
                path: 'changelog',
                element: withSuspense(ChangelogPage),
            },
            {
                path: 'workloads',
                element: withSuspense(WorkloadsPage),
            },
            {
                path: 'workloads/pods/:appEnvID/:clusterId/:podName',
                element: withSuspense(PodDetailPage),
            },
            {
                path: 'service-exposure',
                element: withSuspense(ServiceExposurePage),
            },
            {
                path: 'logs',
                element: withSuspense(LogsPage),
            },
            {
                path: 'terminal',
                element: withSuspense(TerminalPage),
            },
            {
                path: 'monitor',
                element: withSuspense(MonitorPage),
            },
            {
                path: 'runtime-config',
                element: withSuspense(AppRuntimeConfigPage),
            },
            {
                path: 'application-settings',
                element: withSuspense(AppSettingsPage),
            },
            {
                path: 'home',
                element: withSuspense(HomePage),
            },
            {
                path: 'about',
                element: withSuspense(AboutPage),
            },
            {
                path: 'example',
                element: withSuspense(ExamplePage),
            },
            {
                path: 'border-glow-demo',
                element: withSuspense(BorderGlowDemoPage),
            },
        ],
    },
    {
        path: '/playground',
        element: APP_IS_ONLINE_PRODUCTION
            ? <Navigate to="/home" replace />
            : withSuspense(ComponentPlaygroundPage),
    },
    {
        path: '*',
        element: <Navigate to="/home" replace />,
    },
], { basename: APP_BASENAME });
