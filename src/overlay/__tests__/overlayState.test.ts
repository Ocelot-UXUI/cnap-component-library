import {describe, expect, it} from 'vitest';

import {initialOverlayState, overlayReducer} from '../overlayState';
import type {OverlayEntry} from '../overlayState';

const modalA: OverlayEntry = { key: 'pod-restart', props: { a: 1 } };
const modalB: OverlayEntry = { key: 'pod-delete', props: { b: 2 } };
const drawerA: OverlayEntry = { key: 'pod-detail', props: { c: 3 } };
const drawerB: OverlayEntry = { key: 'pod-yaml', props: { d: 4 } };

describe('overlayReducer', () => {
    it('弹窗单槽：后开的 openModal 覆盖前一个（同轴互斥）', () => {
        const s1 = overlayReducer(initialOverlayState, { type: 'openModal', entry: modalA });
        expect(s1.modal).toBe(modalA);
        const s2 = overlayReducer(s1, { type: 'openModal', entry: modalB });
        expect(s2.modal).toBe(modalB);
    });

    it('抽屉单槽：后开的 openDrawer 覆盖前一个（同轴互斥）', () => {
        const s1 = overlayReducer(initialOverlayState, { type: 'openDrawer', entry: drawerA });
        expect(s1.drawer).toBe(drawerA);
        const s2 = overlayReducer(s1, { type: 'openDrawer', entry: drawerB });
        expect(s2.drawer).toBe(drawerB);
    });

    it('弹窗与抽屉两条独立轴可并存', () => {
        const s1 = overlayReducer(initialOverlayState, { type: 'openModal', entry: modalA });
        const s2 = overlayReducer(s1, { type: 'openDrawer', entry: drawerA });
        expect(s2.modal).toBe(modalA);
        expect(s2.drawer).toBe(drawerA);
    });

    it('closeModal 仅清弹窗，抽屉不受影响', () => {
        const s = overlayReducer({ modal: modalA, drawer: drawerA }, { type: 'closeModal' });
        expect(s.modal).toBeNull();
        expect(s.drawer).toBe(drawerA);
    });

    it('closeDrawer 仅清抽屉，弹窗不受影响', () => {
        const s = overlayReducer({ modal: modalA, drawer: drawerA }, { type: 'closeDrawer' });
        expect(s.drawer).toBeNull();
        expect(s.modal).toBe(modalA);
    });

    it('closeAll 清空两轴（路由切换清理场景）', () => {
        const s = overlayReducer({ modal: modalA, drawer: drawerA }, { type: 'closeAll' });
        expect(s).toEqual(initialOverlayState);
    });

    it('无活动项时 close* 返回原引用，避免无谓重渲染', () => {
        expect(overlayReducer(initialOverlayState, { type: 'closeModal' })).toBe(initialOverlayState);
        expect(overlayReducer(initialOverlayState, { type: 'closeDrawer' })).toBe(initialOverlayState);
        expect(overlayReducer(initialOverlayState, { type: 'closeAll' })).toBe(initialOverlayState);
    });
});
