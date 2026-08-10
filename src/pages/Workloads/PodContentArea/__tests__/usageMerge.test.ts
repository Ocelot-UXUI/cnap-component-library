import {describe, expect, it} from 'vitest';

import type {Pod, PodDetailUsage, PodList} from '@/interface/entities/pod';
import {groupHasGpu} from '../podColumns';
import {mergePodDetailUsage} from '../PodDetailDrawer/usePodDetail';
import {mergePodUsages} from '../useGroupPods';

const pod = (name: string): Pod => ({
    clusterId: 'c1',
    name,
    namespace: 'ns',
    status: 'Running Ready',
    creationTimestamp: '',
    resourceUsages: { cpu: 'legacy' },
});

const list = (items: Pod[]): PodList => ({
    total: items.length,
    page: 1,
    pageSize: 20,
    items,
    summary: { totalCount: items.length, blockedCount: 0, statuses: [] },
});

describe('Usage merging', () => {
    it('merges current-page Pod usage by cluster and name', () => {
        const result = mergePodUsages(list([pod('a'), pod('b')]), [
            { clusterId: 'c1', name: 'b', uid: 'b', resourceUsages: { cpu: '500m' } },
        ]);
        expect(result.items.map(item => item.resourceUsages?.cpu)).toEqual([undefined, '500m']);
    });

    it('treats duplicate Pod usage records as unavailable', () => {
        const usages = [
            { clusterId: 'c1', name: 'a', uid: 'a1', resourceUsages: { cpu: '100m' } },
            { clusterId: 'c1', name: 'a', uid: 'a2', resourceUsages: { cpu: '200m' } },
        ];
        expect(mergePodUsages(list([pod('a')]), usages).items[0].resourceUsages).toBeUndefined();
    });

    it('merges normal and init container usage with the shared type', () => {
        const detail: Pod = {
            ...pod('a'),
            containers: [container('main')],
            initContainers: [container('init')],
        };
        const usage: PodDetailUsage = {
            clusterId: 'c1',
            name: 'a',
            uid: 'a',
            resourceUsages: { memory: '256Mi' },
            containers: [{ name: 'main', resourceUsages: { cpu: '400m' } }],
            initContainers: [{ name: 'init', resourceUsages: { cpu: '100m' } }],
        };
        const result = mergePodDetailUsage(detail, usage);
        expect(result.resourceUsages?.memory).toBe('256Mi');
        expect(result.containers?.[0].resourceUsages?.cpu).toBe('400m');
        expect(result.initContainers?.[0].resourceUsages?.cpu).toBe('100m');
    });

    it('treats duplicate container usage records as unavailable', () => {
        const detail = { ...pod('a'), containers: [container('main')] };
        const usage: PodDetailUsage = {
            clusterId: 'c1',
            name: 'a',
            uid: 'a',
            resourceUsages: {},
            containers: [
                { name: 'main', resourceUsages: { cpu: '100m' } },
                { name: 'main', resourceUsages: { cpu: '200m' } },
            ],
            initContainers: [],
        };
        expect(mergePodDetailUsage(detail, usage).containers?.[0].resourceUsages).toBeUndefined();
    });

    it('supports structured GPUs with legacy others fallback', () => {
        const structured = {
            ...pod('a'),
            resourceRequests: {
                gpus: [{ vendor: 'NVIDIA', model: 'T4', profile: '16GB', count: 2 }],
            },
        };
        expect(groupHasGpu([structured])).toBe(true);
        expect(groupHasGpu([{ ...pod('b'), resourceRequests: { others: { foo: '1' } } }])).toBe(false);
    });

    it('clears embedded legacy usage when dedicated usage is unavailable', () => {
        expect(mergePodDetailUsage(pod('a')).resourceUsages).toBeUndefined();
    });
});

function container(name: string) {
    return {
        name,
        type: 'MAIN',
        image: '',
        imageId: '',
        command: [],
        args: [],
        cmdline: '',
        resourceLimits: {},
        resourceRequests: {},
        env: [],
        ports: [],
        volumeMounts: [],
        status: 'Running',
        reason: '',
        message: '',
        restarts: 0,
        lastStartedAt: '',
    };
}
