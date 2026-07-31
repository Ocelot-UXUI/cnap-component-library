import type {AppEnvironmentCluster} from '@/interface/entities/applicationEnvironment';
import type {NavigationSelectorOptionGroups} from './navigationSelectorBuilders';

export type OptionGroupStatus = 'idle' | 'loading' | 'done' | 'error';

export interface OptionGroupState {
    status: OptionGroupStatus;
    data: NavigationSelectorOptionGroups;
}

export interface ClusterOptionGroupState {
    status: OptionGroupStatus;
    data: AppEnvironmentCluster[];
}

export interface OptionGroupSnapshot {
    account: OptionGroupState;
    application: OptionGroupState;
    environment: OptionGroupState;
    cluster: ClusterOptionGroupState;
}

export interface OptionGroupMachineContext {
    accountId?: string;
    applicationId?: string;
    appEnvID?: string;
    account: OptionGroupState;
    application: OptionGroupState;
    environment: OptionGroupState;
    cluster: ClusterOptionGroupState;
}

export type OptionGroupMachineEvent =
    | { type: 'accountChanged'; accountId?: string; }
    | { type: 'applicationChanged'; applicationId?: string; }
    | { type: 'environmentChanged'; appEnvID?: string; };

export const idleOptionGroupState: OptionGroupState = { status: 'idle', data: {} };

export const idleClusterOptionGroupState: ClusterOptionGroupState = { status: 'idle', data: [] };

export function selectOptionGroupSnapshot(context: OptionGroupMachineContext): OptionGroupSnapshot {
    return {
        account: context.account,
        application: context.application,
        environment: context.environment,
        cluster: context.cluster,
    };
}
