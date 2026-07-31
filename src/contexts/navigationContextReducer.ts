import {writeStoredContext} from './navigationContextData';
import {createMachineContext, deriveRouteContext} from './navigationContextSnapshot';

import type {NavigationContextState, StoredNavigationContext} from './navigationContextData';
import type {NavigationContextCandidates, NavigationMachineContext} from './navigationContextSnapshot';

export type NavigationSelectionEvent =
    | { type: 'selectAccount'; accountId?: string; }
    | { type: 'selectApplication'; applicationId?: string; }
    | { type: 'selectEnvironment'; environmentId?: string; }
    | { type: 'selectCluster'; clusterId?: string; }
    | { type: 'restore'; context: NavigationContextState; }
    | { type: 'syncRouteContext'; context: NavigationContextState; }
    | { type: 'hydrateCandidates'; candidates: NavigationContextCandidates; }
    | { type: 'rememberWorkspace'; workspaceKey: string; }
    | { type: 'restoreWorkspace'; workspaceKey: string; }
    | { type: 'reloadClusters'; };

interface SelectionResult {
    nextContext: NavigationContextState;
    nextCandidates: NavigationContextCandidates;
    nextStored: StoredNavigationContext;
    persistCurrent: boolean;
}

function resolveHierarchySelection(
    context: NavigationMachineContext,
    event: NavigationSelectionEvent,
    base: SelectionResult,
): SelectionResult | undefined {
    switch (event.type) {
        case 'selectAccount':
            return { ...base, nextContext: { accountId: event.accountId } };
        case 'selectApplication':
            return {
                ...base,
                nextContext: { ...context.current, applicationId: event.applicationId, environmentId: undefined },
            };
        case 'selectEnvironment':
            return {
                ...base,
                nextContext: { ...context.current, environmentId: event.environmentId, clusterId: undefined },
            };
        case 'selectCluster':
            return { ...base, nextContext: { ...context.current, clusterId: event.clusterId } };
        default:
            return undefined;
    }
}

function resolveSelection(context: NavigationMachineContext, event: NavigationSelectionEvent): SelectionResult {
    const base: SelectionResult = {
        nextContext: context.current,
        nextCandidates: context.candidates,
        nextStored: context.storedContext,
        persistCurrent: true,
    };

    const hierarchy = resolveHierarchySelection(context, event, base);
    if (hierarchy) {
        return hierarchy;
    }

    switch (event.type) {
        case 'restore':
            return { ...base, nextContext: event.context };
        case 'syncRouteContext':
            return { ...base, nextContext: deriveRouteContext(event.context, context.candidates) };
        case 'hydrateCandidates':
            return {
                ...base,
                nextContext: deriveRouteContext(context.requested, event.candidates),
                nextCandidates: event.candidates,
            };
        case 'rememberWorkspace':
            return {
                ...base,
                persistCurrent: false,
                nextStored: {
                    ...context.storedContext,
                    byWorkspace: { ...context.storedContext.byWorkspace, [event.workspaceKey]: context.current },
                },
            };
        case 'restoreWorkspace': {
            const restored = context.storedContext.byWorkspace[event.workspaceKey] ?? context.storedContext.current;
            return {
                ...base,
                nextContext: restored,
                nextStored: { ...context.storedContext, current: restored },
            };
        }
        default:
            return base;
    }
}

export function applyNavigationSelection(
    context: NavigationMachineContext,
    event: NavigationSelectionEvent,
): NavigationMachineContext {
    const result = resolveSelection(context, event);
    const nextMachineContext = createMachineContext(result.nextContext, result.nextCandidates, result.nextStored);

    const storedToWrite = result.persistCurrent
        ? { ...result.nextStored, current: nextMachineContext.current }
        : nextMachineContext.storedContext;
    writeStoredContext(storedToWrite);

    return { ...nextMachineContext, optionGroupRef: context.optionGroupRef };
}
