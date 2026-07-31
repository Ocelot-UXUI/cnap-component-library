import {navigationActor} from '@/contexts/navigationActor';
import {selectNavigationSnapshot} from '@/contexts/navigationContextMachine';
import type {AgentToolResult} from '@/types/agentTool';

function createContextResult(result: Omit<AgentToolResult, 'tool'> & { tool: string; }): AgentToolResult {
    return result;
}

function getSnapshotData(): Record<string, unknown> {
    const snapshot = selectNavigationSnapshot(navigationActor.getSnapshot());
    return {
        currentContext: snapshot.current,
        invalidContext: snapshot.invalidContext,
        availableAccounts: snapshot.accounts,
        availableApplications: snapshot.availableApplications,
        availableEnvironments: snapshot.availableEnvironments,
    };
}

function readContextResult(tool: string, input: Record<string, unknown>): AgentToolResult {
    const snapshot = selectNavigationSnapshot(navigationActor.getSnapshot());
    const ok = snapshot.invalidContext.length === 0;
    return createContextResult({
        ok,
        tool,
        code: ok ? 'CONTEXT_SELECTED' : 'CONTEXT_INVALID',
        phase: 'execute',
        input,
        data: getSnapshotData(),
        error: ok ? undefined : { code: 'CONTEXT_INVALID', details: { invalidContext: snapshot.invalidContext } },
    });
}

export function listAvailableAccounts(input: Record<string, unknown>): AgentToolResult {
    return createContextResult({
        ok: true,
        tool: 'listAvailableAccounts',
        code: 'CONTEXT_CANDIDATES_LISTED',
        phase: 'execute',
        input,
        data: getSnapshotData(),
    });
}

export function listAvailableApplications(input: Record<string, unknown>): AgentToolResult {
    return createContextResult({
        ok: true,
        tool: 'listAvailableApplications',
        code: 'CONTEXT_CANDIDATES_LISTED',
        phase: 'execute',
        input,
        data: getSnapshotData(),
    });
}

export function listAvailableEnvironments(input: Record<string, unknown>): AgentToolResult {
    return createContextResult({
        ok: true,
        tool: 'listAvailableEnvironments',
        code: 'CONTEXT_CANDIDATES_LISTED',
        phase: 'execute',
        input,
        data: getSnapshotData(),
    });
}

export function selectAccount(input: Record<string, unknown>): AgentToolResult {
    const accountId = input.accountId ? String(input.accountId) : undefined;
    navigationActor.send({ type: 'selectAccount', accountId });
    return readContextResult('selectAccount', input);
}

export function selectApplication(input: Record<string, unknown>): AgentToolResult {
    const applicationId = input.applicationId ? String(input.applicationId) : undefined;
    navigationActor.send({ type: 'selectApplication', applicationId });
    return readContextResult('selectApplication', input);
}

export function selectEnvironment(input: Record<string, unknown>): AgentToolResult {
    const environmentId = input.environmentId ? String(input.environmentId) : undefined;
    navigationActor.send({ type: 'selectEnvironment', environmentId });
    return readContextResult('selectEnvironment', input);
}

export const contextInputSchemas = {
    selectAccount: {
        type: 'object',
        properties: { accountId: { type: 'number' } },
        required: ['accountId'],
    },
    selectApplication: {
        type: 'object',
        properties: { applicationId: { type: 'number' } },
        required: ['applicationId'],
    },
    selectEnvironment: {
        type: 'object',
        properties: { environmentId: { type: 'number' } },
        required: ['environmentId'],
    },
    list: { type: 'object', properties: {}, required: [] },
} as const;
