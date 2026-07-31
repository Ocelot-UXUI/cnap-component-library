/**
 * 运行时资源实体：Pod
 */

import type {OperationCapability, OperationTargetKind} from './runtimeOperation';
import type {PodStatistics} from './runtimeSummary';
import type {ResourceQuota} from './workload';

/**
 * Pod 级别的操作定义（结构同 RuntimeOperation，但出现在 Pod 上下文中）
 */
export interface PodOperation {
    /** 操作名 */
    name: string;
    /** 操作能力标识 */
    capability: OperationCapability;
    /** 展示名 */
    displayName: string;
    /** 操作描述 */
    description: string;
    /** 目标资源类型 */
    targetKind: OperationTargetKind;
    /** 是否禁用 */
    disabled: boolean;
    /** 禁用原因 */
    reason: string;
    /** 是否支持批量操作 */
    supportsBatch: boolean;
}

/**
 * 容器环境变量
 */
export interface EnvVar {
    /** 环境变量名 */
    name: string;
    /** 环境变量值 */
    value: string;
}

/**
 * 容器端口
 */
export interface ContainerPort {
    /** 端口名 */
    name: string;
    /** 端口号 */
    port: number;
    /** 协议，如 TCP / UDP */
    protocol: string;
}

/**
 * 容器挂载卷
 */
export interface VolumeMount {
    /** 卷名 */
    name: string;
    /** 挂载路径 */
    mountPath: string;
    /** 卷类型的展示文本，前端可直接显示 */
    type: string;
    /** 是否只读 */
    readOnly: boolean;
    /** 子路径 */
    subPath: string;
    /** 子路径表达式 */
    subPathExpr: string;
    /** 挂载传播 */
    mountPropagation: string;
    /** 递归只读 */
    recursiveReadOnly: string;
    /** ConfigMap 配置 */
    configMap?: {
        name: string;
    };
}

/**
 * 容器信息
 *
 * containers[] 和 initContainers[] 共用此结构。
 */
export interface Container {
    /** 容器名 */
    name: string;
    /** 容器类型（MAIN / NORMAL / SIDECAR / INIT） */
    type: string;
    /** 镜像名 */
    image: string;
    /** 实际拉取到的镜像 ID */
    imageId: string;
    /** 启动命令 */
    command: string[];
    /** 启动参数 */
    args: string[];
    /** command + args 的拼接文本，便于直接展示 */
    cmdline: string;
    /** 容器资源上限 */
    resourceLimits: ResourceQuota;
    /** 容器资源请求 */
    resourceRequests: ResourceQuota;
    /** 容器资源使用量，由独立 Usage 接口补充 */
    resourceUsages?: ResourceQuota;
    /** 环境变量 */
    env: EnvVar[];
    /** 暴露端口 */
    ports: ContainerPort[];
    /** 挂载卷 */
    volumeMounts: VolumeMount[];
    /** 容器状态 */
    status: string;
    /** 状态原因 */
    reason: string;
    /** 状态消息 */
    message: string;
    /** 重启次数 */
    restarts: number;
    /** 最近一次启动时间 */
    lastStartedAt: string;
    /** 上一次终止记录（K8s lastState.terminated），无终止记录时缺省 */
    lastTermination?: {
        exitCode: number;
        startedAt: string;
        finishedAt: string;
        reason: string;
    };
}

/**
 * Pod 错误信息
 */
export interface PodErrorMessage {
    /** 错误来源 */
    source: string;
    /** 错误消息 */
    message: string;
}

/**
 * Pod 信息
 *
 * 来源接口：GET /rest/v1/application-environments/:appEnvID/runtime/pods
 */
export interface Pod {
    /** 集群 ID */
    clusterId: string;
    /** 集群名 */
    clusterName?: string;
    /** namespace */
    namespace: string;
    /** Pod 名 */
    name: string;
    /** Kubernetes UID */
    uid?: string;
    /** 账号编码 */
    accountCode?: string;
    /** 环境名 */
    environmentName?: string;
    /** 应用名 */
    applicationName?: string;
    /** 所属 workload 类型 */
    workloadType?: string;
    /** 所属 workload 名 */
    workloadName?: string;
    /** 标签 */
    labels?: Record<string, string>;
    /** 注解 */
    annotations?: Record<string, string>;
    /** 容器列表 */
    containers?: Container[];
    /** init 容器列表 */
    initContainers?: Container[];
    /** 资源 limit */
    resourceLimits?: ResourceQuota;
    /** 资源 request */
    resourceRequests?: ResourceQuota;
    /** 资源 usage */
    resourceUsages?: ResourceQuota;
    /** Pod IP */
    podIp?: string;
    /** Node IP */
    hostIp?: string;
    /** 重启次数 */
    restarts?: number;
    /** 最近启动时间 */
    lastStartedAt?: string;
    /** 错误信息列表 */
    errorMessages?: PodErrorMessage[];
    /** Pod 状态，例如 Running、Pending、Failed */
    status: string;
    /** 相关链接 */
    links?: unknown[];
    /** 标签信息 */
    tags?: unknown[];
    /** Pod 可用操作列表 */
    operations?: PodOperation[];
    /** 创建时间 */
    creationTimestamp: string;
    /** 就绪容器数 */
    readyContainers?: number;
    /** 容器总数 */
    totalContainers?: number;
    version?: string;
}

/**
 * Pod 列表响应
 */
export interface PodUsage {
    clusterId: string;
    name: string;
    uid: string;
    resourceUsages: ResourceQuota;
}

export interface ContainerUsage {
    name: string;
    resourceUsages: ResourceQuota;
}

export interface PodDetailUsage extends PodUsage {
    containers?: ContainerUsage[] | null;
    initContainers?: ContainerUsage[] | null;
}

export interface PodList {
    /** 总数 */
    total: number;
    /** 页码 */
    page: number;
    /** 每页数量 */
    pageSize: number;
    /** Pod 列表 */
    items: Pod[];
    /** 汇总统计信息，用于快捷筛选计数 */
    summary: PodStatistics;
}
