/* eslint-disable no-console */
/**
 * 集群相关能力
 */
import {router} from '@/routers';
import {clusterDetail} from '@/routes';
import type {Capability, CapabilityResult} from './types';
import {pollUntil, sleep} from './utils';

// 模拟集群状态存储（实际项目中应该是 API 调用）
const clusterStatusMap = new Map<string, string>();

// 模拟获取集群状态的 API
const mockGetClusterStatus = async (clusterId: string): Promise<string> => {
    return clusterStatusMap.get(clusterId) || 'unknown';
};

// 模拟创建集群的 API（异步操作，需要一段时间才能就绪）
const mockCreateCluster = async (_name: string): Promise<string> => {
    const clusterId = `cluster-${Date.now()}`;
    clusterStatusMap.set(clusterId, 'creating');

    // 模拟后台创建过程（3秒后变为 ready）
    setTimeout(() => {
        clusterStatusMap.set(clusterId, 'ready');
        console.log(`[Mock] 集群 ${clusterId} 创建完成`);
    }, 3000);

    return clusterId;
};

export const clusterCapabilities: Capability[] = [
    {
        name: 'listClusters',
        description: '获取集群列表',
        execute: async (): Promise<CapabilityResult> => {
            console.log('[Capability] listClusters');
            return { success: true, data: [] };
        },
    },
    {
        name: 'addCluster',
        description: '添加新集群（会等待集群就绪后返回）',
        params: {
            name: { type: 'string', description: '集群名称', required: true },
            provider: { type: 'string', description: '云服务商' },
        },
        execute: async (params): Promise<CapabilityResult> => {
            const { name, provider } = params as { name: string; provider?: string; };
            console.log(`[Capability] addCluster: ${name} (${provider || 'default'})`);

            // 1. 调用创建 API
            const clusterId = await mockCreateCluster(name);
            console.log(`[Capability] 集群 ${clusterId} 创建中...`);

            // 2. 等待集群就绪（内部轮询，最长等待 60 秒）
            await pollUntil(
                () => mockGetClusterStatus(clusterId),
                status => status === 'ready',
                {
                    timeout: 60000,
                    interval: 1000,
                    timeoutMessage: `集群 ${clusterId} 创建超时`,
                },
            );

            console.log(`[Capability] 集群 ${clusterId} 已就绪`);

            // 3. 返回结果
            return {
                success: true,
                data: { clusterId, name, status: 'ready' },
            };
        },
    },
    {
        name: 'deleteCluster',
        description: '删除集群（会等待删除完成后返回）',
        params: {
            clusterId: { type: 'string', description: '集群ID', required: true },
        },
        execute: async (params): Promise<CapabilityResult> => {
            const { clusterId } = params as { clusterId: string; };
            console.log(`[Capability] deleteCluster: ${clusterId}`);

            // 模拟删除过程
            clusterStatusMap.set(clusterId, 'deleting');
            await sleep(1500);
            clusterStatusMap.delete(clusterId);

            console.log(`[Capability] 集群 ${clusterId} 已删除`);
            window.dispatchEvent(new CustomEvent('capability:clusterDeleted', { detail: { clusterId } }));

            return { success: true };
        },
    },
    {
        name: 'viewCluster',
        description: '查看集群详情',
        params: {
            clusterId: { type: 'string', description: '集群ID', required: true },
        },
        execute: async (params): Promise<CapabilityResult> => {
            const { clusterId } = params as { clusterId: string; };
            console.log(`[Capability] viewCluster: ${clusterId}`);
            router.navigate(clusterDetail.toUrl({ clusterId }));
            return { success: true };
        },
    },
    {
        name: 'getClusterStatus',
        description: '获取集群状态',
        params: {
            clusterId: { type: 'string', description: '集群ID', required: true },
        },
        execute: async (params): Promise<CapabilityResult> => {
            const { clusterId } = params as { clusterId: string; };
            const status = await mockGetClusterStatus(clusterId);
            return { success: true, data: { clusterId, status } };
        },
    },
];
