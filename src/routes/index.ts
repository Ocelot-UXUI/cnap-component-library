import type {Route, RouteMeta} from './create';

export {route} from './create';
export type {Route, RouteMeta};

export {
    applicationDeployments,
    applicationOverview,
    applicationRuntimeConfig,
    applications,
    applicationSettings,
    applicationStartupConfig,
    appRuntimeConfig,
    appSettings,
    logs,
    monitor,
    serviceExposure,
    terminal,
} from './applications';

export {
    accounts,
    clusterDetail,
    clusters,
    environmentDetail,
    environments,
} from './resources';

export {
    changelog,
    pipelines,
    settings,
} from './system';

export {
    favorites,
    recent,
} from './personal';

export {workloads} from './workloads';

import {
    applicationDeployments,
    applicationOverview,
    applicationRuntimeConfig,
    applications,
    applicationSettings,
    applicationStartupConfig,
    appRuntimeConfig,
    appSettings,
    logs,
    monitor,
    serviceExposure,
    terminal,
} from './applications';
import {
    favorites,
    recent,
} from './personal';
import {
    accounts,
    clusterDetail,
    clusters,
    environmentDetail,
    environments,
} from './resources';
import {
    changelog,
    pipelines,
    settings,
} from './system';
import {workloads} from './workloads';

/** 所有路由对象，供程序化访问 */
export const routes: Record<string, Route> = {
    applications,
    applicationOverview,
    applicationDeployments,
    applicationSettings,
    applicationRuntimeConfig,
    applicationStartupConfig,
    appRuntimeConfig,
    appSettings,
    logs,
    monitor,
    serviceExposure,
    terminal,
    accounts,
    environments,
    clusters,
    clusterDetail,
    environmentDetail,
    settings,
    pipelines,
    changelog,
    favorites,
    recent,
    workloads,
};

const PARAM_PATTERN = /\{(\w+)\}/g;

/** 从路由定义中提取元数据 */
export function getRouteMetas(): RouteMeta[] {
    return Object.entries(routes).map(([key, route]) => {
        const params: string[] = [];
        let match: RegExpExecArray | null;
        const regex = new RegExp(PARAM_PATTERN.source, PARAM_PATTERN.flags);
        while ((match = regex.exec(route.path)) !== null) {
            params.push(match[1]);
        }
        return { key, description: route.description, params };
    });
}

/** 将路由元数据序列化为 system prompt 文本 */
export function formatRouteContext(): string {
    const metas = getRouteMetas();
    const lines = metas.map(({ key, description, params }) => {
        const descPart = description ? `: ${description}` : '';
        const paramPart = params.length > 0
            ? `${description ? '，' : ': '}参数: {${params.join('}, {')}}`
            : '';
        return `- ${key}${descPart}${paramPart}`;
    });
    return `## 可用路由\n使用 navigate 工具进行页面导航，routeKey 从以下列表中选择：\n${lines.join('\n')}`;
}
