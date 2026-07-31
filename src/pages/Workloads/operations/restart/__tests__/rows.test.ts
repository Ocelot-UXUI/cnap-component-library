import {describe, expect, it} from 'vitest';

import type {RuntimeWorkload} from '@/interface/entities/workload';
import {
    buildRows,
    canSubmitRows,
    editMaxUnavailable,
    isMaxUnavailableValid,
    isTimeoutValid,
    toggleCluster,
    toRestartTargets,
} from '../rows';

function workload(clusterId: string, containers: string[]): RuntimeWorkload {
    return {
        clusterId,
        clusterName: `${clusterId}-name`,
        resourceType: 'apps.kruise.io/v1alpha1/clonesets',
        name: 'api',
        replicas: 3,
        updateStrategy: { maxSurge: '25%', maxUnavailable: '15%' },
        availabilityTarget: '>95%',
        podContainers: containers.map(name => ({ name, resourceRequests: {}, resourceLimits: {} })),
    };
}

const workloads = [workload('cluster-a', ['api', 'sidecar']), workload('cluster-b', ['api'])];

describe('buildRows', () => {
    it('filters by container and strips percent from maxUnavailable', () => {
        const rows = buildRows(workloads, 'api');
        expect(rows).toHaveLength(2);
        expect(rows[0].maxUnavailable).toBe('15');
        expect(rows[0].originalMaxUnavailable).toBe('15');
        expect(rows[0].maxSurge).toBe('25%');
        expect(rows[0].selected).toBe(false);
    });

    it('excludes workloads missing the selected container', () => {
        expect(buildRows(workloads, 'sidecar').map(r => r.key)).toEqual(['cluster-a']);
    });
});

describe('toggleCluster', () => {
    it('resets maxUnavailable to original on deselect', () => {
        let rows = editMaxUnavailable(buildRows(workloads, 'api'), 'cluster-a', '40');
        expect(rows[0].selected).toBe(true);
        rows = toggleCluster(rows, 'cluster-a');
        expect(rows[0].selected).toBe(false);
        expect(rows[0].maxUnavailable).toBe('15');
    });
});

describe('editMaxUnavailable', () => {
    it('auto-selects the cluster when edited while unselected', () => {
        const rows = editMaxUnavailable(buildRows(workloads, 'api'), 'cluster-b', '30');
        const row = rows.find(r => r.key === 'cluster-b')!;
        expect(row.selected).toBe(true);
        expect(row.maxUnavailable).toBe('30');
    });
});

describe('validation', () => {
    it('validates maxUnavailable within 1..100', () => {
        expect(isMaxUnavailableValid('1')).toBe(true);
        expect(isMaxUnavailableValid('100')).toBe(true);
        expect(isMaxUnavailableValid('0')).toBe(false);
        expect(isMaxUnavailableValid('101')).toBe(false);
        expect(isMaxUnavailableValid('')).toBe(false);
    });

    it('validates timeout within 5..3600', () => {
        expect(isTimeoutValid('60')).toBe(true);
        expect(isTimeoutValid('5')).toBe(true);
        expect(isTimeoutValid('3600')).toBe(true);
        expect(isTimeoutValid('4')).toBe(false);
        expect(isTimeoutValid('3601')).toBe(false);
    });

    it('requires at least one selected valid row', () => {
        const rows = buildRows(workloads, 'api');
        expect(canSubmitRows(rows)).toBe(false);
        expect(canSubmitRows(toggleCluster(rows, 'cluster-a'))).toBe(true);
    });
});

describe('submit mapping', () => {
    it('maps selected rows to targets with container and percent suffix', () => {
        let rows = editMaxUnavailable(buildRows(workloads, 'api'), 'cluster-a', '20');
        rows = rows.filter(r => r.key === 'cluster-a' || r.key === 'cluster-b');
        const targets = toRestartTargets(rows, 'api');
        expect(targets).toEqual([
            {
                clusterId: 'cluster-a',
                resourceType: 'apps.kruise.io/v1alpha1/clonesets',
                name: 'api',
                container: 'api',
                maxUnavailable: '20%',
            },
        ]);
    });
});
