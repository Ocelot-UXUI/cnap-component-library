import qs from 'qs';
import type {
    AccessCreateBody,
    AccessListResult,
    AccessNamePreview,
    AccessRecord,
    AccessTopology,
    AccessType,
    AccessUpdateBody,
} from '@/interface/entities/trafficAccess';
import {createInterface} from './services/primary';

/**
 * getAccesses 专用参数序列化：type 数组按重复 key 输出（?type=service&type=headless），
 * 其余选项与全局 paramsSerializer 一致（skipNulls / allowDots）。
 */
export const serializeGetAccessesParams = {
    serialize: (params: Record<string, unknown>): string =>
        qs.stringify(params, {
            arrayFormat: 'repeat',
            skipNulls: true,
            allowDots: true,
        }),
};

interface ParamsGetAccesses {
    /** 应用环境关系 ID */
    appEnvID: string;
    /** 接入类型，可重复传多个做「或」过滤 */
    type?: string[];
    /** 按目标集群过滤 */
    clusterId?: string;
    /** 按目标工作负载过滤 */
    workload?: string;
    /** 页码，从 1 开始 */
    page?: number;
    /** 每页条数；不传或小于 1 时返回全部 */
    pageSize?: number;
}

interface ParamsGetAccessDetail {
    /** 应用环境关系 ID */
    appEnvID: string;
    /** 接入记录 ID */
    accessID: string;
}

interface ParamsAppEnv {
    /** 应用环境关系 ID */
    appEnvID: string;
}

interface ParamsGetAccessTypes {
    /** 应用环境关系 ID */
    appEnvID: string;
    /** 将依赖判定限定到该工作负载；为空为整个环境 */
    workload?: string;
    /** 只保留可位于该下游节点之前的类型；工作负载节点用 pod */
    downstreamType?: string;
}

interface ParamsGetAccessNamePreview {
    /** 应用环境关系 ID */
    appEnvID: string;
    /** 接入类型；未知类型返回 400 */
    type: string;
    /** 用于渲染默认名的工作负载 */
    workload?: string;
    /** 用于渲染 {cluster} 占位符 */
    clusterId?: string;
    /** 用户输入的自定义基础名；非空时做字符集校验 */
    name?: string;
}

interface ParamsGetAccessTopology {
    /** 应用环境关系 ID */
    appEnvID: string;
    /** 分组方式：workload（默认）/cluster */
    groupBy?: 'workload' | 'cluster';
}

/**
 * 查询接入列表
 *
 * GET /rest/v1/application-environments/:appEnvID/accesses
 *
 * type 为「或」过滤，可重复传多个；本接口使用重复 key 序列化。
 */
const getAccesses = createInterface<ParamsGetAccesses, AccessListResult>(
    'GET',
    '/application-environments/{appEnvID}/accesses',
    { paramsSerializer: serializeGetAccessesParams },
);

/**
 * 创建接入（201，body 恒为数组：ens-inst/nlb-ens 按集群展开成多条记录）
 *
 * POST /rest/v1/application-environments/:appEnvID/accesses
 */
const createAccess = createInterface<ParamsAppEnv & AccessCreateBody, AccessRecord[]>(
    'POST',
    '/application-environments/{appEnvID}/accesses',
);

/**
 * 查询接入详情
 *
 * GET /rest/v1/application-environments/:appEnvID/accesses/:accessID
 */
const getAccessDetail = createInterface<ParamsGetAccessDetail, AccessRecord>(
    'GET',
    '/application-environments/{appEnvID}/accesses/{accessID}',
);

/**
 * 更新接入（type 不可变：留空表示不变，传入则必须与原记录一致）
 *
 * PUT /rest/v1/application-environments/:appEnvID/accesses/:accessID
 */
const updateAccess = createInterface<ParamsGetAccessDetail & AccessUpdateBody, AccessRecord>(
    'PUT',
    '/application-environments/{appEnvID}/accesses/{accessID}',
);

/**
 * 删除接入（204 无 body）
 *
 * DELETE /rest/v1/application-environments/:appEnvID/accesses/:accessID
 */
const deleteAccess = createInterface<ParamsGetAccessDetail, void>(
    'DELETE',
    '/application-environments/{appEnvID}/accesses/{accessID}',
);

/**
 * 查询可创建的接入类型（创建向导第一步、以及「新增上游接入」入口）
 *
 * GET /rest/v1/application-environments/:appEnvID/access-types
 */
const getAccessTypes = createInterface<ParamsGetAccessTypes, AccessType[]>(
    'GET',
    '/application-environments/{appEnvID}/access-types',
);

/**
 * 预览默认名称并校验自定义名
 *
 * GET /rest/v1/application-environments/:appEnvID/access-name-preview
 */
const getAccessNamePreview = createInterface<ParamsGetAccessNamePreview, AccessNamePreview>(
    'GET',
    '/application-environments/{appEnvID}/access-name-preview',
);

/**
 * 查询流量拓扑
 *
 * GET /rest/v1/application-environments/:appEnvID/access-topology
 */
const getAccessTopology = createInterface<ParamsGetAccessTopology, AccessTopology>(
    'GET',
    '/application-environments/{appEnvID}/access-topology',
);

export default {
    getAccesses,
    createAccess,
    getAccessDetail,
    updateAccess,
    deleteAccess,
    getAccessTypes,
    getAccessNamePreview,
    getAccessTopology,
};
