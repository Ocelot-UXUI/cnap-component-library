import {
    AlertOutlined,
    ApiOutlined,
    AppstoreOutlined,
    BranchesOutlined,
    BugOutlined,
    CloudOutlined,
    ClusterOutlined,
    CodeOutlined,
    DeploymentUnitOutlined,
    FileTextOutlined,
    HistoryOutlined,
    HomeOutlined,
    ReadOutlined,
    RobotOutlined,
    SettingOutlined,
    StarOutlined,
    TeamOutlined,
    ToolOutlined,
} from '@ant-design/icons';

import homeNavigationIcon from '@/assets/navigation/home.png';
import applicationsNavigationIcon from '@/assets/navigation/applications.png';
import applicationsSelectedNavigationIcon from '@/assets/navigation/applications-selected.png';
import environmentsNavigationIcon from '@/assets/navigation/environments.png';
import changesNavigationIcon from '@/assets/navigation/changes.png';
import resourcesNavigationIcon from '@/assets/navigation/resources.png';
import accountsNavigationIcon from '@/assets/navigation/accounts.png';
import moreNavigationIcon from '@/assets/navigation/more.png';

import type {NavigationNodeKey} from '@/navigation';
import type {ReactNode} from 'react';

export const navigationIcons: Partial<Record<NavigationNodeKey, ReactNode>> = {
    'home.dashboard': <HomeOutlined />,
    'home.favorites': <StarOutlined />,
    'home.recent': <HistoryOutlined />,
    'applications.list': <AppstoreOutlined />,
    'applications.workloads': <DeploymentUnitOutlined />,
    'applications.serviceExposure': <ApiOutlined />,
    'applications.logs': <FileTextOutlined />,
    'applications.terminal': <CodeOutlined />,
    'applications.monitor': <AlertOutlined />,
    'applications.appRuntimeConfig': <ToolOutlined />,
    'applications.appSettings': <SettingOutlined />,
    'environments.list': <CloudOutlined />,
    'changes.pipelines': <BranchesOutlined />,
    'resources.clusters': <ClusterOutlined />,
    'accounts.list': <TeamOutlined />,
    'support.aiChat': <RobotOutlined />,
    'support.aiDebug': <BugOutlined />,
    'support.settings': <SettingOutlined />,
    'support.changelog': <ReadOutlined />,
};

/**
 * 一级工作区导航使用作品集 CNAP 设计稿中的专用图标。
 * 这些图标与二级导航图标分开维护，避免同一个 route key 在二级菜单中
 * 误用深色背景专用图标。
 */
export const primaryNavigationIcons: Partial<Record<NavigationNodeKey, string>> = {
    'home.dashboard': homeNavigationIcon,
    'applications.workloads': applicationsNavigationIcon,
    'environments.list': environmentsNavigationIcon,
    'changes.pipelines': changesNavigationIcon,
    'resources.clusters': resourcesNavigationIcon,
    'accounts.list': accountsNavigationIcon,
    'support.aiChat': moreNavigationIcon,
};

export const primaryNavigationActiveIcons: Partial<Record<NavigationNodeKey, string>> = {
    'applications.workloads': applicationsSelectedNavigationIcon,
};

export {moreNavigationIcon};
