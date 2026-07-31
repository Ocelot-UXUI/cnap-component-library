/**
 * AI 能力层统一导出
 */
import {applicationCapabilities} from './application';
import {clusterCapabilities} from './cluster';
import {environmentCapabilities} from './environment';
import {navigationCapabilities} from './navigation';
import type {Capability, CapabilityDescription} from './types';

// 导出类型
export type {Capability, CapabilityDescription, CapabilityParam, CapabilityResult} from './types';

/**
 * 所有能力列表
 */
export const allCapabilities: Capability[] = [
    ...applicationCapabilities,
    ...clusterCapabilities,
    ...environmentCapabilities,
    ...navigationCapabilities,
];

/**
 * 能力映射表，用于快速查找
 */
export const capabilityMap = new Map<string, Capability>(
    allCapabilities.map(cap => [cap.name, cap]),
);

/**
 * 获取能力描述列表（用于传递给 AI 上下文）
 */
export const getCapabilityDescriptions = (): CapabilityDescription[] => {
    return allCapabilities.map(({ name, description, params }) => ({
        name,
        description,
        params,
    }));
};

/**
 * 执行能力
 */
export const executeCapability = async (
    name: string,
    params?: Record<string, unknown>,
): Promise<unknown> => {
    const capability = capabilityMap.get(name);
    if (!capability) {
        throw new Error(`Capability not found: ${name}`);
    }
    // eslint-disable-next-line no-return-await
    return await capability.execute(params || {});
};
