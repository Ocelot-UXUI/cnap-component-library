import {normalizeNavigationContext, readStoredContext} from './navigationContextData';

import type {ActorRefFrom} from 'xstate';
import type {
    Account,
    AppEnvironment,
    Application,
    NavigationContextState,
    StoredNavigationContext,
} from './navigationContextData';
import type {optionGroupMachine} from './navigationOptionGroupMachine';
import type {OptionGroupSnapshot} from './navigationOptionGroupTypes';
import {selectOptionGroupSnapshot} from './navigationOptionGroupTypes';

export interface NavigationContextCandidates {
    accounts: Account[];
    applications: Application[];
    environments: AppEnvironment[];
}

export interface NavigationContextSnapshot extends NavigationContextCandidates, NavigationContextState {
    current: NavigationContextState;
    availableApplications: Application[];
    availableEnvironments: AppEnvironment[];
    invalidContext: string[];
    loading: boolean;
    storedContext: StoredNavigationContext;
    optionGroups?: OptionGroupSnapshot;
}

export interface NavigationMachineContext {
    current: NavigationContextState;
    requested: NavigationContextState;
    invalidContext: string[];
    candidates: NavigationContextCandidates;
    storedContext: StoredNavigationContext;
    optionGroupRef?: ActorRefFrom<typeof optionGroupMachine>;
}

function getInvalidContext(input: NavigationContextState, normalized: NavigationContextState): string[] {
    return (['accountId', 'applicationId', 'environmentId', 'clusterId'] as const).filter(key =>
        input[key] && input[key] !== normalized[key]
    );
}

export function deriveRouteContext(
    context: NavigationContextState,
    candidates: NavigationContextCandidates,
): NavigationContextState {
    const environment = candidates.environments.find(item => item.id === context.environmentId);
    const application = candidates.applications.find(item =>
        String(item.id) === (context.applicationId ?? environment?.applicationId)
    );
    return {
        accountId: context.accountId ?? application?.accountId,
        applicationId: context.applicationId ?? environment?.applicationId,
        environmentId: context.environmentId,
        clusterId: context.environmentId ? context.clusterId : undefined,
    };
}

export function createMachineContext(
    current: NavigationContextState,
    candidates: NavigationContextCandidates,
    storedContext: StoredNavigationContext,
): NavigationMachineContext {
    const normalized = normalizeNavigationContext(current, candidates);
    return {
        current: normalized,
        requested: current,
        invalidContext: getInvalidContext(current, normalized),
        candidates,
        storedContext,
    };
}

const snapshotCache = new WeakMap<NavigationMachineContext, NavigationContextSnapshot>();

export function getSnapshot(context: NavigationMachineContext): NavigationContextSnapshot {
    const cached = snapshotCache.get(context);
    if (cached) {
        return cached;
    }
    const optionGroups = context.optionGroupRef
        ? selectOptionGroupSnapshot(context.optionGroupRef.getSnapshot().context)
        : undefined;
    const snapshot: NavigationContextSnapshot = {
        ...context.current,
        current: context.current,
        accounts: context.candidates.accounts,
        applications: context.candidates.applications,
        environments: context.candidates.environments,
        availableApplications: context.candidates.applications.filter(item =>
            item.accountId === context.current.accountId
        ),
        availableEnvironments: context.candidates.environments.filter(
            item => item.applicationId === context.current.applicationId,
        ),
        invalidContext: context.invalidContext,
        loading: false,
        storedContext: context.storedContext,
        optionGroups,
    };
    snapshotCache.set(context, snapshot);
    return snapshot;
}

export function selectNavigationSnapshot(
    state: { context: NavigationMachineContext; },
): NavigationContextSnapshot {
    return getSnapshot(state.context);
}

/**
 * 解析当前上下文的 appEnvID（应用环境关系 ID，供 runtime 接口使用）。
 *
 * 注意：`NavigationContextState.environmentId` 存储的即选中环境的 `AppEnvironment.id`（= appEnvID）。
 * 此处按 `availableEnvironments` 校验其有效性；未选中或无有效匹配时返回 undefined。
 */
export function selectAppEnvID(snapshot: NavigationContextSnapshot): string | undefined {
    const { environmentId, availableEnvironments } = snapshot;
    if (environmentId === undefined) {
        return undefined;
    }
    return availableEnvironments.some(environment => environment.id === environmentId)
        ? environmentId
        : undefined;
}

export function getNavigationContextSnapshot(
    context: NavigationContextState,
    candidates: NavigationContextCandidates,
): NavigationContextSnapshot {
    return getSnapshot(createMachineContext(context, candidates, readStoredContext()));
}
