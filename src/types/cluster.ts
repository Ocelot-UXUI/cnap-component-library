/**
 * 集群相关类型定义
 */

// 云提供商
export type CloudProvider = 'aws' | 'gcp' | 'baidu';

// 集群状态
export type ClusterStatus = 'healthy' | 'warning' | 'offline';

// Pod 信息
export interface PodInfo {
    running: number;
    total: number;
}

// 资源使用信息
export interface ResourceUsage {
    used: number;
    total: number;
}

// GPU 信息
export interface ClusterGPU {
    type: string;
    used: number;
    total: number;
}

// 集群信息
export interface Cluster {
    id: string;
    name: string;
    provider: CloudProvider;
    region: string;
    status: ClusterStatus;
    version: string;
    nodes: number;
    pods: PodInfo;
    cpu: ResourceUsage;
    memory: ResourceUsage;
    gpus?: ClusterGPU[];
    shared: boolean;
    applications: number;
}

// 云提供商配置
export interface CloudProviderConfig {
    value: CloudProvider;
    label: string;
    icon: string;
}
