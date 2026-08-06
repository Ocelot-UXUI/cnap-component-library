import {Navigate} from 'react-router-dom';

import {
    applications,
    appRuntimeConfig,
    appSettings,
    logs,
    monitor,
    serviceExposure,
    terminal,
    workloads,
} from '@/routes';
import {accounts, clusters, environments} from '@/routes';
import {changelog, pipelines, settings} from '@/routes';
import {favorites, recent} from '@/routes';

import {ApplicationLayout} from './ApplicationLayout';
import * as P from './lazyPages';
import {toPattern} from './routePattern';
import {withSuspense} from './withSuspense';

import type {WorkspaceKey} from '@/navigation/types';
import type {RouteObject} from 'react-router-dom';

const applicationRoutes: RouteObject[] = [
    {path: toPattern(applications.path), element: withSuspense(P.ApplicationsPage)},
    {
        path: toPattern(applications.path) + '/:appId',
        element: <ApplicationLayout />,
        children: [
            {index: true, element: <Navigate to="overview" replace />},
            {path: 'overview', element: withSuspense(P.ApplicationOverview)},
            {path: 'deployments', element: withSuspense(P.DeploymentsPage)},
            {path: 'settings', element: withSuspense(P.ApplicationSettings)},
            {path: 'runtime-config', element: withSuspense(P.ApplicationRuntimeConfig)},
            {path: 'startup-config', element: withSuspense(P.ApplicationStartupConfig)},
        ],
    },
    {path: toPattern(workloads.path), element: withSuspense(P.WorkloadsPage)},
    {path: 'workloads/pods/:appEnvID/:clusterId/:podName', element: withSuspense(P.PodDetailPage)},
    {path: toPattern(serviceExposure.path), element: withSuspense(P.ServiceExposurePage)},
    {path: toPattern(logs.path), element: withSuspense(P.LogsPage)},
    {path: toPattern(terminal.path), element: withSuspense(P.TerminalPage)},
    {path: toPattern(monitor.path), element: withSuspense(P.MonitorPage)},
    {path: toPattern(appRuntimeConfig.path), element: withSuspense(P.AppRuntimeConfigPage)},
    {path: toPattern(appSettings.path), element: withSuspense(P.AppSettingsPage)},
];

const homeRoutes: RouteObject[] = [
    {path: 'home', element: withSuspense(P.HomePage)},
    {path: toPattern(favorites.path), element: withSuspense(P.FavoritesPage)},
    {path: toPattern(recent.path), element: withSuspense(P.RecentPage)},
    {path: 'about', element: withSuspense(P.AboutPage)},
    {path: 'example', element: withSuspense(P.ExamplePage)},
    {path: 'border-glow-demo', element: withSuspense(P.BorderGlowDemoPage)},
];

const supportRoutes: RouteObject[] = [
    {path: 'ai-chat', element: withSuspense(P.AIChatPage)},
    {path: 'ai-debug', element: withSuspense(P.AIDebugPage)},
    {path: toPattern(settings.path), element: withSuspense(P.SettingsPage)},
    {path: toPattern(changelog.path), element: withSuspense(P.ChangelogPage)},
];

export const WORKSPACE_ROUTES: Record<WorkspaceKey, RouteObject[]> = {
    home: homeRoutes,
    applications: applicationRoutes,
    environments: [{path: toPattern(environments.path), element: withSuspense(P.EnvironmentsPage)}],
    changes: [{path: toPattern(pipelines.path), element: withSuspense(P.PipelinesPage)}],
    resources: [{path: toPattern(clusters.path), element: withSuspense(P.ClustersPage)}],
    accounts: [{path: toPattern(accounts.path), element: withSuspense(P.AccountsPage)}],
    support: supportRoutes,
};

/** full-bleed（无内边距）路径，按工作区归类。 */
export const FULL_BLEED_PATHS = new Set(['/ai-chat']);
