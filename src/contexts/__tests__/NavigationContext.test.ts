import {beforeAll, beforeEach, describe, expect, it} from 'vitest';
import {loadNavigationContextCandidates} from '../navigationContextCandidates';
import {
    getWorkspaceStoredContext,
    normalizeNavigationContext,
    readStoredContext,
    writeStoredContext,
} from '../navigationContextData';
import type {NavigationContextCandidates} from '../navigationContextMachine';

let candidates: NavigationContextCandidates;

describe('normalizeNavigationContext', () => {
    beforeAll(async () => {
        candidates = await loadNavigationContextCandidates();
    });

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
            accountId: 1,
            applicationId: '11',
            environmentId: '102',
        });
    });
});
