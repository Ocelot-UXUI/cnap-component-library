/* eslint-disable no-console */
/**
 * 环境相关能力
 */
import {router} from '@/routers';
import {environmentDetail} from '@/routes';
import type {Capability, CapabilityResult} from './types';

export const environmentCapabilities: Capability[] = [
    {
        name: 'listEnvironments',
        description: '获取环境列表',
        execute: async (): Promise<CapabilityResult> => {
            console.log('[Capability] listEnvironments');
            return { success: true, data: [] };
        },
    },
    {
        name: 'createEnvironment',
        description: '创建新环境',
        params: {
            name: { type: 'string', description: '环境名称', required: true },
            type: { type: 'string', description: '环境类型（dev/staging/prod）' },
        },
        execute: async (params): Promise<CapabilityResult> => {
            const { name, type } = params as { name: string; type?: string; };
            console.log(`[Capability] createEnvironment: ${name} (${type || 'dev'})`);
            return { success: true, data: { envId: `env-${Date.now()}`, name } };
        },
    },
    {
        name: 'deleteEnvironment',
        description: '删除环境',
        params: {
            envId: { type: 'string', description: '环境ID', required: true },
        },
        execute: async (params): Promise<CapabilityResult> => {
            const { envId } = params as { envId: string; };
            console.log(`[Capability] deleteEnvironment: ${envId}`);
            window.dispatchEvent(new CustomEvent('capability:envDeleted', { detail: { envId } }));
            return { success: true };
        },
    },
    {
        name: 'viewEnvironment',
        description: '查看环境详情',
        params: {
            envId: { type: 'string', description: '环境ID', required: true },
        },
        execute: async (params): Promise<CapabilityResult> => {
            const { envId } = params as { envId: string; };
            console.log(`[Capability] viewEnvironment: ${envId}`);
            router.navigate(environmentDetail.toUrl({ envId }));
            return { success: true };
        },
    },
];
