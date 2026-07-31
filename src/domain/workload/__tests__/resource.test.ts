import {describe, expect, it} from 'vitest';

import type {ResourceQuota} from '@/interface/entities/workload';

import {
    formatQuantity,
    fromResourceSpec,
    isKnownUnit,
    isLimitGteRequest,
    isPositive,
    parseQuantity,
    toBaseValue,
    toResourceSpec,
} from '../resource';

describe('parseQuantity', () => {
    it('splits number and unit', () => {
        expect(parseQuantity('64c')).toEqual({ raw: '64c', value: 64, unit: 'c' });
        expect(parseQuantity('16Gi')).toEqual({ raw: '16Gi', value: 16, unit: 'Gi' });
    });

    it('handles value without unit', () => {
        expect(parseQuantity('960')).toEqual({ raw: '960', value: 960, unit: '' });
    });

    it('marks unparseable input as NaN', () => {
        expect(parseQuantity('').value).toBeNaN();
        expect(parseQuantity('abc').value).toBeNaN();
    });
});

describe('formatQuantity / isKnownUnit / isPositive', () => {
    it('joins value and unit', () => {
        expect(formatQuantity(64, 'c')).toBe('64c');
    });

    it('validates unit against enum', () => {
        expect(isKnownUnit('cpu', 'c')).toBe(true);
        expect(isKnownUnit('cpu', 'm')).toBe(false);
        expect(isKnownUnit('memory', 'Gi')).toBe(true);
        expect(isKnownUnit('ephemeralStorage', 'Mi')).toBe(true);
        expect(isKnownUnit('ephemeralStorage', 'Ti')).toBe(true);
    });

    it('checks positivity', () => {
        expect(isPositive(parseQuantity('4c'))).toBe(true);
        expect(isPositive(parseQuantity('0c'))).toBe(false);
        expect(isPositive(parseQuantity(''))).toBe(false);
    });
});

describe('toResourceSpec / fromResourceSpec', () => {
    it('parses known keys and keeps others', () => {
        const spec = toResourceSpec({
            cpu: '64c',
            memory: '16Gi',
            ephemeralStorage: '100Gi',
            others: {'nvidia.com/gpu': '2'},
        });
        expect(spec.cpu).toEqual({ raw: '64c', value: 64, unit: 'c' });
        expect(spec.memory?.unit).toBe('Gi');
        expect(spec.others).toEqual({'nvidia.com/gpu': '2'});
    });

    it('drops derived fields (cpuMilli / *Bytes) and gpus', () => {
        const spec = toResourceSpec({
            cpu: '64c',
            cpuMilli: '64000',
            memory: '16Gi',
            memoryBytes: '17179869184',
            ephemeralStorage: '100Gi',
            ephemeralStorageBytes: '107374182400',
            gpus: [{ vendor: 'NVIDIA', model: 'T4', profile: '16GB', count: 1 }],
        });
        expect(spec.cpu).toEqual({ raw: '64c', value: 64, unit: 'c' });
        expect(spec.others).toEqual({});
        // 派生字段与 gpus 不应泄漏进 others
        expect('cpuMilli' in spec.others).toBe(false);
        expect('gpus' in spec.others).toBe(false);
    });

    it('round-trips ResourceQuota → ResourceSpec → Record', () => {
        const input: ResourceQuota = { cpu: '64c', memory: '16Gi', others: {'nvidia.com/gpu': '2'} };
        const output = fromResourceSpec(toResourceSpec(input));
        expect(output).toEqual({ cpu: '64c', memory: '16Gi', 'nvidia.com/gpu': '2' });
    });

    it('returns empty spec for undefined record', () => {
        expect(toResourceSpec(undefined)).toEqual({ others: {} });
    });
});

describe('toBaseValue / isLimitGteRequest', () => {
    it('converts memory units to a common base', () => {
        expect(toBaseValue('memory', parseQuantity('1Gi'))).toBe(1024);
        expect(toBaseValue('memory', parseQuantity('1Ti'))).toBe(1024 * 1024);
    });

    it('compares limit and request across units', () => {
        expect(isLimitGteRequest('memory', parseQuantity('512Mi'), parseQuantity('1Gi'))).toBe(true);
        expect(isLimitGteRequest('memory', parseQuantity('2Gi'), parseQuantity('1Gi'))).toBe(false);
    });

    it('compares same-unit cpu', () => {
        expect(isLimitGteRequest('cpu', parseQuantity('4c'), parseQuantity('4c'))).toBe(true);
        expect(isLimitGteRequest('cpu', parseQuantity('8c'), parseQuantity('4c'))).toBe(false);
    });

    it('compares ephemeralStorage across units', () => {
        expect(toBaseValue('ephemeralStorage', parseQuantity('1Gi'))).toBe(1024);
        expect(isLimitGteRequest('ephemeralStorage', parseQuantity('512Mi'), parseQuantity('1Gi'))).toBe(true);
        expect(isLimitGteRequest('ephemeralStorage', parseQuantity('2Gi'), parseQuantity('1Gi'))).toBe(false);
    });

    it('does not block when a unit is unknown (downgrade)', () => {
        expect(isLimitGteRequest('cpu', parseQuantity('500m'), parseQuantity('1c'))).toBe(true);
    });
});
