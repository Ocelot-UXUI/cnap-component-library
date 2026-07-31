import {APP_BASENAME} from '@/constants/app';

export interface Route {
    path: string;
    toPath: (params?: Record<string, string>) => string;
    toUrl: (params?: Record<string, string>) => string;
    description?: string;
}

export interface RouteMeta {
    key: string;
    description?: string;
    params: string[];
}

export interface RouteFactory {
    route: (path: string, description?: string) => Route;
}

const PARAM_PATTERN = /\{(\w+)\}/g;

function resolvePath(path: string, params?: Record<string, string>): string {
    if (!params) {
        return path;
    }
    return path.replace(
        PARAM_PATTERN,
        (_match, key) => params[key] ?? `{${key}}`,
    );
}

function joinBasePath(basePath: string, path: string): string {
    return basePath ? `${basePath}${path}` : path;
}

export function createRouteFactory(basePath?: string): RouteFactory {
    const route = (path: string, description?: string): Route => ({
        path,
        toPath: (params?) => resolvePath(path, params),
        toUrl: (params?) => joinBasePath(basePath ?? '', resolvePath(path, params)),
        description,
    });
    return { route };
}

/** 默认路由工厂，使用 APP_BASENAME 作为外部 URL base path */
const { route } = createRouteFactory(APP_BASENAME);
export {route};
