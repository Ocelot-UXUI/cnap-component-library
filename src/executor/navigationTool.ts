import {readStoredContext} from '@/contexts/navigationContextData';
import {
    getAgentNavigationTargets,
    getEffectiveContextRequirements,
    getNavigationNode,
} from '@/navigation';
import {router} from '@/routers';
import {routes} from '@/routes';
import type {AgentToolResult} from '@/types/agentTool';
import {getMissingParams, getRequiredContext} from './navigationToolData';
import type {ResolvedNavigationTarget} from './navigationToolData';
import {
    createExecutedResult,
    createExecutionFailedResult,
    createMissingContextResult,
    createMissingParamResult,
    createRouteKeyMissingResult,
    createTargetNotFoundResult,
} from './navigationToolResults';

function resolveRoute(routeKey: string): ResolvedNavigationTarget | undefined {
    const target = getAgentNavigationTargets().find(item => item.key === routeKey || item.routeKey === routeKey);
    if (target) {
        const node = getNavigationNode(target.key);
        return { route: node.route, node, target };
    }
    const route = routes[routeKey];
    return route ? { route } : undefined;
}

function getRouteParams(input: Record<string, unknown>): Record<string, string> | undefined {
    return input.routeParams && typeof input.routeParams === 'object'
        ? input.routeParams as Record<string, string>
        : undefined;
}

function executeResolvedNavigation(
    input: Record<string, unknown>,
    resolved: ResolvedNavigationTarget,
    routeParams: Record<string, string> | undefined,
    path: string,
): AgentToolResult {
    try {
        router.navigate(path);
        return createExecutedResult(input, resolved, routeParams, path);
    } catch (error) {
        return createExecutionFailedResult(input, resolved, path, error);
    }
}

export function executeNavigate(input: Record<string, unknown>): AgentToolResult {
    const routeKey = typeof input.routeKey === 'string' ? input.routeKey : undefined;
    if (!routeKey) {
        return createRouteKeyMissingResult(input);
    }
    const resolved = resolveRoute(routeKey);
    if (!resolved) {
        return createTargetNotFoundResult(input, routeKey);
    }
    const routeParams = getRouteParams(input);
    const path = resolved.route.toPath(routeParams);
    const missingParams = getMissingParams(path);
    if (missingParams.length > 0) {
        return createMissingParamResult(input, resolved, routeParams, missingParams);
    }
    const requiredContext = resolved.node ? getEffectiveContextRequirements(resolved.node) : {};
    const currentContext = readStoredContext().current;
    const missingContext = getRequiredContext(requiredContext).filter(key =>
        !currentContext[key as keyof typeof currentContext]
    );
    return missingContext.length > 0
        ? createMissingContextResult(input, resolved, routeParams, missingContext)
        : executeResolvedNavigation(input, resolved, routeParams, path);
}
