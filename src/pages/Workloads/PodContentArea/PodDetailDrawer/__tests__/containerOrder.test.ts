import {describe, expect, it} from 'vitest';

import type {Container} from '@/interface/entities/pod';
import {containerBadge, orderedContainers} from '../containerOrder';

function container(name: string, type: string): Container {
    return {
        name,
        type,
        image: '',
        imageId: '',
        command: [],
        args: [],
        cmdline: '',
        resourceLimits: { cpu: '0', memory: '0', ephemeralStorage: '0', others: {} },
        resourceRequests: { cpu: '0', memory: '0', ephemeralStorage: '0', others: {} },
        resourceUsages: { cpu: '0', memory: '0', ephemeralStorage: '0', others: {} },
        env: [],
        ports: [],
        volumeMounts: [],
        status: 'running',
        reason: '',
        message: '',
        restarts: 0,
        lastStartedAt: '',
    };
}

describe('containerOrder', () => {
    it('orders by MAIN → NORMAL → SIDECAR → INIT', () => {
        const ordered = orderedContainers(
            [container('side', 'SIDECAR'), container('main', 'MAIN'), container('n', 'NORMAL')],
            [container('init', 'INIT')],
        );
        expect(ordered.map(c => c.name)).toEqual(['main', 'n', 'side', 'init']);
    });

    it('maps type to badge label and primary flag', () => {
        expect(containerBadge('MAIN')).toEqual({ label: '主容器', primary: true });
        expect(containerBadge('SIDECAR')).toEqual({ label: 'Sidecar', primary: false });
        expect(containerBadge('UNKNOWN')).toEqual({ label: 'UNKNOWN', primary: false });
    });
});
