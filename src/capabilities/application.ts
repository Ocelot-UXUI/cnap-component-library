/**
 * 应用相关能力
 */
import {router} from '@/routers';
import {applicationOverview, applicationSettings} from '@/routes';
import type {Capability, CapabilityResult} from './types';
import {pollUntil} from './utils';

// 模拟部署状态存储
const deploymentStatusMap = new Map<string, string>();

// 模拟获取部署状态
const mockGetDeploymentStatus = async (deploymentId: string): Promise<string> => {
    return deploymentStatusMap.get(deploymentId) || 'unknown';
};

// 模拟部署 API
const mockDeploy = async (_appId: string, _envId?: string): Promise<string> => {
    const deploymentId = `deploy-${Date.now()}`;
    deploymentStatusMap.set(deploymentId, 'deploying');

    // 模拟部署过程（2秒后完成）
    setTimeout(() => {
        deploymentStatusMap.set(deploymentId, 'success');
        console.log(`[Mock] 部署 ${deploymentId} 完成`);
    }, 2000);

    return deploymentId;
};

export const applicationCapabilities: Capability[] = [
    {
        name: 'listApplications',
        description: '获取当前用户的应用列表',
        execute: async (): Promise<CapabilityResult> => {
            console.log('[Capability] listApplications');
            return { success: true, data: [] };
        },
    },
    {
        name: 'deployApplication',
        description: '部署应用到指定环境（会等待部署完成后返回）',
        params: {
            appId: { type: 'string', description: '应用ID', required: true },
            envId: { type: 'string', description: '目标环境ID' },
        },
        execute: async (params): Promise<CapabilityResult> => {
            const { appId, envId } = params as { appId: string; envId?: string; };
            console.log(`[Capability] deployApplication: ${appId} -> ${envId || 'default'}`);

            // 1. 发起部署
            const deploymentId = await mockDeploy(appId, envId);
            console.log(`[Capability] 部署 ${deploymentId} 进行中...`);

            // 2. 等待部署完成（最长 5 分钟）
            const finalStatus = await pollUntil(
                () => mockGetDeploymentStatus(deploymentId),
                status => status === 'success' || status === 'failed',
                {
                    timeout: 300000,
                    interval: 2000,
                    timeoutMessage: `部署 ${deploymentId} 超时`,
                },
            );

            if (finalStatus === 'failed') {
                return { success: false, error: '部署失败' };
            }

            console.log(`[Capability] 部署 ${deploymentId} 完成`);
            window.dispatchEvent(new CustomEvent('capability:deployed', { detail: { appId, envId, deploymentId } }));

            return {
                success: true,
                data: { appId, envId, deploymentId, status: 'success' },
            };
        },
    },
    {
        name: 'getDeploymentStatus',
        description: '获取部署状态',
        params: {
            deploymentId: { type: 'string', description: '部署ID', required: true },
        },
        execute: async (params): Promise<CapabilityResult> => {
            const { deploymentId } = params as { deploymentId: string; };
            const status = await mockGetDeploymentStatus(deploymentId);
            return { success: true, data: { deploymentId, status } };
        },
    },
    {
        name: 'configApplication',
        description: '打开应用配置页面',
        params: {
            appId: { type: 'string', description: '应用ID', required: true },
        },
        execute: async (params): Promise<CapabilityResult> => {
            const { appId } = params as { appId: string; };
            console.log(`[Capability] configApplication: ${appId}`);
            router.navigate(applicationSettings.toUrl({ appId }));
            return { success: true };
        },
    },
    {
        name: 'viewApplication',
        description: '查看应用详情',
        params: {
            appId: { type: 'string', description: '应用ID', required: true },
        },
        execute: async (params): Promise<CapabilityResult> => {
            const { appId } = params as { appId: string; };
            console.log(`[Capability] viewApplication: ${appId}`);
            router.navigate(applicationOverview.toUrl({ appId }));
            return { success: true };
        },
    },
];
