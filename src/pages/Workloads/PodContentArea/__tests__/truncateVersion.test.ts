import {describe, expect, it} from 'vitest';

import {truncateVersion} from '../podCells';

describe('truncateVersion', () => {
    it('returns the version unchanged when length is at or below 12', () => {
        expect(truncateVersion('1.0.0')).toBe('1.0.0');
        expect(truncateVersion('abcdefghijkl')).toBe('abcdefghijkl');
    });

    it('truncates to first 5 + ... + last 4 when longer than 12', () => {
        expect(truncateVersion('abcdefghijklm')).toBe('abcde...jklm');
        expect(truncateVersion('123456789012345')).toBe('12345...2345');
    });

    it('keeps truncated output at exactly 12 characters for very long versions', () => {
        const result = truncateVersion('v1.2.3-20260803-commit-abcdef1234567890');
        expect(result.length).toBe(12);
        expect(result.startsWith('v1.2.')).toBe(true);
        expect(result.endsWith('7890')).toBe(true);
    });
});
