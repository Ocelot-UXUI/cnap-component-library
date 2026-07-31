import {describe, expect, it} from 'vitest';

import {
    formatCpu,
    formatMemory,
    isHighLoad,
    parseBytes,
    parseCpu,
    usagePercent,
} from '../resourceUsage';

describe('resourceUsage', () => {
    it('formats valid quantities and rejects invalid values', () => {
        expect(formatCpu('7200m')).toBe('7200m');
        expect(formatCpu('4.8nc')).toBe('4.8nc');
        expect(formatMemory('32Gi')).toBe('32Gi');
        expect(formatMemory('-1Gi')).toBe('-');
        expect(formatMemory(undefined)).toBe('-');
    });

    it('computes usage percent across compatible units', () => {
        expect(parseCpu('500m')).toBe(0.5);
        expect(parseCpu('1000u')).toBe(0.001);
        expect(parseCpu('4.8nc')).toBe(4.8e-9);
        expect(parseBytes('2Gi')).toBe(2 * 1024 ** 3);
        expect(parseBytes('1G')).toBe(1e9);
        expect(usagePercent('500m', '1c', parseCpu)).toBe(50);
        expect(usagePercent('2Gi', '1Gi', parseBytes)).toBe(200);
        expect(usagePercent('0', '0', parseBytes)).toBeUndefined();
        expect(isHighLoad(85)).toBe(true);
        expect(isHighLoad(50)).toBe(false);
        expect(isHighLoad(undefined)).toBe(false);
    });
});
