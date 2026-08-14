/** 重启弹窗状态机（XState v5）：顺序拉取 groups→workloads + 联动（委托 rows.ts）+ 提交 */

import {assign, fromPromise, setup} from 'xstate';

import runtimeOperationApi from '@/api/runtimeOperation';
import type {RestartInput} from '@/api/runtimeOperation';
import type {RuntimeWorkload, WorkloadGroup} from '@/interface/entities/workload';
import {logMachineError} from '@/logging/machineLogger';
import {loadGroups, loadWorkloads} from '../shared/loader';
import type {ContainerOption, WorkloadsBundle} from '../shared/loader';
import {buildRows, editMaxUnavailable, toggleCluster} from './rows';
import type {RestartRow} from './rows';
import {toRestartInput} from './submit';

export interface RestartContext {
    appEnvID: string;
    clusterId?: string;
    groups: WorkloadGroup[];
    groupId?: string;
    workloads: RuntimeWorkload[];
    containerNames: ContainerOption[];
    container?: string;
    rows: RestartRow[];
    /** 超时时间（秒），字符串便于校验 */
    exitTimeout: string;
    /** 操作名，来自 RuntimeOperation.name */
    operationName: string;
    loadError?: string;
    submitError?: string;
}

export type RestartEvent =
    | { type: 'SELECT_GROUP'; groupId: string; }
    | { type: 'SELECT_CONTAINER'; container: string; }
    | { type: 'TOGGLE_CLUSTER'; key: string; }
    | { type: 'EDIT_MAX_UNAVAILABLE'; key: string; value: string; }
    | { type: 'SET_TIMEOUT'; value: string; }
    | { type: 'SUBMIT'; };

export interface RestartInputArgs {
    appEnvID: string;
    clusterId?: string;
    defaultGroupId?: string;
    /** 操作名，来自 RuntimeOperation.name */
    operationName: string;
}

const DEFAULT_TIMEOUT = '60';

export const restartMachine = setup({
    types: {
        context: {} as RestartContext,
        events: {} as RestartEvent,
        input: {} as RestartInputArgs,
    },
    actors: {
        loadGroups: fromPromise(({ input }: { input: { appEnvID: string; clusterId?: string; }; }) =>
            loadGroups(input.appEnvID, input.clusterId)
        ),
        loadWorkloads: fromPromise(({ input }: { input: { appEnvID: string; groupId: string; }; }) =>
            loadWorkloads(input.appEnvID, input.groupId)
        ),
        submit: fromPromise(({ input }: { input: RestartInput; }) => runtimeOperationApi.restartWorkload(input)),
    },
}).createMachine({
    id: 'restart',
    context: ({ input }) => ({
        appEnvID: input.appEnvID,
        clusterId: input.clusterId,
        groups: [],
        groupId: input.defaultGroupId,
        workloads: [],
        containerNames: [],
        rows: [],
        exitTimeout: DEFAULT_TIMEOUT,
        operationName: input.operationName,
    }),
    initial: 'loadingGroups',
    states: {
        loadingGroups: {
            invoke: {
                src: 'loadGroups',
                input: ({ context }) => ({ appEnvID: context.appEnvID, clusterId: context.clusterId }),
                onDone: [
                    {
                        guard: ({ context }) => !!context.groupId,
                        target: 'loadingWorkloads',
                        actions: assign({ groups: ({ event }) => event.output }),
                    },
                    {
                        guard: ({ event }) => event.output.length > 0,
                        target: 'loadingWorkloads',
                        actions: assign({
                            groups: ({ event }) => event.output,
                            groupId: ({ event }) => event.output[0]?.id,
                        }),
                    },
                    { target: 'ready', actions: assign({ groups: ({ event }) => event.output }) },
                ],
                onError: {
                    target: 'ready',
                    actions: [
                        ({ event }) => logMachineError('restartMachine', 'loadGroups', event.error),
                        assign({ loadError: () => '工作负载分组加载失败' }),
                    ],
                },
            },
        },
        loadingWorkloads: {
            invoke: {
                src: 'loadWorkloads',
                input: ({ context }) => ({ appEnvID: context.appEnvID, groupId: context.groupId! }),
                onDone: {
                    target: 'ready',
                    actions: assign(({ event }) => {
                        const bundle = event.output as WorkloadsBundle;
                        const mainContainer = bundle.containerNames.find(item => item.type === 'MAIN')
                            ?? bundle.containerNames[0];
                        const container = mainContainer?.name;
                        return {
                            workloads: bundle.workloads,
                            containerNames: bundle.containerNames,
                            container,
                            rows: buildRows(bundle.workloads, container),
                            loadError: undefined,
                        };
                    }),
                },
                onError: {
                    target: 'ready',
                    actions: [
                        ({ event }) => logMachineError('restartMachine', 'loadWorkloads', event.error),
                        assign({ loadError: () => '工作负载列表加载失败' }),
                    ],
                },
            },
        },
        ready: {
            on: {
                SELECT_GROUP: {
                    target: 'loadingWorkloads',
                    actions: assign({ groupId: ({ event }) => event.groupId }),
                },
                SELECT_CONTAINER: {
                    actions: assign({
                        container: ({ event }) => event.container,
                        rows: ({ context, event }) => buildRows(context.workloads, event.container),
                    }),
                },
                TOGGLE_CLUSTER: {
                    actions: assign({ rows: ({ context, event }) => toggleCluster(context.rows, event.key) }),
                },
                EDIT_MAX_UNAVAILABLE: {
                    actions: assign({
                        rows: ({ context, event }) => editMaxUnavailable(context.rows, event.key, event.value),
                    }),
                },
                SET_TIMEOUT: {
                    actions: assign({ exitTimeout: ({ event }) => event.value }),
                },
                SUBMIT: { target: 'submitting' },
            },
        },
        submitting: {
            invoke: {
                src: 'submit',
                input: ({ context }) =>
                    toRestartInput(
                        context.appEnvID,
                        context.rows,
                        context.container,
                        Number(context.exitTimeout),
                        context.operationName,
                    ),
                onDone: { target: 'succeeded' },
                onError: {
                    target: 'ready',
                    actions: [
                        ({ event }) => logMachineError('restartMachine', 'submit', event.error),
                        assign({ submitError: () => '提交失败，请重试' }),
                    ],
                },
            },
        },
        succeeded: { type: 'final' },
    },
});
