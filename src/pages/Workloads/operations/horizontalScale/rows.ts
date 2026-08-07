/**
 * 横向扩缩表格行状态与联动（纯逻辑，可测）。
 *
 * 相比纵向扩缩仅一项可编辑字段「期望副本数」，无 Req/Lim 配对与单位。
 */

import type {HorizontalScaleTarget} from '@/api/runtimeOperation';
import type {RuntimeWorkload} from '@/interface/entities/workload';

export interface HorizontalRow {
    key: string;
    clusterId: string;
    resourceType?: string;
    name: string;
    clusterName: string;
    selected: boolean;
    /** 当前副本数（只读） */
    replicas: number;
    /** 期望副本数输入值（字符串，便于校验空值/非法值） */
    desired: string;
    maxUnavailable: string;
    availabilityTarget: string;
}

/** 构建表格行（每集群一行）；期望副本数默认取当前副本数、集群默认未选中 */
export function buildRows(workloads: RuntimeWorkload[]): HorizontalRow[] {
    return workloads
        .map(w => ({
            key: w.clusterId,
            clusterId: w.clusterId,
            resourceType: w.resourceType,
            name: w.name,
            clusterName: w.clusterName,
            selected: false,
            replicas: w.replicas,
            desired: String(w.replicas),
            maxUnavailable: w.updateStrategy?.maxUnavailable ?? '',
            availabilityTarget: w.availabilityTarget ?? '',
        }));
}

function mapRow(rows: HorizontalRow[], key: string, fn: (row: HorizontalRow) => HorizontalRow): HorizontalRow[] {
    return rows.map(row => (row.key === key ? fn(row) : row));
}

/** 选中/取消选中集群；取消选中时期望副本数回滚为最初值（当前副本数） */
export function toggleCluster(rows: HorizontalRow[], key: string): HorizontalRow[] {
    return mapRow(rows, key, row => {
        const selected = !row.selected;
        return {
            ...row,
            selected,
            desired: selected ? row.desired : String(row.replicas),
        };
    });
}

/** 编辑期望副本数；修改未选中集群时自动选中该集群 */
export function editDesired(rows: HorizontalRow[], key: string, desired: string): HorizontalRow[] {
    return mapRow(rows, key, row => ({ ...row, desired, selected: true }));
}

/** 期望副本数校验：正整数（≥1），无上限 */
export function isDesiredValid(desired: string): boolean {
    return /^[1-9]\d*$/.test(desired);
}

export function isRowValid(row: HorizontalRow): boolean {
    return isDesiredValid(row.desired);
}

/** 至少选中一个集群且所有选中行合法 */
export function canSubmit(rows: HorizontalRow[]): boolean {
    const selected = rows.filter(row => row.selected);
    return selected.length > 0 && selected.every(isRowValid);
}

/** 选中行 → horizontalScale() targets 入参（容器仅过滤表格，不入 API） */
export function toHorizontalScaleTargets(rows: HorizontalRow[]): HorizontalScaleTarget[] {
    return rows
        .filter(row => row.selected)
        .map(row => ({
            clusterId: row.clusterId,
            resourceType: row.resourceType,
            name: row.name,
            replicas: Number(row.desired),
        }));
}
