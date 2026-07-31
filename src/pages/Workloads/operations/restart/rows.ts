/**
 * 重启表格行状态与联动（纯逻辑，可测）。
 *
 * 可编辑字段为「最大不可用」（百分比）；容器选择器值在提交时入 API。
 */

import type {RestartTarget} from '@/api/runtimeOperation';
import type {RuntimeWorkload} from '@/interface/entities/workload';

export interface RestartRow {
    key: string;
    clusterId: string;
    resourceType?: string;
    name: string;
    clusterName: string;
    selected: boolean;
    /** 最大不可用百分比数值（不含 %），可编辑 */
    maxUnavailable: string;
    /** 原始最大不可用值，取消选中时回滚 */
    originalMaxUnavailable: string;
    /** 最大可超出（只读） */
    maxSurge: string;
    availabilityTarget: string;
}

/** 去除百分号，仅保留数值部分 */
function stripPercent(value: string): string {
    return (value ?? '').replace('%', '').trim();
}

/** 以选中容器过滤 Workload 并构建表格行；集群默认未选中 */
export function buildRows(workloads: RuntimeWorkload[], container?: string): RestartRow[] {
    return workloads
        .filter(w => !container || w.podContainers.some(c => c.name === container))
        .map(w => {
            const maxUnavailable = stripPercent(w.updateStrategy?.maxUnavailable ?? '');
            return {
                key: w.clusterId,
                clusterId: w.clusterId,
                resourceType: w.resourceType,
                name: w.name,
                clusterName: w.clusterName,
                selected: false,
                maxUnavailable,
                originalMaxUnavailable: maxUnavailable,
                maxSurge: w.updateStrategy?.maxSurge ?? '',
                availabilityTarget: w.availabilityTarget ?? '',
            };
        });
}

function mapRow(rows: RestartRow[], key: string, fn: (row: RestartRow) => RestartRow): RestartRow[] {
    return rows.map(row => (row.key === key ? fn(row) : row));
}

/** 选中/取消选中集群；取消选中时最大不可用回滚为原始值 */
export function toggleCluster(rows: RestartRow[], key: string): RestartRow[] {
    return mapRow(rows, key, row => {
        const selected = !row.selected;
        return {
            ...row,
            selected,
            maxUnavailable: selected ? row.maxUnavailable : row.originalMaxUnavailable,
        };
    });
}

/** 编辑最大不可用；修改未选中集群时自动选中该集群 */
export function editMaxUnavailable(rows: RestartRow[], key: string, value: string): RestartRow[] {
    return mapRow(rows, key, row => ({ ...row, maxUnavailable: value, selected: true }));
}

/** 最大不可用校验：整数，1~100 */
export function isMaxUnavailableValid(value: string): boolean {
    if (!/^\d+$/.test(value)) {
        return false;
    }
    const num = Number(value);
    return num >= 1 && num <= 100;
}

/** 超时时间校验：整数，5~3600 */
export function isTimeoutValid(value: string): boolean {
    if (!/^\d+$/.test(value)) {
        return false;
    }
    const num = Number(value);
    return num >= 5 && num <= 3600;
}

export function isRowValid(row: RestartRow): boolean {
    return isMaxUnavailableValid(row.maxUnavailable);
}

/** 至少选中一个集群且所有选中行合法 */
export function canSubmitRows(rows: RestartRow[]): boolean {
    const selected = rows.filter(row => row.selected);
    return selected.length > 0 && selected.every(isRowValid);
}

/** 选中行 → restartWorkload() targets 入参（容器入 API） */
export function toRestartTargets(rows: RestartRow[], container?: string): RestartTarget[] {
    return rows
        .filter(row => row.selected)
        .map(row => ({
            clusterId: row.clusterId,
            resourceType: row.resourceType,
            name: row.name,
            container,
            maxUnavailable: `${row.maxUnavailable}%`,
        }));
}
