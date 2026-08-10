import {describe, expect, it} from 'vitest';

import {normalizeNavigationContext} from '../navigationContextData';
import {getNavigationContextSnapshot} from '../navigationContextSnapshot';

import type {NavigationContextCandidates} from '../navigationContextSnapshot';

const candidates: NavigationContextCandidates = {
    accounts: [{ id: '1', name: 'acc', displayName: 'Acc' }],
    applications: [{ id: '11', accountId: '1', name: 'app' }],
    environments: [
        { id: '101', applicationId: '11', environmentId: '1', environmentName: '开发环境' },
        { id: '102', applicationId: '11', environmentId: '2', environmentName: '生产环境' },
    ],
};

describe('normalizeNavigationContext clusterId', () => {
    it('keeps clusterId when the account/application/environment chain is valid', () => {
        expect(normalizeNavigationContext(
            { accountId: '1', applicationId: '11', environmentId: '101', clusterId: 'cluster-a' },
            candidates,
        )).toEqual({
            accountId: '1',
            applicationId: '11',
            environmentId: '101',
            clusterId: 'cluster-a',
        });
    });

    it('drops clusterId when the environment is invalid', () => {
        expect(normalizeNavigationContext(
            { accountId: '1', applicationId: '11', environmentId: '999', clusterId: 'cluster-a' },
            candidates,
        )).toEqual({
            accountId: '1',
            applicationId: '11',
            environmentId: undefined,
            clusterId: undefined,
        });
    });

    it('drops clusterId when no environment is selected', () => {
        expect(normalizeNavigationContext(
            { accountId: '1', applicationId: '11', clusterId: 'cluster-a' },
            candidates,
        )).toEqual({
            accountId: '1',
            applicationId: '11',
            environmentId: undefined,
            clusterId: undefined,
        });
    });
});

describe('getInvalidContext clusterId', () => {
    it('reports clusterId alongside environmentId when the environment no longer resolves', () => {
        const snapshot = getNavigationContextSnapshot(
            { accountId: '1', applicationId: '11', environmentId: '999', clusterId: 'cluster-a' },
            candidates,
        );
        expect(snapshot.invalidContext).toContain('environmentId');
        expect(snapshot.invalidContext).toContain('clusterId');
    });

    it('does not flag clusterId when the full chain resolves', () => {
        const snapshot = getNavigationContextSnapshot(
            { accountId: '1', applicationId: '11', environmentId: '101', clusterId: 'cluster-a' },
            candidates,
        );
        expect(snapshot.invalidContext).toHaveLength(0);
    });
});
