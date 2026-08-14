/** 横向扩缩弹窗状态机（XState v5）：顺序拉取 groups→workloads + 联动（委托 rows.ts）+ 提交 */

import {assign, fromPromise, setup} from 'xstate';

import runtimeOperationApi from '@/api/runtimeOperation';
import type {HorizontalScaleInput} from '@/api/runtimeOperation';
import type {RuntimeWorkload, WorkloadGroup} from '@/interface/entities/workload';
import {logMachineError} from '@/logging/machineLogger';
import {loadGroups, loadWorkloads} from '../shared/loader';
import type {WorkloadsBundle} from '../shared/loader';
import {buildRows, editDesired, toggleCluster} from './rows';
import type {HorizontalRow} from './rows';
import {toHorizontalScaleInput} from './submit';

export interface HorizontalScaleContext {
    appEnvID: string;
    clusterId?: string;
    groups: WorkloadGroup[];
    groupId?: string;
    workloads: RuntimeWorkload[];
    rows: HorizontalRow[];
    /** 操作名，来自 RuntimeOperation.name */
    operationName: string;
    loadError?: string;
    submitError?: string;
}

export type HorizontalScaleEvent =
    | { type: 'SELECT_GROUP'; groupId: string; }
    | { type: 'TOGGLE_CLUSTER'; key: string; }
    | { type: 'EDIT_DESIRED'; key: string; desired: string; }
    | { type: 'SUBMIT'; };

export interface HorizontalScaleInputArgs {
    appEnvID: string;
    clusterId?: string;
    defaultGroupId?: string;
    /** 操作名，来自 RuntimeOperation.name */
    operationName: string;
}

export const horizontalScaleMachine = setup({
    types: {
        context: {} as HorizontalScaleContext,
        events: {} as HorizontalScaleEvent,
        input: {} as HorizontalScaleInputArgs,
    },
    actors: {
        loadGroups: fromPromise(({ input }: { input: { appEnvID: string; clusterId?: string; }; }) =>
            loadGroups(input.appEnvID, input.clusterId)
        ),
        loadWorkloads: fromPromise(({ input }: { input: { appEnvID: string; groupId: string; }; }) =>
            loadWorkloads(input.appEnvID, input.groupId)
        ),
        submit: fromPromise(({ input }: { input: HorizontalScaleInput; }) =>
            runtimeOperationApi.horizontalScale(input)
        ),
    },
}).createMachine({
    id: 'horizontalScale',
    context: ({ input }) => ({
        appEnvID: input.appEnvID,
        clusterId: input.clusterId,
        groups: [],
        groupId: input.defaultGroupId,
        workloads: [],
        rows: [],
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
                        ({ event }) => logMachineError('horizontalScaleMachine', 'loadGroups', event.error),
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
                        return {
                            workloads: bundle.workloads,
                            rows: buildRows(bundle.workloads),
                            loadError: undefined,
                        };
                    }),
                },
                onError: {
                    target: 'ready',
                    actions: [
                        ({ event }) => logMachineError('horizontalScaleMachine', 'loadWorkloads', event.error),
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
                TOGGLE_CLUSTER: {
                    actions: assign({ rows: ({ context, event }) => toggleCluster(context.rows, event.key) }),
                },
                EDIT_DESIRED: {
                    actions: assign({
                        rows: ({ context, event }) => editDesired(context.rows, event.key, event.desired),
                    }),
                },
                SUBMIT: { target: 'submitting' },
            },
        },
        submitting: {
            invoke: {
                src: 'submit',
                input: ({ context }) => toHorizontalScaleInput(context.appEnvID, context.rows, context.operationName),
                onDone: { target: 'succeeded' },
                onError: {
                    target: 'ready',
                    actions: [
                        ({ event }) => logMachineError('horizontalScaleMachine', 'submit', event.error),
                        assign({ submitError: () => '提交失败，请重试' }),
                    ],
                },
            },
        },
        succeeded: { type: 'final' },
    },
});
