/* eslint-disable no-console */
/**
 * 导航相关能力
 */
import {router} from '@/routers';
import {routes} from '@/routes';
import type {Capability, CapabilityResult} from './types';

const PAGE_MAP: Record<string, string> = {
    applications: routes.applications.toUrl(),
    clusters: routes.clusters.toUrl(),
    environments: routes.environments.toUrl(),
    settings: routes.settings.toUrl(),
    accounts: routes.accounts.toUrl(),
};

export const navigationCapabilities: Capability[] = [
    {
        name: 'navigateTo',
        description: '跳转到指定页面',
        params: {
            path: {
                type: 'string',
                description: '页面路径或名称（applications/clusters/environments/settings）',
                required: true,
            },
        },
        execute: async (params): Promise<CapabilityResult> => {
            const { path } = params as { path: string; };
            const targetPath = PAGE_MAP[path] || path;
            console.log(`[Capability] navigateTo: ${targetPath}`);
            router.navigate(targetPath);
            return { success: true, data: { path: targetPath } };
        },
    },
    {
        name: 'goBack',
        description: '返回上一页',
        execute: async (): Promise<CapabilityResult> => {
            console.log('[Capability] goBack');
            router.navigate(-1);
            return { success: true };
        },
    },
];
