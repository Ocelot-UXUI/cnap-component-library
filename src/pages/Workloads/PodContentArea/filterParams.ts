/** 筛选态 + 分组 + 分页 → getPods 请求参数（纯逻辑）。 */

import runtimeResourceApi from '@/api/runtimeResource';
import type {GroupQuery, PodFilterState} from './types';

type GetPodsParams = Parameters<typeof runtimeResourceApi.getPods>[0];

export function toGetPodsParams(
    appEnvID: string,
    clusterId: string | undefined,
    groupId: string,
    filter: PodFilterState,
    query: GroupQuery,
): GetPodsParams {
    const keyword = filter.keyword.trim();
    return {
        appEnvID,
        clusterId,
        groupId,
        page: query.page,
        pageSize: query.pageSize,
        sort: query.sort,
        status: filter.status.length ? filter.status.join(',') : undefined,
        blocked: filter.blocked,
        keyword: keyword || undefined,
    };
}
