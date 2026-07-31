import {describe, expect, it} from 'vitest';

import {
    formatCpu,
    formatMemory,
    isHighLoad,
    usagePercent,
} from '../resourceUsage';

describe('resourceUsage', () => {
    it('formats value or falls back to dash', () => {
        expect(formatCpu('64c')).toBe('64c');
        expect(formatCpu(undefined)).toBe('-');
        expect(formatMemory('32Gi')).toBe('32Gi');
        expect(formatMemory(undefined)).toBe('-');
    });

    it('computes usage percent from unit-less numeric strings', () => {
        expect(usagePercent('500', '1000')).toBe(50);
        expect(usagePercent('500', '250')).toBe(200);
        expect(usagePercent('1', '3')).toBe(33.33);
        expect(usagePercent('1', '7')).toBe(14.29);
        expect(usagePercent(undefined, '1000')).toBeUndefined();
        expect(usagePercent('500', undefined)).toBeUndefined();
        expect(usagePercent('500', '0')).toBeUndefined();
        expect(usagePercent('abc', '1000')).toBeUndefined();
        expect(isHighLoad(85)).toBe(true);
        expect(isHighLoad(50)).toBe(false);
        expect(isHighLoad(undefined)).toBe(false);
    });
});
