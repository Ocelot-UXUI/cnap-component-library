import {PRIMARY_NAV_VISIBLE_ORDER} from '@/constants/localStorage';

function normalizeStoredOrder(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter((item): item is string => typeof item === 'string');
}

export function readPrimaryNavVisibleOrder(): string[] {
    try {
        const value = window.localStorage.getItem(PRIMARY_NAV_VISIBLE_ORDER);
        return value ? normalizeStoredOrder(JSON.parse(value)) : [];
    } catch {
        return [];
    }
}

export function writePrimaryNavVisibleOrder(order: string[]): void {
    try {
        window.localStorage.setItem(PRIMARY_NAV_VISIBLE_ORDER, JSON.stringify(order));
    } catch {
        return;
    }
}
