import {beforeAll, describe, expect, it, vi} from 'vitest';

import {loadNavigationContextCandidates} from '../navigationContextCandidates';
import {createNavigationContextActor, getNavigationContextSnapshot} from '../navigationContextMachine';
import type {NavigationContextCandidates} from '../navigationContextMachine';

// 用内联数据 mock 掉底层 API，使候选加载与 optionGroup 状态机在测试中不走真实网络。
const {accounts, applicationsByAccount, environmentsByApplication} = vi.hoisted(() => ({
    accounts: [
        {id: '1', name: 'acc1', displayName: 'Acc1'},
        {id: '2', name: 'acc2', displayName: 'Acc2'},
    ],
    applicationsByAccount: {
        '1': [{id: '11', accountId: '1', name: 'app11'}, {id: '12', accountId: '1', name: 'app12'}],
        '2': [{id: '21', accountId: '2', name: 'app21'}, {id: '22', accountId: '2', name: 'app22'}],
    } as Record<string, Array<{id: string; accountId: string; name: string;}>>,
    environmentsByApplication: {
        '11': [
            {id: '101', applicationId: '11', environmentId: 'e1', environmentName: 'Env101'},
            {id: '102', applicationId: '11', environmentId: 'e2', environmentName: 'Env102'},
        ],
        '12': [
            {id: '121', applicationId: '12', environmentId: 'e3', environmentName: 'Env121'},
            {id: '122', applicationId: '12', environmentId: 'e4', environmentName: 'Env122'},
        ],
    } as Record<string, Array<{id: string; applicationId: string; environmentId: string; environmentName: string;}>>,
}));

vi.mock('@/api/account', () => ({
    default: {
        getMany: vi.fn(async () => accounts),
        getApplicationsByAccount: vi.fn(
            async ({accountId}: {accountId: string; keyword: string;}) => applicationsByAccount[accountId] ?? [],
        ),
    },
}));

vi.mock('@/api/applicationEnvironment', () => ({
    default: {
        getEnvironments: vi.fn(
            async ({applicationID}: {applicationID: string;}) => environmentsByApplication[applicationID] ?? [],
        ),
        getClusters: vi.fn(async () => []),
    },
}));

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
            accountId: '2',
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
