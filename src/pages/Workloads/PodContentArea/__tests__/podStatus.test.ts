import {describe, expect, it} from 'vitest';

import {isNormalStatus, NORMAL_STATUSES, statusLabel, statusTone} from '../podStatus';

describe('podStatus', () => {
    it('maps known statuses to label/tone/normal', () => {
        expect(statusLabel('Running Ready')).toBe('运行中');
        expect(statusTone('Running Ready')).toBe('success');
        expect(isNormalStatus('Running Ready')).toBe(true);

        expect(statusTone('Terminating')).toBe('info');
        expect(isNormalStatus('Terminating')).toBe(true);

        expect(statusTone('CrashLoopBackOff')).toBe('error');
        expect(isNormalStatus('CrashLoopBackOff')).toBe(false);
    });

    it('handles Init: prefixed statuses', () => {
        expect(statusLabel('Init:0/2')).toBe('初始化中（0/2）');
        expect(statusTone('Init:0/2')).toBe('info');
        expect(statusTone('Init:CrashLoopBackOff')).toBe('error');
        expect(isNormalStatus('Init:0/2')).toBe(false);
    });

    it('falls back to raw value / error tone / not-normal for unknown', () => {
        expect(statusLabel('SomethingNew')).toBe('SomethingNew');
        expect(statusTone('SomethingNew')).toBe('error');
        expect(isNormalStatus('SomethingNew')).toBe(false);
    });

    it('exposes the normal status set', () => {
        expect(NORMAL_STATUSES).toContain('Running Ready');
        expect(NORMAL_STATUSES).toContain('Completed');
        expect(NORMAL_STATUSES).toContain('Terminating');
        expect(NORMAL_STATUSES).toContain('Running InPlaceUpdateNotReady');
        expect(NORMAL_STATUSES).not.toContain('CrashLoopBackOff');
    });
});
