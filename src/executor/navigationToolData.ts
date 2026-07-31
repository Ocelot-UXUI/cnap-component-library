import type {AgentNavigationTarget, ContextRequirements, NavigationNode} from '@/navigation';
import type {Route} from '@/routes';

const ROUTE_PARAM_PATTERN = /\{(\w+)\}/g;

export interface ResolvedNavigationTarget {
    route: Route;
    node?: NavigationNode;
    target?: AgentNavigationTarget;
}

export function getMissingParams(path: string): string[] {
    const missingParams: string[] = [];
    let match: RegExpExecArray | null;
    const regex = new RegExp(ROUTE_PARAM_PATTERN.source, ROUTE_PARAM_PATTERN.flags);
    while ((match = regex.exec(path)) !== null) {
        missingParams.push(match[1]);
    }
    return missingParams;
}

export function getRequiredContext(requirements: ContextRequirements): string[] {
    return Object.keys(requirements).filter(key => requirements[key as keyof ContextRequirements]);
}

export function getTargetData(resolved: ResolvedNavigationTarget): Record<string, unknown> {
    const target = resolved.target ?? resolved.node;
    return {
        target: target
            ? {
                key: target.key,
                routeKey: resolved.target?.routeKey,
                label: target.label,
                workspaceKey: target.workspaceKey,
            }
            : undefined,
        routeTemplate: resolved.route.path,
    };
}
