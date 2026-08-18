/**
 * 应用名称类型
 */
type AppName = 'app';

/**
 * 获取应用名称
 */
const getAppName = (): AppName => {
    return 'app';
};

export const APP_NAME = getAppName();

const localHostnames = new Set(['localhost', '127.0.0.1', '::1']);
export const APP_IS_DEV = localHostnames.has(window.location.hostname);

export const APP_BASENAME = '/devops/cnap';

export const APP_HEADER_HEIGHT = '48px';

/** 是否在 iframe 中运行 */
export const APP_IS_IN_IFRAME = window.self !== window.top;

/** WebSocket 前缀 */
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const host = window.location.host;
export const APP_WEBSOCKET_PREFIX = `${protocol}://${host}`;

/** 线上生产环境标识 */
export const APP_IS_ONLINE_PRODUCTION = window.location.host === 'console.cloud.baidu-int.com';
