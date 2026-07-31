/**
 * 运行时资源实体：工作负载与分组
 */

/**
 * 资源配额（ResourceQuota）
 *
 * 用于容器级别的 resourceLimits / resourceRequests / resourceUsages。
 *
 * - cpu 单位是 millicore（1000 = 1 core）
 * - memory 单位是 bytes
 * - ephemeralStorage 单位是 bytes
 * - others 存放其他扩展资源，例如 GPU、FPGA 等
 *
 * 来源：Pod 详情 / 列表接口中 containers[].resource* 字段
 */
export interface GpuResource {
    vendor: string;
    model: string;
    profile: string;
    count: number;
}

export interface ResourceQuota {
    /** CPU quantity，例如 1c、500m */
    cpu?: string;
    cpuMilli?: string;
    /** 内存 quantity，例如 16Gi */
    memory?: string;
    memoryBytes?: string;
    /** 临时存储 quantity，例如 200Gi */
    ephemeralStorage?: string;
    ephemeralStorageBytes?: string;
    /** GPU 资源明细 */
    gpus?: GpuResource[];
    /** 其他扩展资源，例如 { "nvidia.com/gpu": "1" } */
    others?: Record<string, string>;
}

/**
 * 工作负载信息
 *
 * 隶属于某个工作负载分组（WorkloadGroup），表示一个具体的 Kubernetes 资源实例。
 */
export interface Workload {
    /** 集群 ID */
    clusterId: string;
    /** 集群名 */
    clusterName?: string;
    /** namespace */
    namespace: string;
    /** workload 名 */
    name: string;
    /** Kubernetes UID */
    uid?: string;
    /** API version，例如 apps/v1 */
    apiVersion: string;
    /** 资源 kind，例如 Deployment */
    kind: string;
    /** 资源类型，例如 apps/v1/deployments */
    resourceType: string;
    /** 期望副本数 */
    replicas?: number;
    /** ready 副本数 */
    readyReplicas?: number;
    /** available 副本数 */
    availableReplicas?: number;
    /** 标签 */
    labels?: Record<string, string>;
    /** 注解 */
    annotations?: Record<string, string>;
    /** 创建时间 */
    creationTimestamp?: string;
    /** 当前版本 */
    currentVersion: string;
}

/**
 * 工作负载分组
 *
 * 按资源类型分组的工作负载列表，id 可作为 Pod 列表查询的 groupId。
 *
 * 来源接口：GET /rest/v1/application-environments/:appEnvID/runtime/groups
 */
export interface WorkloadGroup {
    /** 分组 ID，可作为 Pod 列表查询的 groupId */
    id: string;
    /** 分组名 */
    name: string;
    /** 资源 kind，例如 Deployment */
    kind: string;
    /** 当前版本 */
    currentVersion: string;
    /** 该分组下的工作负载列表 */
    workloads: Workload[];
}

/**
 * 运行时 Workload 详情（Restart 操作专用）
 *
 * 来源接口：GET /rest/v1/application-environments/:appEnvID/runtime/workloads
 *
 * 与 Workload（分组内版本）的区别：增加了 updateStrategy、availabilityTarget 和容器列表。
 */
export interface RuntimeWorkloadContainer {
    name: string;
    resourceLimits: ResourceQuota;
    resourceRequests: ResourceQuota;
}

export interface RuntimeWorkloadUpdateStrategy {
    maxSurge: string;
    maxUnavailable: string;
}

export interface RuntimeWorkload {
    clusterId: string;
    clusterName: string;
    resourceType: string;
    name: string;
    replicas: number;
    updateStrategy: RuntimeWorkloadUpdateStrategy;
    /** 可用度目标，为空表示未启用 */
    availabilityTarget: string;
    podContainers: RuntimeWorkloadContainer[];
}
