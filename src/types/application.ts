/**
 * 应用相关类型定义
 */

// 应用类型
export type ApplicationType = 'standard' | 'ai-inference' | 'frontend';

// 应用状态
export type ApplicationStatus = 'healthy' | 'warning' | 'error';

// GPU 信息
export interface GPU {
    type: string;
    used: number;
    total: number;
}

// 标签
export interface Label {
    name: string;
    color: string;
}

// 应用信息
export interface Application {
    id: string;
    name: string;
    appType: ApplicationType;
    status: ApplicationStatus;
    environments: string[];
    version: string;
    owner: string;
    cluster: string;
    accountId: string;
    labels: Label[];
    cpu: string;
    memory: string;
    gpus: GPU[];
    replicas: number;
    healthyReplicas: number;
}

// 应用类型配置
export interface ApplicationTypeConfig {
    label: string;
    color: string;
    bgColor: string;
    description: string;
}
