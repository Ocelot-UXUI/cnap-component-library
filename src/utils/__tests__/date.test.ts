import {describe, expect, it} from 'vitest';
import {
    convertDateArrayToISO,
    formatDateFull,
    formatDateShort,
    formatISOTime,
    howLongAgo,
    normalizeDateValue,
} from '../date';

describe('date utils', () => {
    describe('convertDateArrayToISO', () => {
        it('should convert date array to ISO string', () => {
            const result = convertDateArrayToISO([2024, 3, 15, 10, 30, 45]);
            expect(result).toBe('2024-03-15T10:30:45');
        });

        it('should pad single digit values with zero', () => {
            const result = convertDateArrayToISO([2024, 1, 5, 8, 5, 9]);
            expect(result).toBe('2024-01-05T08:05:09');
        });

        it('should return empty string for invalid array', () => {
            expect(convertDateArrayToISO([])).toBe('');
            expect(convertDateArrayToISO([2024, 1])).toBe('');
        });

        it('should return empty string for non-array input', () => {
            expect(convertDateArrayToISO(null as unknown as number[])).toBe('');
            expect(convertDateArrayToISO(undefined as unknown as number[])).toBe('');
        });
    });

    describe('normalizeDateValue', () => {
        it('should return ISO string for date array', () => {
            const result = normalizeDateValue([2024, 3, 15, 10, 30, 45]);
            expect(result).toBe('2024-03-15T10:30:45');
        });

        it('should return string as-is', () => {
            const dateStr = '2024-03-15T10:30:45';
            expect(normalizeDateValue(dateStr)).toBe(dateStr);
        });

        it('should return empty string for falsy values', () => {
            expect(normalizeDateValue(undefined)).toBe('');
            expect(normalizeDateValue('')).toBe('');
        });
    });

    describe('formatISOTime', () => {
        it('should format date string with default format', () => {
            const result = formatISOTime('2024-03-15T10:30:45');
            expect(result).toBe('2024-03-15 10:30:45');
        });

        it('should format date string with custom format', () => {
            const result = formatISOTime('2024-03-15T10:30:45', 'YYYY/MM/DD');
            expect(result).toBe('2024/03/15');
        });

        it('should format timestamp', () => {
            const timestamp = new Date('2024-03-15T10:30:45').getTime();
            const result = formatISOTime(timestamp);
            expect(result).toContain('2024-03-15');
        });

        it('should return Invalid Date for invalid date', () => {
            expect(formatISOTime('invalid')).toBe('Invalid Date');
        });
    });

    describe('formatDateShort', () => {
        it('should format date string to short format', () => {
            const result = formatDateShort('2024-03-15T10:30:45');
            expect(result).toBe('2024-03-15');
        });

        it('should format date array to short format', () => {
            const result = formatDateShort([2024, 3, 15, 10, 30, 45]);
            expect(result).toBe('2024-03-15');
        });

        it('should return dash for null/undefined', () => {
            expect(formatDateShort(null)).toBe('-');
            expect(formatDateShort(undefined)).toBe('-');
        });

        it('should return dash for empty string', () => {
            expect(formatDateShort('')).toBe('-');
        });
    });

    describe('formatDateFull', () => {
        it('should format date string to full format', () => {
            const result = formatDateFull('2024-03-15T10:30:45');
            expect(result).toBe('2024-03-15 10:30:45');
        });

        it('should format date array to full format', () => {
            const result = formatDateFull([2024, 3, 15, 10, 30, 45]);
            expect(result).toBe('2024-03-15 10:30:45');
        });

        it('should return dash for null/undefined', () => {
            expect(formatDateFull(null)).toBe('-');
            expect(formatDateFull(undefined)).toBe('-');
        });
    });

    describe('howLongAgo', () => {
        const baseTime = new Date('2024-03-15T12:00:00').getTime();

        it('should return seconds for less than 60 seconds', () => {
            const targetTime = baseTime - 30 * 1000;
            expect(howLongAgo(targetTime, baseTime)).toBe('30秒');
        });

        it('should return minutes for less than 60 minutes', () => {
            const targetTime = baseTime - 30 * 60 * 1000;
            expect(howLongAgo(targetTime, baseTime)).toBe('30分钟');
        });

        it('should return hours for less than 24 hours', () => {
            const targetTime = baseTime - 5 * 60 * 60 * 1000;
            expect(howLongAgo(targetTime, baseTime)).toBe('5小时');
        });

        it('should return days for less than 30 days', () => {
            const targetTime = baseTime - 10 * 24 * 60 * 60 * 1000;
            expect(howLongAgo(targetTime, baseTime)).toBe('10天');
        });

        it('should return months for less than 12 months', () => {
            const targetTime = baseTime - 60 * 24 * 60 * 60 * 1000;
            expect(howLongAgo(targetTime, baseTime)).toBe('2个月');
        });

        it('should return years for 12+ months', () => {
            const targetTime = baseTime - 400 * 24 * 60 * 60 * 1000;
            expect(howLongAgo(targetTime, baseTime)).toBe('1年');
        });

        it('should throw error for invalid date', () => {
            expect(() => howLongAgo('invalid', baseTime)).toThrow('无效的时间格式');
        });

        it('should accept Date object', () => {
            const targetTime = new Date(baseTime - 30 * 1000);
            expect(howLongAgo(targetTime, new Date(baseTime))).toBe('30秒');
        });

        it('should accept date string', () => {
            expect(howLongAgo('2024-03-15T11:59:30', '2024-03-15T12:00:00')).toBe('30秒');
        });
    });
});
