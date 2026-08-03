import {describe, expect, it} from 'vitest';

import type {RuntimeWorkload} from '@/interface/entities/workload';
import {buildRows, canSubmit, editDesired, isDesiredValid, toggleCluster, toHorizontalScaleTargets} from '../rows';

function workload(clusterId: string, containers: string[], replicas = 3): RuntimeWorkload {
    return {
        clusterId,
        clusterName: `${clusterId}-name`,
        resourceType: 'apps/v1/deployments',
        name: 'api',
        replicas,
        updateStrategy: { maxSurge: '15%', maxUnavailable: '15%' },
        availabilityTarget: '>95%',
        podContainers: containers.map(name => ({
            name,
            type: name === 'api' ? 'MAIN' : 'NORMAL',
            image: `${name}:latest`,
            resourceRequests: {},
            resourceLimits: {},
        })),
    };
}

const workloads = [workload('cluster-a', ['api', 'sidecar'], 3), workload('cluster-b', ['api'], 5)];

describe('buildRows', () => {
    it('filters workloads by container and defaults desired to current replicas', () => {
        const rows = buildRows(workloads, 'api');
        expect(rows).toHaveLength(2);
        expect(rows[0].desired).toBe('3');
        expect(rows[0].replicas).toBe(3);
        expect(rows[0].selected).toBe(false);
        expect(rows[0].maxUnavailable).toBe('15%');
    });

    it('excludes workloads missing the selected container', () => {
        const rows = buildRows(workloads, 'sidecar');
        expect(rows.map(r => r.key)).toEqual(['cluster-a']);
    });
});

describe('isDesiredValid', () => {
    it('accepts positive integers only', () => {
        expect(isDesiredValid('1')).toBe(true);
        expect(isDesiredValid('10')).toBe(true);
        expect(isDesiredValid('0')).toBe(false);
        expect(isDesiredValid('-1')).toBe(false);
        expect(isDesiredValid('')).toBe(false);
        expect(isDesiredValid('1.5')).toBe(false);
        expect(isDesiredValid('01')).toBe(false);
    });
});

describe('validation and submit mapping', () => {
    it('requires at least one selected valid row', () => {
        const rows = buildRows(workloads, 'api');
        expect(canSubmit(rows)).toBe(false);
        expect(canSubmit(toggleCluster(rows, 'cluster-a'))).toBe(true);
    });

    it('rejects selected row with invalid desired value', () => {
        let rows = toggleCluster(buildRows(workloads, 'api'), 'cluster-a');
        rows = editDesired(rows, 'cluster-a', '0');
        expect(canSubmit(rows)).toBe(false);
    });

    it('maps only selected rows to targets with numeric replicas', () => {
        let rows = toggleCluster(buildRows(workloads, 'api'), 'cluster-b');
        rows = editDesired(rows, 'cluster-b', '8');
        const targets = toHorizontalScaleTargets(rows);
        expect(targets).toEqual([
            { clusterId: 'cluster-b', resourceType: 'apps/v1/deployments', name: 'api', replicas: 8 },
        ]);
    });
});
