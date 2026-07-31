import {route} from './create';

export const applications = route('/applications');
export const applicationOverview = route('/applications/{appId}/overview', '应用概览详情');
export const applicationDeployments = route('/applications/{appId}/deployments', '应用部署管理');
export const applicationSettings = route('/applications/{appId}/settings');
export const applicationRuntimeConfig = route('/applications/{appId}/runtime-config');
export const applicationStartupConfig = route('/applications/{appId}/startup-config');

export const serviceExposure = route('/service-exposure', '服务暴露');
export const logs = route('/logs', '日志');
export const terminal = route('/terminal', '终端');
export const monitor = route('/monitor', '监控');
export const appRuntimeConfig = route('/runtime-config', '运行配置');
export const appSettings = route('/application-settings', '应用设置');
