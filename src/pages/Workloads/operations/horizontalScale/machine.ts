/** 横向扩缩弹窗状态机（XState v5）：顺序拉取 groups→workloads + 联动（委托 rows.ts）+ 提交 */

import {assign, fromPromise, setup} from 'xstate';

import runtimeOperationApi from '@/api/runtimeOperation';
import type {HorizontalScaleInput} from '@/api/runtimeOperation';
import type {RuntimeWorkload, WorkloadGroup} from '@/interface/entities/workload';
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
    containerNames: string[];
    container?: string;
    rows: HorizontalRow[];
    loadError?: string;
    submitError?: string;
}

export type HorizontalScaleEvent =
    | { type: 'SELECT_GROUP'; groupId: string; }
    | { type: 'SELECT_CONTAINER'; container: string; }
    | { type: 'TOGGLE_CLUSTER'; key: string; }
    | { type: 'EDIT_DESIRED'; key: string; desired: string; }
    | { type: 'SUBMIT'; };

export interface HorizontalScaleInputArgs {
    appEnvID: string;
    clusterId?: string;
    defaultGroupId?: string;
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
        containerNames: [],
        rows: [],
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
                    { target: 'ready', actions: assign({ groups: ({ event }) => event.output }) },
                ],
                onError: { target: 'ready', actions: assign({ loadError: () => '工作负载分组加载失败' }) },
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
                        const container = bundle.containerNames[0];
                        return {
                            workloads: bundle.workloads,
                            containerNames: bundle.containerNames,
                            container,
                            rows: buildRows(bundle.workloads, container),
                            loadError: undefined,
                        };
                    }),
                },
                onError: { target: 'ready', actions: assign({ loadError: () => '工作负载列表加载失败' }) },
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
                input: ({ context }) => toHorizontalScaleInput(context.appEnvID, context.rows),
                onDone: { target: 'succeeded' },
                onError: { target: 'ready', actions: assign({ submitError: () => '提交失败，请重试' }) },
            },
        },
        succeeded: { type: 'final' },
    },
});
