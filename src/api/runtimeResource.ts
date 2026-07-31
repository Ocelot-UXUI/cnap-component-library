import type {Pod, PodDetailUsage, PodList, PodUsage} from '@/interface/entities/pod';
import type {PodEventList, PodEventType} from '@/interface/entities/podEvent';
import type {RuntimeSummary} from '@/interface/entities/runtimeSummary';
import type {RuntimeWorkload, WorkloadGroup} from '@/interface/entities/workload';
import {createInterface} from './services/primary';

interface ParamsGetWorkloadGroups {
    /** 应用环境关系 ID */
    appEnvID: string;
    /** 集群 ID，选择具体集群时传入 */
    clusterId?: string;
}

interface ParamsGetPods {
    /** 应用环境关系 ID */
    appEnvID: string;
    /** 集群 ID，选择集群时传入 */
    clusterId?: string;
    /** 组 ID，选择工作负载（分组）时传入 */
    groupId?: string;
    /** 页码 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
    /** 排序表达式：正序则传入字段名，倒序则传入减号加字段名。
     * 例如，如果根据 status 字段排序，则升序传入status，降序传入-status
     * 支持排序的字段为：重启次数restarts、存活时间creationTimestamp和状态status
     */
    sort?: string;
    /** 过滤状态，支持用逗号分隔多个状态，如"Running Ready,Terminating,xxx" */
    status?: string;
    /** 按照是否屏蔽过滤，true表示过滤已屏蔽的，false表示过滤未屏蔽的 */
    blocked?: boolean;
    /** 过滤关键字 */
    keyword?: string;
}

interface PodUsageTarget {
    clusterId: string;
    name: string;
}

interface ParamsGetPodUsages {
    /** 应用环境关系 ID */
    appEnvID: string;
    /** 当前页 Pod 列表 */
    pods: PodUsageTarget[];
}

interface ParamsGetPodDetail {
    /** 应用环境关系 ID */
    appEnvID: string;
    /** 集群 ID */
    clusterId: string;
    /** Pod 名 */
    podName: string;
}

interface ParamsGetContainerLogs {
    /** 应用环境关系 ID */
    appEnvID: string;
    /** 集群 ID */
    clusterId: string;
    /** Pod 名 */
    podName: string;
    /** 容器名 */
    containerName: string;
    /** 日志来源，不指定默认来自容器标准输出，设置为 file 时从容器内文件获取 */
    source?: string;
    /** 返回最后 N 行 */
    tailLines?: number;
    /** 返回最前 N 行 */
    headLines?: number;
    /** 是否查询上一个容器实例日志（source 不指定时可选） */
    previous?: boolean;
    /** source=file 时用于指定容器内文件路径 */
    filePath?: string;
    /** 是否持续获取新增日志 */
    follow?: boolean;
}

interface ParamsGetPodEvents {
    /** 应用环境关系 ID */
    appEnvID: string;
    /** 集群 ID */
    clusterId: string;
    /** Pod 名 */
    podName: string;
    /** 容器名称 */
    container?: string;
    /** 事件类型，例如 Normal / Warning */
    type?: PodEventType;
    /** 排序表达式，原样转发 */
    orderBy?: string;
    /** 每页数量 */
    pageSize?: number;
    /** 翻页游标 */
    pageToken?: string;
}

interface ParamsGetRuntimeSummary {
    /** 应用环境关系 ID */
    appEnvID: string;
    /** 集群 ID */
    clusterId?: string;
    /** 组 ID，按工作负载组筛选 */
    groupId?: string;
}

/**
 * 查询运行时汇总信息
 *
 * GET /rest/v1/application-environments/:appEnvID/runtime/summary?clusterID=xxx
 */
const getRuntimeSummary = createInterface<ParamsGetRuntimeSummary, RuntimeSummary>(
    'GET',
    '/application-environments/{appEnvID}/runtime/summary',
);

/**
 * 查询运行时工作负载（分组）
 *
 * GET /rest/v1/application-environments/:appEnvID/runtime/groups
 */
const getWorkloadGroups = createInterface<ParamsGetWorkloadGroups, WorkloadGroup[]>(
    'GET',
    '/application-environments/{appEnvID}/runtime/groups',
);

/**
 * 查询 Pod 列表
 *
 * GET /rest/v1/application-environments/:appEnvID/runtime/pods
 */
const getPods = createInterface<ParamsGetPods, PodList>(
    'GET',
    '/application-environments/{appEnvID}/runtime/pods',
);

/**
 * 查询 Pod 详情
 *
 * GET /rest/v1/application-environments/:appEnvID/runtime/clusters/:clusterId/pods/:podName
 */
const getPodUsages = createInterface<ParamsGetPodUsages, PodUsage[]>(
    'POST',
    '/application-environments/{appEnvID}/runtime/pods/usage',
);

const getPodDetail = createInterface<ParamsGetPodDetail, Pod>(
    'GET',
    '/application-environments/{appEnvID}/runtime/clusters/{clusterId}/pods/{podName}',
);

const getPodDetailUsage = createInterface<ParamsGetPodDetail, PodDetailUsage>(
    'GET',
    '/application-environments/{appEnvID}/runtime/clusters/{clusterId}/pods/{podName}/usage',
);

/**
 * 查询容器日志
 *
 * GET /rest/v1/application-environments/:appEnvID/runtime/clusters/:clusterId/pods/:podName/containers/:containerName/logs
 *
 * 响应为纯文本日志，每行一条。
 */
const getContainerLogs = createInterface<ParamsGetContainerLogs, string>(
    'GET',
    '/application-environments/{appEnvID}/runtime/clusters/{clusterId}/pods/{podName}/containers/{containerName}/logs',
);

/**
 * 查询 Pod 事件
 *
 * GET /rest/v1/application-environments/:appEnvID/runtime/clusters/:clusterId/pods/:podName/events
 *
 * 该接口不支持完整分页，只支持通过 nextPageToken 按顺序往后翻页。
 */
const getPodEvents = createInterface<ParamsGetPodEvents, PodEventList>(
    'GET',
    '/application-environments/{appEnvID}/runtime/clusters/{clusterId}/pods/{podName}/events',
);

interface ParamsGetRuntimeWorkloads {
    /** 应用环境关系 ID */
    appEnvID: string;
    /** 组 ID */
    groupId: string;
}

/**
 * 查询 Runtime Workload 列表（Restart 操作专用）
 *
 * GET /rest/v1/application-environments/:appEnvID/runtime/workloads
 *
 * 返回 group 下所有 workload 的详细信息，包含 updateStrategy、availabilityTarget 和容器列表。
 */
const getRuntimeWorkloads = createInterface<ParamsGetRuntimeWorkloads, RuntimeWorkload[]>(
    'GET',
    '/application-environments/{appEnvID}/runtime/workloads',
);

export default {
    getRuntimeSummary,
    getWorkloadGroups,
    getRuntimeWorkloads,
    getPods,
    getPodUsages,
    getPodDetail,
    getPodDetailUsage,
    getContainerLogs,
    getPodEvents,
};
