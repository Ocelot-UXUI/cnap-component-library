/** 资源用量展示（纯逻辑）：quantity 格式化、解析与使用率。 */

const HIGH_LOAD_PCT = 80;
const CPU_FACTORS: Record<string, number> = {
    n: 1e-9,
    nc: 1e-9,
    u: 1e-6,
    uc: 1e-6,
    m: 1e-3,
    mc: 1e-3,
    c: 1,
    '': 1,
};
const BYTE_FACTORS: Record<string, number> = {
    '': 1,
    K: 1e3,
    M: 1e6,
    G: 1e9,
    T: 1e12,
    P: 1e15,
    E: 1e18,
    Ki: 1024,
    Mi: 1024 ** 2,
    Gi: 1024 ** 3,
    Ti: 1024 ** 4,
    Pi: 1024 ** 5,
    Ei: 1024 ** 6,
};

function parseQuantity(value: string | undefined, factors: Record<string, number>): number | undefined {
    const match = value?.trim().match(/^([+]?(?:\d+(?:\.\d+)?|\.\d+))([a-zA-Z]*)$/);
    if (!match || factors[match[2]] === undefined) {
        return undefined;
    }
    const result = Number(match[1]) * factors[match[2]];
    return Number.isFinite(result) ? result : undefined;
}

export const parseCpu = (value?: string) => parseQuantity(value, CPU_FACTORS);
export const parseBytes = (value?: string) => parseQuantity(value, BYTE_FACTORS);

export function formatCpu(value?: string): string {
    return parseCpu(value) === undefined ? '-' : value!.trim();
}

export function formatMemory(value?: string): string {
    return parseBytes(value) === undefined ? '-' : value!.trim();
}

export function usagePercent(
    usage: string | undefined,
    limit: string | undefined,
    parse: (value?: string) => number | undefined,
): number | undefined {
    const usageValue = parse(usage);
    const limitValue = parse(limit);
    if (usageValue === undefined || limitValue === undefined || limitValue <= 0) {
        return undefined;
    }
    return Math.round((usageValue / limitValue) * 100);
}

export function isHighLoad(percent?: number): boolean {
    return percent !== undefined && percent >= HIGH_LOAD_PCT;
}
