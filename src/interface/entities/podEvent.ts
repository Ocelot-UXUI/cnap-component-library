/**
 * 运行时资源实体：Pod 事件
 */

/**
 * Pod 事件类型
 */
export type PodEventType = 'Normal' | 'Warning' | string;

/**
 * Pod 事件
 *
 * 来源接口：GET /rest/v1/application-environments/:appEnvID/runtime/clusters/:clusterId/pods/:podName/events
 */
export interface PodEvent {
    /** 集群 ID */
    clusterId: string;
    /** namespace */
    namespace: string;
    /** Event 名 */
    name: string;
    /** 创建时间 */
    createdAt?: string;
    /** 首次出现时间 */
    firstSeen: string;
    /** 最近出现时间 */
    lastSeen: string;
    /** Kubernetes resourceVersion */
    resourceVersion?: string | number;
    /** 事件类型，Normal / Warning */
    type: PodEventType;
    /** 原因 */
    reason: string;
    /** 事件消息 */
    message: string;
    /** 出现次数 */
    count: number;
    /** 关联对象 apiVersion */
    objectApiVersion: string;
    /** 关联对象 kind */
    objectKind: string;
    /** 关联对象名称 */
    objectName: string;
    /** 关联对象 namespace */
    objectNamespace: string;
    /** 来源组件 */
    sourceComponent: string;
    /** 来源节点 */
    sourceHost: string;
}

/**
 * Pod 事件列表响应
 *
 * 该接口不支持完整分页，只支持通过 nextPageToken 按顺序往后翻页。
 */
export interface PodEventList {
    /** 翻页游标，为空表示已到末页 */
    nextPageToken: string;
    /** 事件列表 */
    items: PodEvent[];
}
