import {readStoredContext} from '@/contexts/navigationContextData';
import {getEffectiveContextRequirements} from '@/navigation';
import type {AgentToolResult} from '@/types/agentTool';
import {getMissingParams, getTargetData} from './navigationToolData';
import type {ResolvedNavigationTarget} from './navigationToolData';

const NAVIGATE_TOOL = 'navigate';

function createResult(result: Omit<AgentToolResult, 'tool'>): AgentToolResult {
    return { tool: NAVIGATE_TOOL, ...result };
}

export function createRouteKeyMissingResult(input: Record<string, unknown>): AgentToolResult {
    return createResult({
        ok: false,
        code: 'NAVIGATION_ROUTE_KEY_MISSING',
        phase: 'validate_input',
        input,
        data: { missingParams: ['routeKey'] },
        error: { code: 'NAVIGATION_ROUTE_KEY_MISSING' },
    });
}

export function createTargetNotFoundResult(input: Record<string, unknown>, routeKey: string): AgentToolResult {
    return createResult({
        ok: false,
        code: 'NAVIGATION_TARGET_NOT_FOUND',
        phase: 'resolve_target',
        input,
        data: { requestedRouteKey: routeKey },
        error: { code: 'NAVIGATION_TARGET_NOT_FOUND', details: { routeKey } },
    });
}

export function createMissingParamResult(
    input: Record<string, unknown>,
    resolved: ResolvedNavigationTarget,
    routeParams: Record<string, string> | undefined,
    missingParams: string[],
): AgentToolResult {
    return createResult({
        ok: false,
        code: 'NAVIGATION_ROUTE_PARAM_MISSING',
        phase: 'validate_input',
        input,
        data: {
            ...getTargetData(resolved),
            requiredParams: getMissingParams(resolved.route.path),
            resolvedParams: routeParams ?? {},
            missingParams,
        },
        error: { code: 'NAVIGATION_ROUTE_PARAM_MISSING', details: { missingParams } },
    });
}

export function createMissingContextResult(
    input: Record<string, unknown>,
    resolved: ResolvedNavigationTarget,
    routeParams: Record<string, string> | undefined,
    missingContext: string[],
): AgentToolResult {
    const requiredContext = resolved.node ? getEffectiveContextRequirements(resolved.node) : {};
    return createResult({
        ok: false,
        code: 'NAVIGATION_CONTEXT_MISSING',
        phase: 'validate_context',
        input,
        data: {
            ...getTargetData(resolved),
            requiredParams: getMissingParams(resolved.route.path),
            resolvedParams: routeParams ?? {},
            missingParams: [],
            requiredContext,
            currentContext: readStoredContext().current,
            missingContext,
            invalidContext: [],
        },
        error: { code: 'NAVIGATION_CONTEXT_MISSING', details: { missingContext } },
    });
}

export function createExecutionFailedResult(
    input: Record<string, unknown>,
    resolved: ResolvedNavigationTarget,
    path: string,
    error: unknown,
): AgentToolResult {
    return createResult({
        ok: false,
        code: 'NAVIGATION_EXECUTION_FAILED',
        phase: 'execute',
        input,
        data: { ...getTargetData(resolved), path },
        error: {
            code: 'NAVIGATION_EXECUTION_FAILED',
            details: { message: error instanceof Error ? error.message : 'Unknown navigation error' },
        },
    });
}

export function createExecutedResult(
    input: Record<string, unknown>,
    resolved: ResolvedNavigationTarget,
    routeParams: Record<string, string> | undefined,
    path: string,
): AgentToolResult {
    const requiredContext = resolved.node ? getEffectiveContextRequirements(resolved.node) : {};
    return createResult({
        ok: true,
        code: 'NAVIGATION_EXECUTED',
        phase: 'execute',
        input,
        data: {
            ...getTargetData(resolved),
            requiredParams: getMissingParams(resolved.route.path),
            resolvedParams: routeParams ?? {},
            missingParams: [],
            requiredContext,
            currentContext: readStoredContext().current,
            missingContext: [],
            invalidContext: [],
            path,
        },
    });
}
