import {assign, fromPromise, setup} from 'xstate';

import accountApi from '@/api/account';
import applicationEnvironmentApi from '@/api/applicationEnvironment';
import {
    buildAccountSelectorOptionGroups,
    buildApplicationSelectorOptionGroups,
    buildEnvironmentSelectorOptionGroups,
} from './navigationSelectorBuilders';

import {idleClusterOptionGroupState, idleOptionGroupState} from './navigationOptionGroupTypes';

import type {OptionGroupMachineContext, OptionGroupMachineEvent} from './navigationOptionGroupTypes';

export const optionGroupMachine = setup({
    types: {
        context: {} as OptionGroupMachineContext,
        events: {} as OptionGroupMachineEvent,
    },
    actors: {
        loadAccount: fromPromise(async () => {
            const accounts = await accountApi.getMany({ keyword: '' });
            return buildAccountSelectorOptionGroups(accounts);
        }),
        loadApplication: fromPromise(async ({ input }: { input: { accountId?: string; }; }) => {
            if (!input.accountId) return buildApplicationSelectorOptionGroups([]);
            const applications = await accountApi.getApplicationsByAccount({ accountId: input.accountId, keyword: '' });
            return buildApplicationSelectorOptionGroups(applications);
        }),
        loadEnvironment: fromPromise(async ({ input }: { input: { applicationId?: string; }; }) => {
            if (!input.applicationId) return buildEnvironmentSelectorOptionGroups([]);
            const environments = await applicationEnvironmentApi.getEnvironments({
                applicationID: input.applicationId,
            });
            return buildEnvironmentSelectorOptionGroups(environments);
        }),
        loadCluster: fromPromise(async ({ input }: { input: { appEnvID?: string; }; }) => {
            if (!input.appEnvID) return [];
            return await applicationEnvironmentApi.getClusters({ appEnvID: input.appEnvID });
        }),
    },
}).createMachine({
    context: {
        accountId: undefined,
        applicationId: undefined,
        appEnvID: undefined,
        account: { status: 'loading', data: {} },
        application: idleOptionGroupState,
        environment: idleOptionGroupState,
        cluster: idleClusterOptionGroupState,
    },
    type: 'parallel',
    states: {
        account: {
            initial: 'loading',
            states: {
                loading: {
                    invoke: {
                        src: 'loadAccount',
                        onDone: {
                            target: 'done',
                            actions: assign({ account: ({ event }) => ({ status: 'done', data: event.output }) }),
                        },
                        onError: {
                            target: 'error',
                            actions: assign({ account: () => ({ status: 'error' as const, data: {} }) }),
                        },
                    },
                },
                done: {},
                error: {},
            },
        },
        application: {
            initial: 'idle',
            states: {
                idle: {},
                loading: {
                    invoke: {
                        src: 'loadApplication',
                        input: ({ context }) => ({ accountId: context.accountId }),
                        onDone: {
                            target: 'done',
                            actions: assign({ application: ({ event }) => ({ status: 'done', data: event.output }) }),
                        },
                        onError: {
                            target: 'error',
                            actions: assign({ application: () => ({ status: 'error' as const, data: {} }) }),
                        },
                    },
                },
                done: {},
                error: {},
            },
            on: {
                accountChanged: [
                    {
                        guard: ({ event }) => Boolean(event.accountId),
                        target: '.loading',
                        actions: assign({
                            accountId: ({ event }) => event.accountId,
                            application: () => ({ status: 'loading' as const, data: {} }),
                        }),
                    },
                    {
                        target: '.idle',
                        actions: assign({
                            accountId: ({ event }) => event.accountId,
                            application: () => idleOptionGroupState,
                        }),
                    },
                ],
            },
        },
        environment: {
            initial: 'idle',
            states: {
                idle: {},
                loading: {
                    invoke: {
                        src: 'loadEnvironment',
                        input: ({ context }) => ({ applicationId: context.applicationId }),
                        onDone: {
                            target: 'done',
                            actions: assign({ environment: ({ event }) => ({ status: 'done', data: event.output }) }),
                        },
                        onError: {
                            target: 'error',
                            actions: assign({ environment: () => ({ status: 'error' as const, data: {} }) }),
                        },
                    },
                },
                done: {},
                error: {},
            },
            on: {
                accountChanged: {
                    target: '.idle',
                    actions: assign({
                        applicationId: () => undefined,
                        environment: () => idleOptionGroupState,
                    }),
                },
                applicationChanged: [
                    {
                        guard: ({ event }) => Boolean(event.applicationId),
                        target: '.loading',
                        actions: assign({
                            applicationId: ({ event }) => event.applicationId,
                            environment: () => ({ status: 'loading' as const, data: {} }),
                        }),
                    },
                    {
                        target: '.idle',
                        actions: assign({
                            applicationId: ({ event }) => event.applicationId,
                            environment: () => idleOptionGroupState,
                        }),
                    },
                ],
            },
        },
        cluster: {
            initial: 'idle',
            states: {
                idle: {},
                loading: {
                    invoke: {
                        src: 'loadCluster',
                        input: ({ context }) => ({ appEnvID: context.appEnvID }),
                        onDone: {
                            target: 'done',
                            actions: assign({ cluster: ({ event }) => ({ status: 'done', data: event.output }) }),
                        },
                        onError: {
                            target: 'error',
                            actions: assign({ cluster: () => ({ status: 'error' as const, data: [] }) }),
                        },
                    },
                },
                done: {},
                error: {},
            },
            on: {
                accountChanged: {
                    target: '.idle',
                    actions: assign({
                        appEnvID: () => undefined,
                        cluster: () => idleClusterOptionGroupState,
                    }),
                },
                applicationChanged: {
                    target: '.idle',
                    actions: assign({
                        appEnvID: () => undefined,
                        cluster: () => idleClusterOptionGroupState,
                    }),
                },
                environmentChanged: [
                    {
                        guard: ({ event }) => Boolean(event.appEnvID),
                        target: '.loading',
                        actions: assign({
                            appEnvID: ({ event }) => event.appEnvID,
                            cluster: () => ({ status: 'loading' as const, data: [] }),
                        }),
                    },
                    {
                        target: '.idle',
                        actions: assign({
                            appEnvID: ({ event }) => event.appEnvID,
                            cluster: () => idleClusterOptionGroupState,
                        }),
                    },
                ],
            },
        },
    },
});
