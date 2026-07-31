import {describe, expect, it} from 'vitest';

import {
    buildVerticalScaleCommand,
    capabilityRegistry,
    listBatchCapabilities,
    listModalCapabilities,
} from '../capability';
import type {VerticalScaleRow} from '../capability';
import {toResourceSpec} from '../resource';

const row: VerticalScaleRow = {
    ref: { clusterId: 'cluster-a', resourceType: 'apps/v1/deployments', name: 'api' },
    container: 'api',
    requests: toResourceSpec({ cpu: '4c', memory: '8Gi' }),
    limits: toResourceSpec({ cpu: '8c', memory: '16Gi' }),
};

describe('capabilityRegistry', () => {
    it('registers VerticalScale as a non-batch Workload operation with its dialog', () => {
        expect(capabilityRegistry.VerticalScale).toEqual({
            capability: 'VerticalScale',
            targetKind: 'Workload',
            supportsBatch: false,
            dialog: 'verticalScale',
        });
    });

    it('registers PodBlock / PodUnblock as Pod placeholders (no dialog)', () => {
        expect(capabilityRegistry.PodBlock).toEqual({
            capability: 'PodBlock',
            targetKind: 'Pod',
            supportsBatch: false,
        });
        expect(capabilityRegistry.PodUnblock?.dialog).toBeUndefined();
    });
});

describe('listModalCapabilities', () => {
    it('yields exactly the header dialog capabilities', () => {
        expect(listModalCapabilities().sort()).toEqual(['HorizontalScale', 'Restart', 'VerticalScale']);
    });

    it('excludes ApplicationUninstall (no dialog placeholder)', () => {
        expect(listModalCapabilities()).not.toContain('ApplicationUninstall');
    });
});

describe('listBatchCapabilities', () => {
    it('yields all Pod-target capabilities incl. block/unblock placeholders', () => {
        expect(listBatchCapabilities().sort()).toEqual([
            'PodBlock',
            'PodDelete',
            'PodDeleteForce',
            'PodRestart',
            'PodUnblock',
        ]);
    });
});

describe('buildVerticalScaleCommand', () => {
    it('maps selected rows to a VerticalScale command with serialized resources', () => {
        const command = buildVerticalScaleCommand([row]);

        expect(command.capability).toBe('VerticalScale');
        expect(command.targets).toHaveLength(1);
        expect(command.targets[0].ref).toEqual(row.ref);
        expect(command.targets[0].container).toBe('api');
        expect(command.targets[0].params).toEqual({
            resourceLimits: { cpu: '8c', memory: '16Gi' },
            resourceRequests: { cpu: '4c', memory: '8Gi' },
        });
    });

    it('produces one target per selected row only', () => {
        expect(buildVerticalScaleCommand([]).targets).toHaveLength(0);
    });
});
