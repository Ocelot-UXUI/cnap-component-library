/* eslint-disable max-len */
export type AppStatus = 'healthy' | 'warning' | 'error';
export type DeployStatus = 'in_progress' | 'paused' | 'completed';
export type AlertType = 'error' | 'warning';
export type ActivityType = 'deployment' | 'cluster' | 'config' | 'permission' | 'application' | 'environment';

export interface FavoriteApp {
    id: string;
    name: string;
    account: string;
    environment: string;
    status: AppStatus;
    lastDeployed: string;
    url?: string;
}

export interface RecentItem {
    id: string;
    name: string;
    account: string;
    action: string;
    time: string;
}

export interface Deployment {
    id: string;
    app: string;
    cluster: string;
    environment: string;
    version: string;
    status: DeployStatus;
    progress: number;
    startedAt: string;
    strategy: string;
    currentStep: string;
}

export interface UserAlert {
    id: string;
    app: string;
    type: AlertType;
    message: string;
    time: string;
}

export interface Activity {
    id: string;
    type: ActivityType;
    message: string;
    user: string;
    time: string;
}

export const userStats = { totalFavorites: 8, deploymentsToday: 12, activeAlerts: 2, appsNeedingAttention: 3 };

export const favoriteApps: FavoriteApp[] = [
    {
        id: '1',
        name: 'api-gateway',
        account: 'Acme Corp',
        environment: '生产环境',
        status: 'healthy',
        lastDeployed: '2 小时前',
        url: 'https://api.acme.com',
    },
    {
        id: '2',
        name: 'web-frontend',
        account: 'Acme Corp',
        environment: '生产环境',
        status: 'healthy',
        lastDeployed: '5 小时前',
    },
    {
        id: '3',
        name: 'personal-blog',
        account: '个人',
        environment: '生产环境',
        status: 'healthy',
        lastDeployed: '1 天前',
    },
    {
        id: '4',
        name: 'payment-service',
        account: 'Acme Corp',
        environment: '预发环境',
        status: 'warning',
        lastDeployed: '30 分钟前',
    },
];

export const recentItems: RecentItem[] = [
    { id: '1', name: 'api-gateway', account: 'Acme Corp', action: '查看了日志', time: '5 分钟前' },
    { id: '2', name: 'user-service', account: 'Acme Corp', action: '发起了部署', time: '1 小时前' },
    { id: '3', name: 'notification-service', account: 'Acme Corp', action: '更新了配置', time: '2 小时前' },
    { id: '4', name: 'personal-blog', account: '个人', action: '查看了状态', time: '3 小时前' },
];

export const deployments: Deployment[] = [
    {
        id: '1',
        app: 'api-gateway',
        cluster: 'aws-us-east-1',
        environment: '生产环境',
        version: 'v2.3.1 → v2.4.0',
        status: 'in_progress',
        progress: 67,
        startedAt: '10 分钟前',
        strategy: '金丝雀',
        currentStep: '流量切换中 (67%)',
    },
    {
        id: '2',
        app: 'user-service',
        cluster: 'gcp-us-central1',
        environment: '生产环境',
        version: 'v1.8.0 → v1.9.0',
        status: 'in_progress',
        progress: 30,
        startedAt: '25 分钟前',
        strategy: '滚动更新',
        currentStep: '滚动更新中 (3/10)',
    },
    {
        id: '3',
        app: 'payment-service',
        cluster: 'aws-us-east-1',
        environment: '预发环境',
        version: 'v3.1.2 → v3.2.0',
        status: 'paused',
        progress: 25,
        startedAt: '1 小时前',
        strategy: '金丝雀',
        currentStep: '已暂停于 25%',
    },
];

export const userAlerts: UserAlert[] = [
    { id: '1', app: 'Payment Service', type: 'error', message: '检测到高错误率：5.2% 的请求失败', time: '5 分钟前' },
    { id: '2', app: 'API Gateway', type: 'warning', message: '内存使用率达 85%，即将触达上限', time: '12 分钟前' },
];

export const activities: Activity[] = [
    { id: '1', type: 'deployment', message: '将 api-gateway 部署到生产环境', user: 'John Doe', time: '2 分钟前' },
    { id: '2', type: 'cluster', message: '新增集群 aws-us-west-2', user: 'Sarah Kim', time: '15 分钟前' },
    { id: '3', type: 'config', message: '更新了 user-service 的环境变量', user: 'Mike Ross', time: '32 分钟前' },
    { id: '4', type: 'permission', message: '授予 Emily Liu 管理员权限', user: 'Admin', time: '1 小时前' },
    { id: '5', type: 'application', message: '创建了应用 notification-worker', user: 'Alex Park', time: '2 小时前' },
    { id: '6', type: 'environment', message: '创建了 staging-eu 环境', user: 'Sarah Kim', time: '3 小时前' },
];
