/**
 * 资源规格值对象：Quantity 与 ResourceSpec
 *
 * 收敛接口侧三套资源表示（数值 / 字符串 / Record），
 * 解析、格式化、单位拆拼与比较只实现一次。
 */

import type {ResourceQuota} from '@/interface/entities/workload';

/** 资源项类型 */
export type ResourceKind = 'cpu' | 'memory' | 'ephemeralStorage';

/** 各资源项的合法单位枚举 */
export const RESOURCE_UNITS: Record<ResourceKind, readonly string[]> = {
    cpu: ['c', 'nc'],
    memory: ['Mi', 'Gi', 'Ti'],
    ephemeralStorage: ['Mi', 'Gi', 'Ti'],
};

const RESOURCE_KINDS: ResourceKind[] = ['cpu', 'memory', 'ephemeralStorage'];

/** 单位换算因子（换算到各资源项的基准单位，用于比较） */
const UNIT_FACTORS: Record<ResourceKind, Record<string, number>> = {
    cpu: { nc: 1, c: 1_000_000_000 },
    memory: { Mi: 1, Gi: 1024, Ti: 1024 * 1024 },
    ephemeralStorage: { Mi: 1, Gi: 1024, Ti: 1024 * 1024 },
};

/** 资源数量值对象：接口原值 + 规范化数值 + 单位 */
export interface Quantity {
    raw: string;
    value: number;
    unit: string;
}

/** 一组资源规格（requests / limits / usages 复用同一结构） */
export interface ResourceSpec {
    cpu?: Quantity;
    memory?: Quantity;
    ephemeralStorage?: Quantity;
    /** 其他扩展资源（如 GPU），保持原始字符串 */
    others: Record<string, string>;
}

/** 将"数字+单位"字符串解析为 Quantity；无法解析时 value 为 NaN */
export function parseQuantity(raw: string): Quantity {
    const trimmed = (raw ?? '').trim();
    const match = trimmed.match(/^(-?\d+(?:\.\d+)?)(.*)$/);
    if (!match) {
        return { raw: trimmed, value: Number.NaN, unit: trimmed };
    }
    return { raw: trimmed, value: Number(match[1]), unit: match[2].trim() };
}

/** 将数值与单位拼接为字符串 */
export function formatQuantity(value: number, unit: string): string {
    return `${value}${unit}`;
}

/** 单位是否在该资源项的枚举内 */
export function isKnownUnit(kind: ResourceKind, unit: string): boolean {
    return RESOURCE_UNITS[kind].includes(unit);
}

/** 数值为正 */
export function isPositive(quantity?: Quantity): boolean {
    return !!quantity && !Number.isNaN(quantity.value) && quantity.value > 0;
}

/** 换算到基准单位；单位未知或不可解析时返回 NaN */
export function toBaseValue(kind: ResourceKind, quantity?: Quantity): number {
    if (!quantity || Number.isNaN(quantity.value)) {
        return Number.NaN;
    }
    const factor = UNIT_FACTORS[kind][quantity.unit];
    return factor === undefined ? Number.NaN : quantity.value * factor;
}

/**
 * 同资源项 Limit ≥ Request 校验。
 * 任一侧单位未知/不可比较时返回 true（降级：不阻塞，见需求 Open Question）。
 */
export function isLimitGteRequest(kind: ResourceKind, request?: Quantity, limit?: Quantity): boolean {
    const req = toBaseValue(kind, request);
    const lim = toBaseValue(kind, limit);
    if (Number.isNaN(req) || Number.isNaN(lim)) {
        return true;
    }
    return lim >= req;
}

/** 将接口 ResourceQuota 解析为 ResourceSpec（显示侧）。派生字段（cpuMilli/*Bytes）与 gpus 不进入 ResourceSpec */
export function toResourceSpec(record?: ResourceQuota): ResourceSpec {
    if (!record) {
        return { others: {} };
    }
    const spec: ResourceSpec = { others: {...record.others} };
    if (record.cpu !== undefined) {
        spec.cpu = parseQuantity(record.cpu);
    }
    if (record.memory !== undefined) {
        spec.memory = parseQuantity(record.memory);
    }
    if (record.ephemeralStorage !== undefined) {
        spec.ephemeralStorage = parseQuantity(record.ephemeralStorage);
    }
    return spec;
}

/** 将 ResourceSpec 序列化回接口 Record<string,string>（提交时使用） */
export function fromResourceSpec(spec: ResourceSpec): Record<string, string> {
    const record: Record<string, string> = { ...spec.others };
    for (const kind of RESOURCE_KINDS) {
        const quantity = spec[kind];
        if (quantity && !Number.isNaN(quantity.value)) {
            record[kind] = formatQuantity(quantity.value, quantity.unit);
        }
    }
    return record;
}
