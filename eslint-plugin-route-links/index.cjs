/**
 * eslint-plugin-route-links
 * 本地 ESLint 插件：统一路由链接管理
 */
const noDirectRouteImport = require('./rules/no-direct-route-import.cjs');
const noHardcodedRouteUrl = require('./rules/no-hardcoded-route-url.cjs');

module.exports = {
    rules: {
        'no-direct-route-import': noDirectRouteImport,
        'no-hardcoded-route-url': noHardcodedRouteUrl,
    },
};
