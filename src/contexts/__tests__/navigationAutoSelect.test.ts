import {describe, expect, it} from 'vitest';

import {applyNavigationSelection} from '../navigationContextReducer';
import {createMachineContext} from '../navigationContextSnapshot';

import type {NavigationContextState} from '../navigationContextData';
import type {NavigationSelectionEvent} from '../navigationContextReducer';
import type {NavigationContextCandidates} from '../navigationContextSnapshot';

const candidates: NavigationContextCandidates = {
    accounts: [
        { id: '1', name: 'acc1', displayName: 'Acc1' },
        { id: '2', name: 'acc2', displayName: 'Acc2' },
    ],
    applications: [
        { id: '11', accountId: '1', name: 'app11' },
        { id: '12', accountId: '1', name: 'app12' },
        { id: '21', accountId: '2', name: 'app21' },
    ],
    environments: [
        { id: '101', applicationId: '11', environmentId: 'e1', environmentName: '仅一个环境' },
        { id: '121', applicationId: '12', environmentId: 'e2', environmentName: '环境A' },
        { id: '122', applicationId: '12', environmentId: 'e3', environmentName: '环境B' },
        { id: '211', applicationId: '21', environmentId: 'e4', environmentName: '账号2唯一环境' },
    ],
};

const emptyStored = { current: {}, byWorkspace: {} };

function select(current: NavigationContextState, event: NavigationSelectionEvent): NavigationContextState {
    return applyNavigationSelection(createMachineContext(current, candidates, emptyStored), event).current;
}

describe('navigation auto-select single child', () => {
    it('auto-selects the only environment when switching to a single-environment application', () => {
        const current = select(
            { accountId: '1', applicationId: '12', environmentId: '121' },
            { type: 'selectApplication', applicationId: '11' },
        );

        expect(current).toEqual({ accountId: '1', applicationId: '11', environmentId: '101' });
    });

    it('keeps environment empty when the target application has multiple environments', () => {
        const current = select(
            { accountId: '1', applicationId: '11', environmentId: '101' },
            { type: 'selectApplication', applicationId: '12' },
        );

        expect(current).toEqual({ accountId: '1', applicationId: '12' });
    });

    it('auto-selects the only application and cascades to its only environment when switching account', () => {
        const current = select(
            { accountId: '1', applicationId: '11', environmentId: '101' },
            { type: 'selectAccount', accountId: '2' },
        );

        expect(current).toEqual({ accountId: '2', applicationId: '21', environmentId: '211' });
    });

    it('keeps application empty when the target account has multiple applications', () => {
        const current = select({}, { type: 'selectAccount', accountId: '1' });

        expect(current).toEqual({ accountId: '1' });
    });
});
