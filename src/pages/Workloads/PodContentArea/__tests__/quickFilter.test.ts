import {describe, expect, it} from 'vitest';

import type {PodStatistics} from '@/interface/entities/runtimeSummary';
import {computeQuickCounts, quickFilterBlocked, quickFilterStatusValues} from '../quickFilter';

const available = [
    'Running Ready',
    'Completed',
    'Terminating',
    'Running InPlaceUpdateNotReady',
    'CrashLoopBackOff',
    'Pending',
];

describe('quickFilterStatusValues', () => {
    it('all → empty (no status filter)', () => {
        expect(quickFilterStatusValues('all', available)).toEqual([]);
    });

    it('normal → only normal statuses among available', () => {
        expect(quickFilterStatusValues('normal', available)).toEqual([
            'Running Ready',
            'Completed',
            'Terminating',
            'Running InPlaceUpdateNotReady',
        ]);
    });

    it('abnormal → only non-normal statuses among available', () => {
        expect(quickFilterStatusValues('abnormal', available)).toEqual(['CrashLoopBackOff', 'Pending']);
    });

    it('blocked → empty status set (only blocked param)', () => {
        expect(quickFilterStatusValues('blocked', available)).toEqual([]);
    });

    it('normal falls back to canonical set when no available statuses', () => {
        expect(quickFilterStatusValues('normal', [])).toContain('Running Ready');
    });
});

describe('quickFilterBlocked', () => {
    it('only blocked sets true', () => {
        expect(quickFilterBlocked('blocked')).toBe(true);
        expect(quickFilterBlocked('all')).toBeUndefined();
        expect(quickFilterBlocked('normal')).toBeUndefined();
    });
});

describe('computeQuickCounts', () => {
    it('derives all/normal/abnormal/blocked from summary', () => {
        const summary: PodStatistics = {
            totalCount: 30,
            blockedCount: 4,
            statuses: [
                { status: 'Running Ready', count: 18 },
                { status: 'Completed', count: 2 },
                { status: 'CrashLoopBackOff', count: 6 },
                { status: 'Pending', count: 4 },
            ],
        };
        expect(computeQuickCounts(summary)).toEqual({ all: 30, normal: 20, abnormal: 10, blocked: 4 });
    });
});
