import {describe, expect, it} from 'vitest';

import type {RuntimeWorkload} from '@/interface/entities/workload';
import {buildRows, canSubmit, editField, isRowValid, toggleCluster, toggleLimit, toVerticalScaleRows, validatePair} from '../rows';
import type {PairState} from '../rows';

function workload(clusterId: string, containers: string[]): RuntimeWorkload {
    return {
        clusterId,
        clusterName: `${clusterId}-name`,
        resourceType: 'apps/v1/deployments',
        name: 'api',
        replicas: 3,
        updateStrategy: { maxSurge: '15%', maxUnavailable: '15%' },
        availabilityTarget: '>95%',
        podContainers: containers.map(name => ({
            name,
            type: name === 'api' ? 'MAIN' : 'NORMAL',
            image: `${name}:latest`,
            resourceRequests: { cpu: '4c', memory: '8Gi' },
            resourceLimits: { cpu: '8c', memory: '16Gi' },
        })),
    };
}

const workloads = [workload('cluster-a', ['api', 'sidecar']), workload('cluster-b', ['api'])];

describe('buildRows', () => {
    it('filters workloads by container and initializes req from container', () => {
        const rows = buildRows(workloads, 'api');
        expect(rows).toHaveLength(2);
        expect(rows[0].cpu.req).toEqual({ value: '4', unit: 'c' });
        expect(rows[0].cpu.lim.enabled).toBe(false);
        expect(rows[0].selected).toBe(false);
        expect(rows[0].maxUnavailable).toBe('15%');
    });

    it('excludes workloads missing the selected container', () => {
        const rows = buildRows(workloads, 'sidecar');
        expect(rows.map(r => r.key)).toEqual(['cluster-a']);
    });
});

describe('toggleCluster', () => {
    it('enables limit and mirrors req on select, disables on deselect', () => {
        let rows = buildRows(workloads, 'api');
        rows = toggleCluster(rows, 'cluster-a');
        expect(rows[0].selected).toBe(true);
        expect(rows[0].cpu.lim).toEqual({ value: '4', unit: 'c', enabled: true });

        rows = toggleCluster(rows, 'cluster-a');
        expect(rows[0].selected).toBe(false);
        expect(rows[0].cpu.lim.enabled).toBe(false);
    });
});

describe('toggleLimit', () => {
    it('only applies when cluster is selected', () => {
        const rows = toggleLimit(buildRows(workloads, 'api'), 'cluster-a', 'cpu');
        expect(rows[0].cpu.lim.enabled).toBe(false);
    });

    it('syncs limit to req when unchecked', () => {
        let rows = toggleCluster(buildRows(workloads, 'api'), 'cluster-a');
        rows = editField(rows, 'cluster-a', 'cpu', 'lim', { value: '16' });
        rows = toggleLimit(rows, 'cluster-a', 'cpu');
        expect(rows[0].cpu.lim).toEqual({ value: '4', unit: 'c', enabled: false });
    });
});

describe('editField', () => {
    it('mirrors req to limit when limit disabled', () => {
        const rows = editField(buildRows(workloads, 'api'), 'cluster-a', 'cpu', 'req', { value: '6' });
        expect(rows[0].cpu.req.value).toBe('6');
        expect(rows[0].cpu.lim.value).toBe('6');
    });

    it('keeps limit independent when enabled', () => {
        let rows = toggleCluster(buildRows(workloads, 'api'), 'cluster-a');
        rows = editField(rows, 'cluster-a', 'cpu', 'lim', { value: '16' });
        rows = editField(rows, 'cluster-a', 'cpu', 'req', { value: '6' });
        expect(rows[0].cpu.lim.value).toBe('16');
    });
});

describe('validation and submit mapping', () => {
    it('requires at least one selected valid row', () => {
        const rows = buildRows(workloads, 'api');
        expect(canSubmit(rows)).toBe(false);
        expect(canSubmit(toggleCluster(rows, 'cluster-a'))).toBe(true);
    });

    it('rejects limit smaller than request', () => {
        let rows = toggleCluster(buildRows(workloads, 'api'), 'cluster-a');
        rows = editField(rows, 'cluster-a', 'cpu', 'req', { value: '8' });
        rows = editField(rows, 'cluster-a', 'cpu', 'lim', { value: '4' });
        expect(isRowValid(rows[0])).toBe(false);
    });

    it('maps selected rows to vertical-scale rows only', () => {
        const rows = toggleCluster(buildRows(workloads, 'api'), 'cluster-a');
        const result = toVerticalScaleRows(rows, 'api');
        expect(result).toHaveLength(1);
        expect(result[0].ref.clusterId).toBe('cluster-a');
        expect(result[0].container).toBe('api');
    });
});

describe('validatePair', () => {
    function pair(overrides: Partial<PairState> = {}): PairState {
        return {
            req: { value: '1', unit: 'Gi' },
            lim: { value: '1', unit: 'Gi', enabled: false },
            ...overrides,
        };
    }

    it('passes when req is filled and lim is disabled', () => {
        expect(validatePair('memory', pair())).toBeNull();
    });

    it('treats empty req with lim disabled as unconfigured and passes', () => {
        expect(validatePair('memory', pair({ req: { value: '', unit: 'Gi' } }))).toBeNull();
    });

    it('errors on req side when lim is enabled but req is empty', () => {
        expect(validatePair('memory', pair({
            req: { value: '', unit: 'Gi' },
            lim: { value: '', unit: 'Gi', enabled: true },
        }))).toMatchObject({ side: 'req' });
    });

    it('errors on req side when req is not positive', () => {
        expect(validatePair('memory', pair({ req: { value: '0', unit: 'Gi' } })))
            .toMatchObject({ side: 'req' });
    });

    it('errors on lim side when lim is empty or not positive', () => {
        expect(validatePair('memory', pair({ lim: { value: '', unit: 'Gi', enabled: true } })))
            .toMatchObject({ side: 'lim' });
    });

    it('errors on lim side when lim is less than req', () => {
        expect(validatePair('memory', pair({
            req: { value: '2', unit: 'Gi' },
            lim: { value: '1', unit: 'Gi', enabled: true },
        }))).toMatchObject({ side: 'lim' });
    });

    it('passes when lim equals req', () => {
        expect(validatePair('memory', pair({ lim: { value: '1', unit: 'Gi', enabled: true } }))).toBeNull();
    });
});
