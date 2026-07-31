import type {RawResourceFormat} from '@/interface/entities/rawResource';
import {createInterface} from './services/primary';

interface ParamsGetCoreResource {
    /** 应用环境关系 ID */
    appEnvID: string;
    /** 集群 ID */
    clusterId: string;
    /** core 资源复数名，例如 pods、services、configmaps */
    resource: string;
    /** 资源名 */
    name: string;
    /** 返回格式，只支持 json 或 yaml */
    format: RawResourceFormat;
}

interface ParamsGetGroupVersionResource {
    /** 应用环境关系 ID */
    appEnvID: string;
    /** 集群 ID */
    clusterId: string;
    /** API group，例如 apps、batch */
    group: string;
    /** API version，例如 v1 */
    version: string;
    /** 资源复数名，例如 deployments */
    resource: string;
    /** 资源名 */
    name: string;
    /** 返回格式，只支持 json 或 yaml */
    format: RawResourceFormat;
}

/**
 * 查询 core 资源原始 JSON/YAML
 *
 * GET /rest/v1/application-environments/:appEnvID/runtime/clusters/:clusterId/raw-resources/core/:resource/:name
 *
 * 用于Pod详情页的 YAML/JSON 查看。format=json 时响应为对象，format=yaml 时响应为字符串。
 */
const getCoreResource = createInterface<ParamsGetCoreResource, unknown>(
    'GET',
    '/application-environments/{appEnvID}/runtime/clusters/{clusterId}/raw-resources/core/{resource}/{name}',
);

/**
 * 查询 group/version 资源原始 JSON/YAML
 *
 * GET /rest/v1/application-environments/:appEnvID/runtime/clusters/:clusterId/raw-resources/:group/:version/:resource/:name
 *
 * workload 的 resourceType 字段对应 /:group/:version/:resource。
 * format = json 时响应为对象，format=yaml 时响应为字符串。
 */
const getGroupVersionResource = createInterface<ParamsGetGroupVersionResource, unknown>(
    'GET',
    '/application-environments/{appEnvID}/runtime/clusters/{clusterId}/raw-resources/{group}/{version}/{resource}/{name}',
);

export default {
    getCoreResource,
    getGroupVersionResource,
};
