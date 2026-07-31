import {describe, expect, it} from 'vitest';

import type {NavigationContextCandidates} from '../navigationContextSnapshot';
import {getNavigationContextSnapshot, selectAppEnvID} from '../navigationContextSnapshot';

const candidates: NavigationContextCandidates = {
    accounts: [{ id: '1', name: 'acc', displayName: 'Acc' }],
    applications: [{ id: '11', accountId: '1', name: 'app' }],
    environments: [
        { id: '101', applicationId: '11', environmentId: '1', environmentName: '开发环境' },
        { id: '102', applicationId: '11', environmentId: '2', environmentName: '生产环境' },
    ],
};

describe('selectAppEnvID', () => {
    it('returns the selected environment id as appEnvID', () => {
        const snapshot = getNavigationContextSnapshot(
            { accountId: '1', applicationId: '11', environmentId: '102' },
            candidates,
        );
        expect(selectAppEnvID(snapshot)).toBe('102');
    });

    it('returns undefined when no environment is selected', () => {
        const snapshot = getNavigationContextSnapshot({ accountId: '1', applicationId: '11' }, candidates);
        expect(selectAppEnvID(snapshot)).toBeUndefined();
    });

    it('returns undefined when environmentId has no valid match', () => {
        const snapshot = getNavigationContextSnapshot(
            { accountId: '1', applicationId: '11', environmentId: '999' },
            candidates,
        );
        expect(selectAppEnvID(snapshot)).toBeUndefined();
    });
});
