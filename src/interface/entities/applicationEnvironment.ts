/**
 * 应用环境关系实体
 */

/**
 * 应用环境关系
 *
 * 表示一个应用在一个环境中的部署关系，后续运行时接口以 `id` 作为 `appEnvID`。
 */
export interface AppEnvironment {
    /** 应用环境关系 ID，即后续运行时接口的 appEnvID */
    id: string;
    /** 应用 ID */
    applicationId: string;
    /** 环境 ID */
    environmentId: string;
    /** 环境名 */
    environmentName: string;
}

/**
 * 应用环境集群关系
 *
 * 表示一个应用环境部署在哪些集群上，后续运行时接口的 clusterId 使用此处的 clusterId。
 */
export interface AppEnvironmentCluster {
    /** 应用环境集群关系 ID */
    id: number;
    /** 应用环境关系 ID */
    applicationEnvironmentId: string;
    /** 集群 ID，后续 runtime 接口的 clusterId / clusterID 使用此值 */
    clusterId: string;
    /** 展示在前端的集群名 */
    clusterName: string;
    /** 集群提供方，例如 EKS-CCE */
    clusterConnector: string;
    /** 期望副本数 */
    desiredReplicas: number;
    /** 可用副本数 */
    availableReplicas: number;
}
