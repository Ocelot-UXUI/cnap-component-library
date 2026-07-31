import type {Route} from '@/routes';

export type WorkspaceKey =
    | 'home'
    | 'applications'
    | 'environments'
    | 'changes'
    | 'resources'
    | 'accounts'
    | 'support';

export type NavigationNodeKey =
    | 'home.dashboard'
    | 'home.favorites'
    | 'home.recent'
    | 'applications.list'
    | 'applications.overview'
    | 'applications.deployments'
    | 'applications.runtimeConfig'
    | 'applications.startupConfig'
    | 'applications.settings'
    | 'applications.workloads'
    | 'applications.serviceExposure'
    | 'applications.logs'
    | 'applications.terminal'
    | 'applications.monitor'
    | 'applications.appRuntimeConfig'
    | 'applications.appSettings'
    | 'environments.list'
    | 'changes.pipelines'
    | 'resources.clusters'
    | 'accounts.list'
    | 'support.aiChat'
    | 'support.aiDebug'
    | 'support.settings'
    | 'support.changelog';

export type NavigationLevel = 'workspace' | 'secondary' | 'child';
export type ContextKey = 'accountId' | 'applicationId' | 'environmentId' | 'clusterId';
export type ContextRequirements = Partial<Record<ContextKey, true>>;

interface BaseNavigationNode {
    key: NavigationNodeKey;
    level: NavigationLevel;
    route: Route;
    label: string;
    workspaceKey: WorkspaceKey;
    parentKey?: NavigationNodeKey;
    groupKey?: string;
    defaultChildKey?: NavigationNodeKey;
    agentDescription: string;
    visibleInSidebar?: boolean;
}

export interface SecondaryNavigationNode extends BaseNavigationNode {
    level: 'secondary';
    contextRequirements?: ContextRequirements;
}

export interface WorkspaceNavigationNode extends BaseNavigationNode {
    level: 'workspace';
    contextRequirements?: never;
}

export interface ChildNavigationNode extends BaseNavigationNode {
    level: 'child';
    parentKey: NavigationNodeKey;
    contextRequirements?: ContextRequirements;
}

export type NavigationNode =
    | WorkspaceNavigationNode
    | SecondaryNavigationNode
    | ChildNavigationNode;

export interface WorkspaceDefinition {
    key: WorkspaceKey;
    label: string;
    defaultNodeKey: NavigationNodeKey;
    agentDescription: string;
}

export interface NavigationMenuItem {
    key: NavigationNodeKey;
    label: string;
    url: string;
}

export interface NavigationMenuGroup {
    title?: string;
    divider?: boolean;
    items: NavigationMenuItem[];
}

export interface AgentNavigationTarget {
    key: NavigationNodeKey;
    label: string;
    workspaceKey: WorkspaceKey;
    routeKey: string;
    params: string[];
    contextRequirements: ContextRequirements;
    agentDescription: string;
}
