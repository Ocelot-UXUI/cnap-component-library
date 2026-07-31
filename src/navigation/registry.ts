/* eslint-disable max-lines */
import {
    accounts,
    applicationDeployments,
    applicationOverview,
    applicationRuntimeConfig,
    applications,
    applicationSettings,
    applicationStartupConfig,
    appRuntimeConfig,
    appSettings,
    changelog,
    clusters,
    environments,
    favorites,
    logs,
    monitor,
    pipelines,
    recent,
    serviceExposure,
    settings,
    terminal,
    workloads,
} from '@/routes';
import {route} from '@/routes';
import type {NavigationNode, WorkspaceDefinition} from './types';

const homeRoute = route('/home', '个人 Dashboard');
const aiChatRoute = route('/ai-chat', 'AI 助手');
const aiDebugRoute = route('/ai-debug', 'AI 调试');

export const workspaces: WorkspaceDefinition[] = [
    {
        key: 'home',
        label: '主页',
        defaultNodeKey: 'home.dashboard',

        agentDescription: '个人 Dashboard 与访问记录',
    },
    {
        key: 'applications',
        label: '应用',
        defaultNodeKey: 'applications.workloads',

        agentDescription: '应用管理与应用级能力',
    },
    {
        key: 'environments',
        label: '环境',
        defaultNodeKey: 'environments.list',

        agentDescription: '环境管理入口',
    },
    {
        key: 'changes',
        label: '变更',
        defaultNodeKey: 'changes.pipelines',

        agentDescription: '部署与流水线入口',
    },
    {
        key: 'resources',
        label: '资源',
        defaultNodeKey: 'resources.clusters',

        agentDescription: '基础资源管理入口',
    },
    {
        key: 'accounts',
        label: '账户',
        defaultNodeKey: 'accounts.list',

        agentDescription: '账号与权限管理入口',
    },
    {
        key: 'support',
        label: '辅助',
        defaultNodeKey: 'support.aiChat',

        agentDescription: 'AI 助手和系统辅助入口',
    },
];

export const navigationNodes: NavigationNode[] = [
    {
        key: 'home.dashboard',
        level: 'secondary',
        route: homeRoute,
        label: '仪表板',
        workspaceKey: 'home',

        agentDescription: '查看个人 Dashboard',
        visibleInSidebar: true,
    },
    {
        key: 'home.favorites',
        level: 'child',
        route: favorites,
        label: '收藏',
        workspaceKey: 'home',
        parentKey: 'home.dashboard',

        agentDescription: '查看收藏页面',
        visibleInSidebar: true,
    },
    {
        key: 'home.recent',
        level: 'child',
        route: recent,
        label: '最近访问',
        workspaceKey: 'home',
        parentKey: 'home.dashboard',

        agentDescription: '查看最近访问页面',
        visibleInSidebar: true,
    },
    {
        key: 'applications.list',
        level: 'secondary',
        route: applications,
        label: '应用列表',
        workspaceKey: 'applications',
        contextRequirements: { accountId: true },

        agentDescription: '查看应用列表',
    },
    {
        key: 'applications.workloads',
        level: 'secondary',
        route: workloads,
        label: '工作负载',
        workspaceKey: 'applications',
        contextRequirements: { accountId: true, applicationId: true, environmentId: true, clusterId: true },

        agentDescription: '查看工作负载列表',
        visibleInSidebar: true,
    },
    {
        key: 'applications.serviceExposure',
        level: 'secondary',
        route: serviceExposure,
        label: '服务暴露',
        workspaceKey: 'applications',
        contextRequirements: { accountId: true },

        agentDescription: '查看服务暴露列表',
        visibleInSidebar: true,
    },
    {
        key: 'applications.logs',
        level: 'secondary',
        route: logs,
        label: '日志',
        workspaceKey: 'applications',
        contextRequirements: { accountId: true },

        agentDescription: '查看应用日志',
        visibleInSidebar: true,
    },
    {
        key: 'applications.terminal',
        level: 'secondary',
        route: terminal,
        label: '终端',
        workspaceKey: 'applications',
        contextRequirements: { accountId: true },

        agentDescription: '打开应用终端',
        visibleInSidebar: true,
    },
    {
        key: 'applications.monitor',
        level: 'secondary',
        route: monitor,
        label: '监控',
        workspaceKey: 'applications',
        contextRequirements: { accountId: true },

        agentDescription: '查看应用监控',
        visibleInSidebar: true,
    },
    {
        key: 'applications.appRuntimeConfig',
        level: 'secondary',
        route: appRuntimeConfig,
        label: '运行配置',
        workspaceKey: 'applications',
        contextRequirements: { accountId: true },

        agentDescription: '查看运行配置',
        visibleInSidebar: true,
    },
    {
        key: 'applications.appSettings',
        level: 'secondary',
        route: appSettings,
        label: '应用设置',
        workspaceKey: 'applications',
        contextRequirements: { accountId: true },

        agentDescription: '查看应用设置',
        visibleInSidebar: true,
    },
    {
        key: 'applications.overview',
        level: 'child',
        route: applicationOverview,
        label: '应用概览',
        workspaceKey: 'applications',
        parentKey: 'applications.list',
        contextRequirements: { accountId: true, applicationId: true },

        agentDescription: '查看应用概览详情',
    },
    {
        key: 'applications.deployments',
        level: 'child',
        route: applicationDeployments,
        label: '部署管理',
        workspaceKey: 'applications',
        parentKey: 'applications.list',
        contextRequirements: { accountId: true, applicationId: true },

        agentDescription: '查看应用部署管理',
    },
    {
        key: 'applications.runtimeConfig',
        level: 'child',
        route: applicationRuntimeConfig,
        label: '运行配置',
        workspaceKey: 'applications',
        parentKey: 'applications.list',
        contextRequirements: { accountId: true, applicationId: true },

        agentDescription: '查看应用运行配置',
    },
    {
        key: 'applications.startupConfig',
        level: 'child',
        route: applicationStartupConfig,
        label: '启动配置',
        workspaceKey: 'applications',
        parentKey: 'applications.list',
        contextRequirements: { accountId: true, applicationId: true },

        agentDescription: '查看应用启动配置',
    },
    {
        key: 'applications.settings',
        level: 'child',
        route: applicationSettings,
        label: '应用设置',
        workspaceKey: 'applications',
        parentKey: 'applications.list',
        contextRequirements: { accountId: true, applicationId: true },

        agentDescription: '查看应用设置',
    },
    {
        key: 'environments.list',
        level: 'secondary',
        route: environments,
        label: '环境列表',
        workspaceKey: 'environments',
        contextRequirements: { accountId: true, applicationId: true },

        agentDescription: '管理应用环境',
        visibleInSidebar: true,
    },
    {
        key: 'changes.pipelines',
        level: 'secondary',
        route: pipelines,
        label: '流水线',
        workspaceKey: 'changes',
        contextRequirements: { accountId: true, applicationId: true, environmentId: true },

        agentDescription: '查看流水线和变更流程',
        visibleInSidebar: true,
    },
    {
        key: 'resources.clusters',
        level: 'secondary',
        route: clusters,
        label: '集群',
        workspaceKey: 'resources',
        contextRequirements: { accountId: true },

        agentDescription: '管理集群资源',
        visibleInSidebar: true,
    },
    {
        key: 'accounts.list',
        level: 'secondary',
        route: accounts,
        label: '账户列表',
        workspaceKey: 'accounts',

        agentDescription: '管理账号和权限',
        visibleInSidebar: true,
    },
    {
        key: 'support.aiChat',
        level: 'secondary',
        route: aiChatRoute,
        label: 'AI 助手',
        workspaceKey: 'support',

        agentDescription: '打开 AI 助手',
        visibleInSidebar: true,
    },
    {
        key: 'support.aiDebug',
        level: 'secondary',
        route: aiDebugRoute,
        label: 'AI 调试',
        workspaceKey: 'support',

        agentDescription: '打开 AI 调试页面',
        visibleInSidebar: true,
    },
    {
        key: 'support.settings',
        level: 'secondary',
        route: settings,
        label: '用户设置',
        workspaceKey: 'support',

        agentDescription: '打开用户设置',
        visibleInSidebar: true,
    },
    {
        key: 'support.changelog',
        level: 'secondary',
        route: changelog,
        label: '更新日志',
        workspaceKey: 'support',

        agentDescription: '查看更新日志',
        visibleInSidebar: true,
    },
];
