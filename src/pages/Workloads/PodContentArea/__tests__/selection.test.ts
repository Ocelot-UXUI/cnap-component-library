import {describe, expect, it} from 'vitest';

import type {Pod} from '@/interface/entities/pod';
import {groupKeys, podKey, reconcileGroup, selectedList, totalSelected} from '../selection';

function pod(clusterId: string, name: string): Pod {
    return { clusterId, name, namespace: 'ns', status: 'Running Ready', creationTimestamp: '' };
}

describe('selection (Pod objects)', () => {
    it('builds a cross-cluster unique key', () => {
        expect(podKey(pod('c1', 'api-0'))).toBe('c1/api-0');
    });

    it('reconciles a group from keys + current-page rows', () => {
        const rows = [pod('c1', 'a'), pod('c1', 'b')];
        const sel = reconcileGroup({}, 'g1', ['c1/a', 'c1/b'], rows);
        expect(groupKeys(sel, 'g1').sort()).toEqual(['c1/a', 'c1/b']);
        expect(selectedList(sel)).toHaveLength(2);
    });

    it('preserves cross-page objects not in current rows', () => {
        let sel = reconcileGroup({}, 'g1', ['c1/a'], [pod('c1', 'a')]);
        // 翻到下一页：a 不在当前 rows，但仍被选中；b 为当前页新选
        sel = reconcileGroup(sel, 'g1', ['c1/a', 'c1/b'], [pod('c1', 'b')]);
        expect(groupKeys(sel, 'g1').sort()).toEqual(['c1/a', 'c1/b']);
    });

    it('accumulates across groups and clears empty group', () => {
        let sel = reconcileGroup({}, 'g1', ['c1/a'], [pod('c1', 'a')]);
        sel = reconcileGroup(sel, 'g2', ['c2/x'], [pod('c2', 'x')]);
        expect(totalSelected(sel)).toBe(2);
        sel = reconcileGroup(sel, 'g1', [], []);
        expect(totalSelected(sel)).toBe(1);
        expect(sel.g1).toBeUndefined();
    });
});
