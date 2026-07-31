import {describe, expect, it} from 'vitest';
import {
    detectLogLevel,
    filterLogLines,
    splitByKeyword,
    toLogLine,
    trimLogLines,
} from './logLine';
import type {LogLine} from './logLine';

describe('detectLogLevel', () => {
    it('detects level from a standard "date time LEVEL message" line', () => {
        expect(detectLogLevel('2026-06-23 12:16:46.344 INFO Processed batch')).toBe('INFO');
        expect(detectLogLevel('2026-06-23 12:17:23.565 WARN Slow downstream')).toBe('WARN');
        expect(detectLogLevel('2026-06-23 12:16:23.824 DEBUG Request trace')).toBe('DEBUG');
    });

    it('normalizes aliases and is case-insensitive', () => {
        expect(detectLogLevel('warning something')).toBe('WARN');
        expect(detectLogLevel('FATAL boom')).toBe('ERROR');
        expect(detectLogLevel('trace details')).toBe('DEBUG');
    });

    it('returns OTHER when no known level appears in the leading tokens', () => {
        expect(detectLogLevel('plain message without level')).toBe('OTHER');
    });
});

describe('filterLogLines', () => {
    const lines: LogLine[] = [
        toLogLine('2026-06-23 12:00:00 INFO started', 0),
        toLogLine('2026-06-23 12:00:01 WARN slow call', 1),
        toLogLine('2026-06-23 12:00:02 ERROR failed request', 2),
    ];

    it('filters by level', () => {
        expect(filterLogLines(lines, '', 'WARN').map(l => l.id)).toEqual([1]);
    });

    it('filters by keyword case-insensitively', () => {
        expect(filterLogLines(lines, 'FAILED', 'ALL').map(l => l.id)).toEqual([2]);
    });

    it('combines level and keyword', () => {
        expect(filterLogLines(lines, 'call', 'INFO')).toEqual([]);
    });

    it('returns all when ALL and empty keyword', () => {
        expect(filterLogLines(lines, '   ', 'ALL')).toHaveLength(3);
    });
});

describe('trimLogLines', () => {
    it('keeps only the most recent max lines', () => {
        const lines = Array.from({ length: 5 }, (_, i) => toLogLine(`line ${i}`, i));
        expect(trimLogLines(lines, 3).map(l => l.id)).toEqual([2, 3, 4]);
    });

    it('returns input unchanged when under the cap', () => {
        const lines = [toLogLine('a', 0)];
        expect(trimLogLines(lines, 3)).toBe(lines);
    });
});

describe('splitByKeyword', () => {
    it('returns a single non-match segment when keyword is empty', () => {
        expect(splitByKeyword('hello world', '')).toEqual([{ text: 'hello world', match: false }]);
    });

    it('splits into matched and unmatched segments case-insensitively', () => {
        expect(splitByKeyword('Error and error', 'error')).toEqual([
            { text: 'Error', match: true },
            { text: ' and ', match: false },
            { text: 'error', match: true },
        ]);
    });
});
