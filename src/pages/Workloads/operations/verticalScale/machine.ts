/** 纵向扩缩弹窗状态机（XState v5）：顺序拉取 groups→workloads + 联动（委托 rows.ts）+ 提交 */

import {assign, fromPromise, setup} from 'xstate';

import runtimeOperationApi from '@/api/runtimeOperation';
import type {VerticalScaleInput} from '@/api/runtimeOperation';
import type {ResourceKind} from '@/domain/workload';
import type {RuntimeWorkload, WorkloadGroup} from '@/interface/entities/workload';
import {loadGroups, loadWorkloads} from '../shared/loader';
import type {WorkloadsBundle} from '../shared/loader';
import {buildRows, editField, toggleCluster, toggleLimit} from './rows';
import type {FieldState, RowState} from './rows';
import {toVerticalScaleInput} from './submit';

export interface VerticalScaleContext {
    appEnvID: string;
    clusterId?: string;
    groups: WorkloadGroup[];
    groupId?: string;
    workloads: RuntimeWorkload[];
    containerNames: string[];
    container?: string;
    rows: RowState[];
    /** 操作名，来自 RuntimeOperation.name */
    operationName: string;
    loadError?: string;
    submitError?: string;
}

export type VerticalScaleEvent =
    | { type: 'SELECT_GROUP'; groupId: string; }
    | { type: 'SELECT_CONTAINER'; container: string; }
    | { type: 'TOGGLE_CLUSTER'; key: string; }
    | { type: 'TOGGLE_LIMIT'; key: string; kind: ResourceKind; }
    | { type: 'EDIT_FIELD'; key: string; kind: ResourceKind; side: 'req' | 'lim'; patch: Partial<FieldState>; }
    | { type: 'SUBMIT'; };

export interface VerticalScaleInputArgs {
    appEnvID: string;
    clusterId?: string;
    defaultGroupId?: string;
    /** 操作名，来自 RuntimeOperation.name */
    operationName: string;
}

export const verticalScaleMachine = setup({
    types: {
        context: {} as VerticalScaleContext,
        events: {} as VerticalScaleEvent,
        input: {} as VerticalScaleInputArgs,
    },
    actors: {
        loadGroups: fromPromise(({ input }: { input: { appEnvID: string; clusterId?: string; }; }) =>
            loadGroups(input.appEnvID, input.clusterId)
        ),
        loadWorkloads: fromPromise(({ input }: { input: { appEnvID: string; groupId: string; }; }) =>
            loadWorkloads(input.appEnvID, input.groupId)
        ),
        submit: fromPromise(({ input }: { input: VerticalScaleInput; }) => runtimeOperationApi.verticalScale(input)),
    },
}).createMachine({
    id: 'verticalScale',
    context: ({ input }) => ({
        appEnvID: input.appEnvID,
        clusterId: input.clusterId,
        groups: [],
        groupId: input.defaultGroupId,
        workloads: [],
        containerNames: [],
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
                TOGGLE_LIMIT: {
                    actions: assign({ rows: ({ context, event }) => toggleLimit(context.rows, event.key, event.kind) }),
                },
                EDIT_FIELD: {
                    actions: assign({
                        rows: ({ context, event }) =>
                            editField(context.rows, event.key, event.kind, event.side, event.patch),
                    }),
                },
                SUBMIT: { target: 'submitting' },
            },
        },
        submitting: {
            invoke: {
                src: 'submit',
                input: ({ context }) => toVerticalScaleInput(context.appEnvID, context.rows, context.container, context.operationName),
                onDone: { target: 'succeeded' },
                onError: { target: 'ready', actions: assign({ submitError: () => '提交失败，请重试' }) },
            },
        },
        succeeded: { type: 'final' },
    },
});
