import {assign, createActor, fromPromise, setup} from 'xstate';

import {logMachineError} from '@/logging/machineLogger';
import {loadNavigationContextCandidates} from './navigationContextCandidates';
import {applyNavigationSelection} from './navigationContextReducer';
import {createMachineContext, deriveRouteContext, getSnapshot} from './navigationContextSnapshot';
import {optionGroupMachine} from './navigationOptionGroupMachine';

import type {NavigationContextState, StoredNavigationContext} from './navigationContextData';
import type {NavigationSelectionEvent} from './navigationContextReducer';
import type {NavigationContextCandidates, NavigationMachineContext} from './navigationContextSnapshot';

export type {
    NavigationContextCandidates,
    NavigationContextSnapshot,
    NavigationMachineContext,
} from './navigationContextSnapshot';
export {getNavigationContextSnapshot, selectAppEnvID, selectNavigationSnapshot} from './navigationContextSnapshot';

interface NotifyParams {
    accountChanged?: boolean;
    applicationChanged?: boolean;
    environmentChanged?: boolean;
}

export function handleNavigationCandidatesLoadError(error: unknown): void {
    logMachineError('navigationMachine', 'loadCandidates', error);
}

export const navigationMachine = setup({
    types: {
        context: {} as NavigationMachineContext,
        events: {} as NavigationSelectionEvent,
        input: {} as {
            initialContext: NavigationContextState;
            initialCandidates: NavigationContextCandidates;
            initialStoredContext?: StoredNavigationContext;
        },
    },
    actors: {
        loadCandidates: fromPromise(async () => await loadNavigationContextCandidates()),
        optionGroupMachine,
    },
    actions: {
        spawnOptionGroup: assign({
            optionGroupRef: ({ spawn }) => spawn('optionGroupMachine'),
        }),
        applySelection: assign(({ context, event }) => applyNavigationSelection(context, event)),
        notifyOptionGroup: ({ context }, params: NotifyParams) => {
            const ref = context.optionGroupRef;
            if (!ref) {
                return;
            }
            if (params.accountChanged) {
                ref.send({ type: 'accountChanged', accountId: context.current.accountId });
            }
            if (params.applicationChanged) {
                ref.send({ type: 'applicationChanged', applicationId: context.current.applicationId });
            }
            if (params.environmentChanged) {
                ref.send({ type: 'environmentChanged', appEnvID: context.current.environmentId });
            }
        },
    },
}).createMachine({
    context: ({ input }) =>
        createMachineContext(
            input.initialContext,
            input.initialCandidates,
            input.initialStoredContext ?? { current: {}, byWorkspace: {} },
        ),
    entry: 'spawnOptionGroup',
    on: {
        selectAccount: {
            actions: ['applySelection', { type: 'notifyOptionGroup', params: { accountChanged: true } }],
        },
        selectApplication: {
            actions: ['applySelection', { type: 'notifyOptionGroup', params: { applicationChanged: true } }],
        },
        selectEnvironment: {
            actions: ['applySelection', { type: 'notifyOptionGroup', params: { environmentChanged: true } }],
        },
        selectCluster: { actions: 'applySelection' },
        reloadClusters: {
            actions: { type: 'notifyOptionGroup', params: { environmentChanged: true } },
        },
        restore: {
            actions: [
                'applySelection',
                {
                    type: 'notifyOptionGroup',
                    params: { accountChanged: true, applicationChanged: true, environmentChanged: true },
                },
            ],
        },
        syncRouteContext: {
            actions: [
                'applySelection',
                {
                    type: 'notifyOptionGroup',
                    params: { accountChanged: true, applicationChanged: true, environmentChanged: true },
                },
            ],
        },
        hydrateCandidates: {
            actions: [
                'applySelection',
                {
                    type: 'notifyOptionGroup',
                    params: { accountChanged: true, applicationChanged: true, environmentChanged: true },
                },
            ],
        },
        rememberWorkspace: { actions: 'applySelection' },
        restoreWorkspace: {
            actions: [
                'applySelection',
                {
                    type: 'notifyOptionGroup',
                    params: { accountChanged: true, applicationChanged: true, environmentChanged: true },
                },
            ],
        },
    },
    initial: 'loading',
    states: {
        loading: {
            always: {
                guard: ({ context }) => context.candidates.accounts.length > 0,
                target: 'ready',
            },
            invoke: {
                src: 'loadCandidates',
                onDone: {
                    target: 'ready',
                    actions: [
                        assign(({ context, event }) => {
                            const candidates = event.output;
                            const nextContext = deriveRouteContext(context.requested, candidates);
                            const next = createMachineContext(nextContext, candidates, context.storedContext);
                            return { ...next, optionGroupRef: context.optionGroupRef };
                        }),
                        {
                            type: 'notifyOptionGroup',
                            params: {
                                accountChanged: true,
                                applicationChanged: true,
                                environmentChanged: true,
                            },
                        },
                    ],
                },
                onError: {
                    target: 'ready',
                    actions: ({ event }) => handleNavigationCandidatesLoadError(event.error),
                },
            },
        },
        ready: {},
    },
});

export function createNavigationContextActor(
    initialContext: NavigationContextState,
    initialCandidates: NavigationContextCandidates,
    initialStoredContext: StoredNavigationContext = { current: {}, byWorkspace: {} },
) {
    const actor = createActor(navigationMachine, {
        input: { initialContext, initialCandidates, initialStoredContext },
    }).start();

    return {
        send: actor.send.bind(actor),
        getSnapshot: () => getSnapshot(actor.getSnapshot().context),
        on: actor.on.bind(actor),
    };
}
