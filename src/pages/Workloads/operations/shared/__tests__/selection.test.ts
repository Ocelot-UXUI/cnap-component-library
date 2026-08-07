import {describe, expect, it} from 'vitest';

import {toggledKeys} from '../selection';

const rows = [
    { key: 'cluster-a', selected: true },
    { key: 'cluster-b', selected: false },
    { key: 'cluster-c', selected: true },
];

describe('toggledKeys', () => {
    it('returns keys newly selected', () => {
        expect(toggledKeys(rows, ['cluster-a', 'cluster-b', 'cluster-c'])).toEqual(['cluster-b']);
    });

    it('returns keys deselected', () => {
        expect(toggledKeys(rows, ['cluster-a'])).toEqual(['cluster-c']);
    });

    it('returns both newly selected and deselected keys', () => {
        expect(toggledKeys(rows, ['cluster-b'])).toEqual(['cluster-b', 'cluster-a', 'cluster-c']);
    });

    it('returns empty when selection unchanged', () => {
        expect(toggledKeys(rows, ['cluster-a', 'cluster-c'])).toEqual([]);
    });

    it('handles numeric keys from antd Key[]', () => {
        expect(toggledKeys([{ key: '1', selected: false }], [1])).toEqual(['1']);
    });
});
