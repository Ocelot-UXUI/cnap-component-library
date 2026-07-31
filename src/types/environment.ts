/**
 * 环境相关类型定义
 */

// 环境类型
export type EnvironmentType = 'prod' | 'staging' | 'sandbox' | 'testing' | 'dev';

// 环境级别
export type EnvironmentLevel = 'production' | 'testing';

// 环境状态
export type EnvironmentStatus = 'healthy' | 'warning' | 'error';

// 路由类型
export type RoutingType = 'service-mesh' | 'ingress' | 'none';

// 环境信息
export interface Environment {
    id: string;
    name: string;
    displayName: string;
    type: EnvironmentType;
    level: EnvironmentLevel;
    status: EnvironmentStatus;
    isFeatureEnv: boolean;
    baseEnv?: string;
    routingType?: RoutingType;
    clusters: string[];
    applications: number;
    owner: string;
    protected: boolean;
    expiresAt: string | null;
    lastDeployment: string;
    createdAt: string;
}

// 环境类型配置
export interface EnvironmentTypeConfig {
    label: string;
    shortLabel: string;
    color: string;
    textColor: string;
}

// 环境级别配置
export interface EnvironmentLevelConfig {
    label: string;
    description: string;
    color: string;
    types: EnvironmentType[];
}
