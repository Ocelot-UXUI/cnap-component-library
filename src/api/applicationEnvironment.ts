import type {AppEnvironment, AppEnvironmentCluster} from '@/interface/entities/applicationEnvironment';
import {createInterface} from './services/primary';

interface ParamsGetEnvironments {
    /** 应用 ID */
    applicationID: string;
}

interface ParamsGetClusters {
    /** 应用环境关系 ID */
    appEnvID: string;
}

/**
 * 查询应用环境列表
 *
 * GET /rest/v1/applications/:applicationID/environments
 *
 * 用户选择应用后调用本接口拿环境列表，选择环境后把 id 作为后续 runtime 接口的 appEnvID。
 */
const getEnvironments = createInterface<ParamsGetEnvironments, AppEnvironment[]>(
    'GET',
    '/applications/{applicationID}/environments',
);

/**
 * 查询应用环境集群列表
 *
 * GET /rest/v1/application-environments/:appEnvID/clusters
 */
const getClusters = createInterface<ParamsGetClusters, AppEnvironmentCluster[]>(
    'GET',
    '/application-environments/{appEnvID}/clusters',
);

export default {
    getEnvironments,
    getClusters,
};
