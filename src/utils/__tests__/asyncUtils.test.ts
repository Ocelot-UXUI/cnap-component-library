import {describe, expect, it, vi} from 'vitest';
import {delay} from '../asyncUtils';

describe('asyncUtils', () => {
    describe('delay', () => {
        it('should return a promise', () => {
            const result = delay(100);
            expect(result).toBeInstanceOf(Promise);
        });

        it('should resolve after specified milliseconds', async () => {
            vi.useFakeTimers();
            const start = Date.now();
            const promise = delay(1000);

            vi.advanceTimersByTime(1000);
            await promise;

            expect(Date.now() - start).toBe(1000);
            vi.useRealTimers();
        });

        it('should work with 0ms delay', async () => {
            vi.useFakeTimers();
            const promise = delay(0);

            vi.advanceTimersByTime(0);
            await promise;

            vi.useRealTimers();
        });
    });
});
