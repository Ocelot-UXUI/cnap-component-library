import {describe, expect, it} from 'vitest';
import {createActor} from 'xstate';

import {createNavigationContextActor} from '../navigationContextMachine';
import {optionGroupMachine} from '../navigationOptionGroupMachine';

import type {NavigationContextCandidates} from '../navigationContextMachine';

const candidates: NavigationContextCandidates = {
    accounts: [
        { id: '1', name: 'acc', displayName: 'Acc' },
        { id: '2', name: 'acc2', displayName: 'Acc 2' },
    ],
    applications: [
        { id: '11', accountId: '1', name: 'app' },
        { id: '12', accountId: '1', name: 'app2' },
    ],
    environments: [
        { id: '101', applicationId: '11', environmentId: '1', environmentName: '开发环境' },
        { id: '102', applicationId: '11', environmentId: '2', environmentName: '生产环境' },
    ],
};

describe('navigationContextMachine clusterId cascade', () => {

    it('updates clusterId when a cluster is selected', () => {
        const actor = createNavigationContextActor(
            { accountId: '1', applicationId: '11', environmentId: '101', clusterId: 'cluster-a' },
            candidates,
        );

        actor.send({ type: 'selectCluster', clusterId: 'cluster-b' });

        expect(actor.getSnapshot().current.clusterId).toBe('cluster-b');
    });

    it('clears clusterId when switching to another environment', () => {
        const actor = createNavigationContextActor(
            { accountId: '1', applicationId: '11', environmentId: '101', clusterId: 'cluster-a' },
            candidates,
        );

        actor.send({ type: 'selectEnvironment', environmentId: '102' });

        expect(actor.getSnapshot().current.environmentId).toBe('102');
        expect(actor.getSnapshot().current.clusterId).toBeUndefined();
    });

    it('clears clusterId when the application changes', () => {
        const actor = createNavigationContextActor(
            { accountId: '1', applicationId: '11', environmentId: '101', clusterId: 'cluster-a' },
            candidates,
        );

        actor.send({ type: 'selectApplication', applicationId: '12' });

        expect(actor.getSnapshot().current.clusterId).toBeUndefined();
    });

    it('clears clusterId when the account changes', () => {
        const actor = createNavigationContextActor(
            { accountId: '1', applicationId: '11', environmentId: '101', clusterId: 'cluster-a' },
            candidates,
        );

        actor.send({ type: 'selectAccount', accountId: '2' });

        expect(actor.getSnapshot().current.clusterId).toBeUndefined();
    });
});

describe('optionGroupMachine cluster region', () => {
    it('enters loading and records appEnvID when the environment changes', () => {
        const actor = createActor(optionGroupMachine).start();

        actor.send({ type: 'environmentChanged', appEnvID: '102' });

        expect(actor.getSnapshot().value.cluster).toBe('loading');
        expect(actor.getSnapshot().context.appEnvID).toBe('102');

        actor.stop();
    });

    it('stays idle when the environment is cleared', () => {
        const actor = createActor(optionGroupMachine).start();

        actor.send({ type: 'environmentChanged', appEnvID: undefined });

        expect(actor.getSnapshot().value.cluster).toBe('idle');
        expect(actor.getSnapshot().context.appEnvID).toBeUndefined();

        actor.stop();
    });

    it('resets the cluster region when the application changes', () => {
        const actor = createActor(optionGroupMachine).start();

        actor.send({ type: 'environmentChanged', appEnvID: '102' });
        actor.send({ type: 'applicationChanged', applicationId: '11' });

        expect(actor.getSnapshot().value.cluster).toBe('idle');
        expect(actor.getSnapshot().context.appEnvID).toBeUndefined();

        actor.stop();
    });
});
