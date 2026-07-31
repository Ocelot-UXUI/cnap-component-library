import {describe, expect, it} from 'vitest';

import type {Pod} from '@/interface/entities/pod';
import {toPodTargets, toRestartClusters, uniqueClusters} from '../podTargets';

function pod(clusterId: string, name: string, clusterName?: string): Pod {
    return { clusterId, name, clusterName, namespace: 'ns', status: 'Running Ready', creationTimestamp: '' };
}

describe('podTargets', () => {
    it('maps pods to v1/pods targets', () => {
        expect(toPodTargets([pod('c1', 'a'), pod('c2', 'b')])).toEqual([
            { clusterId: 'c1', resourceType: 'v1/pods', name: 'a' },
            { clusterId: 'c2', resourceType: 'v1/pods', name: 'b' },
        ]);
    });

    it('dedupes clusters preserving order and clusterName', () => {
        const pods = [pod('c1', 'a', 'C1'), pod('c1', 'b', 'C1'), pod('c2', 'x', 'C2')];
        expect(uniqueClusters(pods)).toEqual([
            { clusterId: 'c1', clusterName: 'C1' },
            { clusterId: 'c2', clusterName: 'C2' },
        ]);
    });

    it('builds restart clusters with percent suffix', () => {
        expect(toRestartClusters({ c1: '25', c2: '10' })).toEqual([
            { clusterId: 'c1', maxUnavailable: '25%' },
            { clusterId: 'c2', maxUnavailable: '10%' },
        ]);
    });
});
