import {beforeAll, describe, expect, it} from 'vitest';

import {loadNavigationContextCandidates} from '../navigationContextCandidates';
import {createNavigationContextActor, getNavigationContextSnapshot} from '../navigationContextMachine';
import type {NavigationContextCandidates} from '../navigationContextMachine';

let candidates: NavigationContextCandidates;

describe('navigationContextMachine', () => {
    beforeAll(async () => {
        candidates = await loadNavigationContextCandidates();
    });

    it('resets application and environment when account changes', () => {
        const actor = createNavigationContextActor({
            accountId: '1',
            applicationId: '11',
            environmentId: '101',
        }, candidates);

        actor.send({ type: 'selectAccount', accountId: '2' });

        expect(actor.getSnapshot().current).toEqual({
            accountId: 2,
            applicationId: undefined,
            environmentId: undefined,
        });
    });

    it('resets environment when application changes', () => {
        const actor = createNavigationContextActor({
            accountId: '1',
            applicationId: '11',
            environmentId: '101',
        }, candidates);

        actor.send({ type: 'selectApplication', applicationId: '12' });

        expect(actor.getSnapshot().current).toEqual({
            accountId: '1',
            applicationId: '12',
            environmentId: undefined,
        });
    });

    it('reports invalid restored context instead of trusting persisted ids', () => {
        const snapshot = getNavigationContextSnapshot({
            accountId: '2',
            applicationId: '11',
            environmentId: '101',
        }, candidates);

        expect(snapshot.current).toEqual({
            accountId: '2',
            applicationId: undefined,
            environmentId: undefined,
        });
        expect(snapshot.invalidContext).toEqual(['applicationId', 'environmentId']);
    });

    it('filters available candidates from the current hierarchy', () => {
        const snapshot = getNavigationContextSnapshot({
            accountId: '1',
            applicationId: '11',
        }, candidates);

        expect(snapshot.availableApplications.map(item => item.id)).toEqual(['11', '12']);
        expect(snapshot.availableEnvironments.map(item => item.id)).toEqual(['101', '102']);
    });

    it('revalidates current context when candidates are hydrated', () => {
        const actor = createNavigationContextActor({ accountId: '1', applicationId: '11' }, {
            accounts: [],
            applications: [],
            environments: [],
        });

        actor.send({ type: 'hydrateCandidates', candidates });

        expect(actor.getSnapshot().current).toEqual({ accountId: '1', applicationId: '11' });
    });

    it('syncs route application params into the hierarchy context', () => {
        const actor = createNavigationContextActor({ accountId: '1', applicationId: '11' }, candidates);

        actor.send({ type: 'syncRouteContext', context: { applicationId: '21' } });

        expect(actor.getSnapshot().current).toEqual({ accountId: '2', applicationId: '21' });
    });

    it('syncs route environment params into account and application context', () => {
        const actor = createNavigationContextActor({}, candidates);

        actor.send({ type: 'syncRouteContext', context: { environmentId: '102' } });

        expect(actor.getSnapshot().current).toEqual({
            accountId: '1',
            applicationId: '11',
            environmentId: '102',
        });
    });
});
