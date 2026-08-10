import {beforeEach, describe, expect, it} from 'vitest';
import {
    getWorkspaceStoredContext,
    normalizeNavigationContext,
    readStoredContext,
    writeStoredContext,
} from '../navigationContextData';
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

describe('normalizeNavigationContext', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('keeps a valid account application environment chain', () => {
        expect(normalizeNavigationContext({
            accountId: '1',
            applicationId: '11',
            environmentId: '101',
        }, candidates)).toEqual({
            accountId: '1',
            applicationId: '11',
            environmentId: '101',
        });
    });

    it('resets application and environment when account changes', () => {
        expect(normalizeNavigationContext({
            accountId: '2',
            applicationId: '11',
            environmentId: '101',
        }, candidates)).toEqual({
            accountId: '2',
            applicationId: undefined,
            environmentId: undefined,
        });
    });

    it('resets environment when application changes', () => {
        expect(normalizeNavigationContext({
            accountId: '1',
            applicationId: '12',
            environmentId: '101',
        }, candidates)).toEqual({
            accountId: '1',
            applicationId: '12',
            environmentId: undefined,
        });
    });

    it('persists navigation context by workspace without reading mock data directly', () => {
        writeStoredContext({
            current: { accountId: '1', applicationId: '11', environmentId: '101' },
            byWorkspace: { applications: { accountId: '1', applicationId: '11' } },
        });
        expect(readStoredContext()).toEqual({
            current: { accountId: '1', applicationId: '11', environmentId: '101' },
            byWorkspace: {
                applications: { accountId: '1', applicationId: '11' },
            },
        });
    });

    it('reads target workspace context for navigation reachability checks', () => {
        writeStoredContext({
            current: { accountId: '1' },
            byWorkspace: {
                changes: {
                    accountId: '1',
                    applicationId: '11',
                    environmentId: '102',
                },
            },
        });
        expect(getWorkspaceStoredContext('changes')).toEqual({
            accountId: '1',
            applicationId: '11',
            environmentId: '102',
        });
    });
});
