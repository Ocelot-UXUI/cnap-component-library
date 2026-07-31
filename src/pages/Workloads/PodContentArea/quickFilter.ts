/**
 * 快捷筛选（纯逻辑）：全部 / 正常 / 异常 / 已屏蔽 与 Pod 状态/屏蔽参数、计数的映射。
 */

import type {PodStatistics} from '@/interface/entities/runtimeSummary';
import {isNormalStatus, NORMAL_STATUSES} from './podStatus';

export type QuickFilterKey = 'all' | 'normal' | 'abnormal' | 'blocked';

export interface QuickFilterCounts {
    all: number;
    normal: number;
    abnormal: number;
    blocked: number;
}

/**
 * 快捷筛选 → Pod 状态 Select 值集合。
 * - all：清空（不过滤状态）
 * - normal：正常状态集合
 * - abnormal：可选状态中"非正常"的全部（依据线上出现的状态）
 * - blocked：不改状态维度（仅设 blocked），返回空
 */
export function quickFilterStatusValues(key: QuickFilterKey, availableStatuses: string[]): string[] {
    switch (key) {
        case 'normal':
            return availableStatuses.length
                ? availableStatuses.filter(isNormalStatus)
                : [...NORMAL_STATUSES];
        case 'abnormal':
            return availableStatuses.filter(status => !isNormalStatus(status));
        case 'all':
        case 'blocked':
        default:
            return [];
    }
}

/** 快捷筛选 → blocked 参数（仅"已屏蔽"设 true，其余不约束） */
export function quickFilterBlocked(key: QuickFilterKey): boolean | undefined {
    return key === 'blocked' ? true : undefined;
}

/** 由全局 summary 计算四个快捷筛选计数 */
export function computeQuickCounts(summary: PodStatistics): QuickFilterCounts {
    const normal = summary.statuses
        .filter(item => isNormalStatus(item.status))
        .reduce((sum, item) => sum + item.count, 0);
    return {
        all: summary.totalCount,
        normal,
        abnormal: summary.totalCount - normal,
        blocked: summary.blockedCount,
    };
}
