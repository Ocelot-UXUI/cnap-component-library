/**
 * 纵向扩缩表格行状态与联动（纯逻辑，可测）。
 *
 * 集群选中 ↔ 资源项启用、Limit ↔ Req 同步、容器切换重置等联动规则集中在此，
 * 由 machine 以 assign 调用；不依赖 React。
 */

import type {ResourceKind, ResourceRef, ResourceSpec, VerticalScaleRow} from '@/domain/workload';
import {isLimitGteRequest, isPositive, parseQuantity, toContainerResourceSpecs, toResourceRef} from '@/domain/workload';
import type {RuntimeWorkload} from '@/interface/entities/workload';

const RESOURCE_KINDS: ResourceKind[] = ['cpu', 'memory', 'ephemeralStorage'];
const DEFAULT_UNITS: Record<ResourceKind, string> = { cpu: 'c', memory: 'Gi', ephemeralStorage: 'Gi' };

export interface FieldState {
    value: string;
    unit: string;
}

export interface PairState {
    req: FieldState;
    lim: FieldState & { enabled: boolean; };
}

export interface RowState {
    key: string;
    ref: ResourceRef;
    clusterName: string;
    selected: boolean;
    cpu: PairState;
    memory: PairState;
    ephemeralStorage: PairState;
    maxUnavailable: string;
    maxSurge: string;
    availabilityTarget: string;
}

function toField(spec: ResourceSpec, kind: ResourceKind): FieldState {
    const quantity = spec[kind];
    if (!quantity || Number.isNaN(quantity.value)) {
        return { value: '', unit: DEFAULT_UNITS[kind] };
    }
    return { value: String(quantity.value), unit: quantity.unit || DEFAULT_UNITS[kind] };
}

function toPair(requests: ResourceSpec, limits: ResourceSpec, kind: ResourceKind): PairState {
    return {
        req: toField(requests, kind),
        lim: { ...toField(limits, kind), enabled: false },
    };
}

/** 以选中容器过滤 Workload 并构建表格行；集群默认未选中、资源项禁用 */
export function buildRows(workloads: RuntimeWorkload[], container?: string): RowState[] {
    return workloads
        .filter(w => !container || w.podContainers.some(c => c.name === container))
        .map(w => {
            const target = w.podContainers.find(c => c.name === container) ?? w.podContainers[0];
            const { requests, limits } = toContainerResourceSpecs(
                target ?? { name: '', resourceLimits: {}, resourceRequests: {} },
            );
            return {
                key: w.clusterId,
                ref: toResourceRef(w),
                clusterName: w.clusterName,
                selected: false,
                cpu: toPair(requests, limits, 'cpu'),
                memory: toPair(requests, limits, 'memory'),
                ephemeralStorage: toPair(requests, limits, 'ephemeralStorage'),
                maxUnavailable: w.updateStrategy?.maxUnavailable ?? '',
                maxSurge: w.updateStrategy?.maxSurge ?? '',
                availabilityTarget: w.availabilityTarget ?? '',
            };
        });
}

function mapRow(rows: RowState[], key: string, fn: (row: RowState) => RowState): RowState[] {
    return rows.map(row => (row.key === key ? fn(row) : row));
}

/** 选中/取消选中集群：选中→启用资源项且 Lim 自动勾选取 Req 值；取消→Lim 同步 Req 并取消勾选 */
export function toggleCluster(rows: RowState[], key: string): RowState[] {
    return mapRow(rows, key, row => {
        const selected = !row.selected;
        const apply = (pair: PairState): PairState => ({
            req: pair.req,
            lim: { ...pair.req, enabled: selected },
        });
        return {
            ...row,
            selected,
            cpu: apply(row.cpu),
            memory: apply(row.memory),
            ephemeralStorage: apply(row.ephemeralStorage),
        };
    });
}

/** 手动切换某资源项 Limit 复选框（仅集群已选中时生效）；取消时 Lim 同步 Req */
export function toggleLimit(rows: RowState[], key: string, kind: ResourceKind): RowState[] {
    return mapRow(rows, key, row => {
        if (!row.selected) {
            return row;
        }
        const pair = row[kind];
        const enabled = !pair.lim.enabled;
        return {
            ...row,
            [kind]: { req: pair.req, lim: enabled ? { ...pair.lim, enabled } : { ...pair.req, enabled } },
        };
    });
}

/** 编辑数值/单位；编辑 Req 时若 Lim 未勾选则 Lim 镜像 Req */
export function editField(
    rows: RowState[],
    key: string,
    kind: ResourceKind,
    side: 'req' | 'lim',
    patch: Partial<FieldState>,
): RowState[] {
    return mapRow(rows, key, row => {
        const pair = row[kind];
        if (side === 'req') {
            const req = { ...pair.req, ...patch };
            const lim = pair.lim.enabled ? pair.lim : { ...req, enabled: false };
            return { ...row, [kind]: { req, lim } };
        }
        return { ...row, [kind]: { req: pair.req, lim: { ...pair.lim, ...patch } } };
    });
}

function isPairValid(kind: ResourceKind, pair: PairState): boolean {
    // 该资源项未配置（接口未返回对应值）时跳过校验，不参与提交
    if (pair.req.value === '') {
        return true;
    }
    const req = parseQuantity(`${pair.req.value}${pair.req.unit}`);
    if (!isPositive(req)) {
        return false;
    }
    if (!pair.lim.enabled) {
        return true;
    }
    const lim = parseQuantity(`${pair.lim.value}${pair.lim.unit}`);
    return isPositive(lim) && isLimitGteRequest(kind, req, lim);
}

export function isRowValid(row: RowState): boolean {
    return RESOURCE_KINDS.every(kind => isPairValid(kind, row[kind]));
}

/** 至少选中一个集群且所有选中行合法 */
export function canSubmit(rows: RowState[]): boolean {
    const selected = rows.filter(row => row.selected);
    return selected.length > 0 && selected.every(isRowValid);
}

function toSpec(row: RowState, side: 'req' | 'lim'): ResourceSpec {
    const spec: ResourceSpec = { others: {} };
    for (const kind of RESOURCE_KINDS) {
        const field = side === 'req' ? row[kind].req : row[kind].lim;
        if (field.value !== '') {
            spec[kind] = { raw: `${field.value}${field.unit}`, value: Number(field.value), unit: field.unit };
        }
    }
    return spec;
}

/** 选中行 → 领域写模型入参（供 buildVerticalScaleCommand） */
export function toVerticalScaleRows(rows: RowState[], container?: string): VerticalScaleRow[] {
    return rows
        .filter(row => row.selected)
        .map(row => ({ ref: row.ref, container, requests: toSpec(row, 'req'), limits: toSpec(row, 'lim') }));
}
