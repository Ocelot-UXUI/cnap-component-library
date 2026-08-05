/** 资源用量展示（纯逻辑）：百分比与空值占位。 */

import {isNumber} from "lodash";

const HIGH_LOAD_PCT = 80;

export function isUsageValid(usage?: string, limit?: string): boolean {
    return isNumber(usage) && isNumber(limit);
}

/**
 * 用量百分比：直接吃后端预派生的无单位字段（cpuMilli / memoryBytes / ephemeralStorageBytes）。
 * 任一缺失或非数值或分母 ≤ 0 返回 undefined；结果保留两位小数。
 */
export function usagePercent(usage?: string, limit?: string): number | undefined {
    const u = usage !== undefined ? Number(usage) : NaN;
    const l = limit !== undefined ? Number(limit) : NaN;
    if (!Number.isFinite(u) || !Number.isFinite(l) || l <= 0) {
        return undefined;
    }
    return Math.round((u / l) * 10000) / 100;
}

/** 空值占位；显示侧原样渲染带单位字符串，不做合法性解析 */
export const formatCpu = (value?: string) => value ?? '-';
export const formatMemory = (value?: string) => value ?? '-';

export function isHighLoad(percent?: number): boolean {
    return percent !== undefined && percent >= HIGH_LOAD_PCT;
}
