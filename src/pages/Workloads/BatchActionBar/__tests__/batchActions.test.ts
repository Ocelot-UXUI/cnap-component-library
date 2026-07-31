import {describe, expect, it} from 'vitest';

import type {Pod, PodOperation} from '@/interface/entities/pod';
import {aggregateAction, BATCH_ACTIONS} from '../batchActions';

function op(capability: string, disabled = false, reason = ''): PodOperation {
    return {
        name: capability,
        capability: capability as PodOperation['capability'],
        displayName: capability,
        description: '',
        targetKind: 'Pod',
        disabled,
        reason,
        supportsBatch: true,
    };
}

function pod(operations: PodOperation[]): Pod {
    return { clusterId: 'c1', name: 'p', namespace: 'ns', status: 'Running Ready', creationTimestamp: '', operations };
}

describe('BATCH_ACTIONS', () => {
    it('is a fixed ordered set of 5 with force-delete danger last', () => {
        expect(BATCH_ACTIONS.map(a => a.key)).toEqual(['restart', 'delete', 'block', 'unblock', 'force-delete']);
        expect(BATCH_ACTIONS[4]).toMatchObject({ key: 'force-delete', danger: true });
        expect(BATCH_ACTIONS.filter(a => a.placeholder).map(a => a.key)).toEqual(['block', 'unblock']);
    });
});

describe('aggregateAction', () => {
    it('disabled with no reasons when selection empty', () => {
        expect(aggregateAction([], 'PodRestart')).toEqual({ enabled: false, reasons: [] });
    });

    it('enabled when every pod has the enabled operation', () => {
        const pods = [pod([op('PodRestart')]), pod([op('PodRestart')])];
        expect(aggregateAction(pods, 'PodRestart')).toEqual({ enabled: true, reasons: [] });
    });

    it('disabled with fallback reason when a pod lacks the capability', () => {
        const pods = [pod([op('PodRestart')]), pod([op('PodDelete')])];
        const result = aggregateAction(pods, 'PodRestart');
        expect(result.enabled).toBe(false);
        expect(result.reasons).toEqual(['部分所选 Pod 不支持此操作']);
    });

    it('collects and de-dupes disabled reasons', () => {
        const pods = [
            pod([op('PodRestart', true, 'Pod正在终止')]),
            pod([op('PodRestart', true, 'Pod正在终止')]),
            pod([op('PodRestart', true, '无权限')]),
        ];
        const result = aggregateAction(pods, 'PodRestart');
        expect(result.enabled).toBe(false);
        expect(result.reasons.sort()).toEqual(['Pod正在终止', '无权限']);
    });
});
