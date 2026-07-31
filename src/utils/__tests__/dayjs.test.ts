import {describe, expect, it} from 'vitest';
import {formatDateTime, formatYYDateTime} from '../dayjs';

describe('dayjs utils', () => {
    describe('formatDateTime', () => {
        it('should format date string to MM-DD HH:mm:ss', () => {
            const result = formatDateTime('2024-03-15T10:30:45');
            expect(result).toBe('03-15 10:30:45');
        });

        it('should handle different date strings', () => {
            expect(formatDateTime('2024-01-01T00:00:00')).toBe('01-01 00:00:00');
            expect(formatDateTime('2024-12-31T23:59:59')).toBe('12-31 23:59:59');
        });
    });

    describe('formatYYDateTime', () => {
        it('should format date string to YYYY-MM-DD HH:mm:ss', () => {
            const result = formatYYDateTime('2024-03-15T10:30:45');
            expect(result).toBe('2024-03-15 10:30:45');
        });

        it('should handle different date strings', () => {
            expect(formatYYDateTime('2024-01-01T00:00:00')).toBe('2024-01-01 00:00:00');
            expect(formatYYDateTime('2024-12-31T23:59:59')).toBe('2024-12-31 23:59:59');
        });
    });
});
