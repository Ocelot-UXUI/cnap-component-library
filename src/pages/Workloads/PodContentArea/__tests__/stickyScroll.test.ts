import {describe, expect, it} from 'vitest';

import {
    activeGroupIndex,
    clamp,
    computeGroupSticky,
    computeProgress,
    computePinStart,
    computeScrubRange,
    computeWindowHeight,
    paginationPinned,
} from '../stickyScroll';
import type {GroupGeometry} from '../stickyScroll';

const groupA: GroupGeometry = { id: 'a', top: 100, height: 400, headerHeight: 48, theadOffset: 56, theadHeight: 40 };
const groupB: GroupGeometry = { id: 'b', top: 500, height: 300, headerHeight: 48, theadOffset: 56, theadHeight: 40 };

describe('clamp', () => {
    it('clamps within range', () => {
        expect(clamp(5, 0, 10)).toBe(5);
        expect(clamp(-5, 0, 10)).toBe(0);
        expect(clamp(50, 0, 10)).toBe(10);
    });
    it('returns min when range inverted (max < min)', () => {
        expect(clamp(5, 10, 0)).toBe(10);
    });
});

describe('computeWindowHeight', () => {
    it('reserves header height only when batch bar hidden', () => {
        expect(computeWindowHeight(1000, 52, 64, false)).toBe(948);
    });
    it('reserves header + batch bar when visible', () => {
        expect(computeWindowHeight(1000, 52, 64, true)).toBe(884);
    });
    it('never goes negative', () => {
        expect(computeWindowHeight(40, 52, 64, true)).toBe(0);
    });
});

describe('computePinStart', () => {
    it('uses rects + scrollTop − headerHeight', () => {
        // stageTop=300, scrollElTop=100, scrollTop=0, header=52 → 300-100+0-52 = 148
        expect(computePinStart(300, 100, 0, 52)).toBe(148);
        // after scrolling 148, stage would sit at header bottom
        expect(computePinStart(152, 100, 148, 52)).toBe(148);
    });
});

describe('computeScrubRange / computeProgress', () => {
    it('scrubRange floors at 0', () => {
        expect(computeScrubRange(1000, 600)).toBe(400);
        expect(computeScrubRange(400, 600)).toBe(0);
    });
    it('progress clamps to [0, scrubRange]', () => {
        expect(computeProgress(50, 148, 400)).toBe(0);
        expect(computeProgress(300, 148, 400)).toBe(152);
        expect(computeProgress(9999, 148, 400)).toBe(400);
    });
});

describe('computeGroupSticky', () => {
    it('no translate and not pinned before the group reaches the top', () => {
        const s = computeGroupSticky(groupA, 50);
        expect(s.headerTranslateY).toBe(0);
        expect(s.pinned).toBe(false);
    });
    it('pins header at window top while scrolling through the group body', () => {
        const s = computeGroupSticky(groupA, 200);
        expect(s.headerTranslateY).toBe(100); // 200 - top(100)
        expect(s.pinned).toBe(true);
        // thead docks just under the header (window-y = headerHeight)
        expect(s.theadTranslateY).toBe(92);
    });
    it('releases (rides out) once past the group bottom, handing off', () => {
        const s = computeGroupSticky(groupA, 500);
        expect(s.headerTranslateY).toBe(352); // clamped at height - headerHeight
        expect(s.pinned).toBe(false);
    });
    it('thead translate is continuous at the docking point', () => {
        // docks when progress = top + theadOffset - headerHeight = 108
        expect(computeGroupSticky(groupA, 108).theadTranslateY).toBe(0);
    });
});

describe('activeGroupIndex', () => {
    const groups = [groupA, groupB];
    it('is -1 before the first group top', () => {
        expect(activeGroupIndex(groups, 50)).toBe(-1);
    });
    it('tracks the last group whose top progress has passed', () => {
        expect(activeGroupIndex(groups, 200)).toBe(0);
        expect(activeGroupIndex(groups, 600)).toBe(1);
    });
    it('is -1 for empty groups', () => {
        expect(activeGroupIndex([], 100)).toBe(-1);
    });
});

describe('paginationPinned', () => {
    it('pins to window bottom while the group bottom is still below the window', () => {
        expect(paginationPinned(groupA, 150, 300)).toBe(true); // bottom-in-window 350 > 300
    });
    it('flows once the group bottom scrolls into the window', () => {
        expect(paginationPinned(groupA, 250, 300)).toBe(false); // 250 <= 300
    });
});

describe('handoff between contiguous groups', () => {
    it('exactly one header pinned as progress passes the boundary', () => {
        const groups = [groupA, groupB];
        const at = groups.map(g => computeGroupSticky(g, 520));
        expect(at[0].pinned).toBe(false); // A has ridden out
        expect(at[1].pinned).toBe(true); // B docked at the top
    });
});
