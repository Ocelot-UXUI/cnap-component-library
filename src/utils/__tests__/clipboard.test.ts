import {beforeEach, describe, expect, it, vi} from 'vitest';
import copy from 'copy-to-clipboard';
import {copyText} from '../clipboard';

vi.mock('copy-to-clipboard', () => ({
    default: vi.fn(),
}));

describe('clipboard', () => {
    describe('copyText', () => {
        beforeEach(() => {
            vi.mocked(copy).mockClear();
            vi.mocked(copy).mockResolvedValue(true);
        });

        it('delegates to copy-to-clipboard and resolves with its result', async () => {
            const result = await copyText('hello');
            expect(copy).toHaveBeenCalledWith('hello', undefined);
            expect(result).toBe(true);
        });

        it('passes the format option through', async () => {
            await copyText('<b>hi</b>', { format: 'text/html' });
            expect(copy).toHaveBeenCalledWith('<b>hi</b>', { format: 'text/html' });
        });

        it('resolves false when the copy fails', async () => {
            vi.mocked(copy).mockResolvedValue(false);
            await expect(copyText('nope')).resolves.toBe(false);
        });
    });
});
