import {beforeAll, describe, expect, it} from 'vitest';
import {createActor} from 'xstate';

import {loadNavigationContextCandidates} from '../navigationContextCandidates';
import {createNavigationContextActor} from '../navigationContextMachine';
import {optionGroupMachine} from '../navigationOptionGroupMachine';

import type {NavigationContextCandidates} from '../navigationContextMachine';

let candidates: NavigationContextCandidates;

describe('navigationContextMachine clusterId cascade', () => {
    beforeAll(async () => {
        candidates = await loadNavigationContextCandidates();
    });

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
