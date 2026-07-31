import {describe, expect, it} from 'vitest';

import {formatAge} from '../duration';

describe('formatAge', () => {
    const now = '2026-07-25T12:00:00Z';

    it('formats days and hours', () => {
        expect(formatAge('2026-07-22T07:00:00Z', now)).toBe('3d 5h');
    });

    it('formats hours and minutes when under a day', () => {
        expect(formatAge('2026-07-25T09:30:00Z', now)).toBe('2h 30m');
    });

    it('formats minutes only when under an hour', () => {
        expect(formatAge('2026-07-25T11:45:00Z', now)).toBe('15m');
    });

    it('returns - for missing or invalid input', () => {
        expect(formatAge(undefined, now)).toBe('-');
        expect(formatAge('not-a-date', now)).toBe('-');
    });

    it('clamps negative diffs to 0m', () => {
        expect(formatAge('2026-07-25T13:00:00Z', now)).toBe('0m');
    });
});
