import {routes} from '@/routes';
import {navigationNodes, workspaces} from './registry';
import type {
    AgentNavigationTarget,
    ContextRequirements,
    NavigationMenuGroup,
    NavigationNode,
    NavigationNodeKey,
    WorkspaceKey,
} from './types';

const PARAM_PATTERN = /\{(\w+)\}/g;

// 将 registry 转成按 key 查询的索引，供派生函数快速定位导航节点和工作区。
export const nodeByKey = new Map(navigationNodes.map(node => [node.key, node]));
export const workspaceByKey = new Map(workspaces.map(workspace => [workspace.key, workspace]));

// 根据 route path 反查 route key，用于生成 Agent 可读的导航目标元数据。
const routeKeyByPath = new Map(Object.entries(routes).map(([key, route]) => [route.path, key]));

// 标准化当前 URL path，去掉 query 和末尾斜杠，避免匹配时出现等价路径不一致。
function normalizePath(pathname: string): string {
    const cleanPath = pathname.split('?')[0].replace(/\/$/, '') || '/';
    return cleanPath;
}

// 计算 route path 对当前 pathname 的匹配分数；更长的路径代表更具体的导航节点。
function scorePathMatch(routePath: string, pathname: string): number {
    const pattern = `^${routePath.replace(/\{\w+\}/g, '[^/]+')}(?:/|$)`;
    return new RegExp(pattern).test(pathname) ? routePath.length : -1;
}

// 从 route path 中提取动态参数名，例如 /applications/{appId} 会得到 appId。
function getRouteParams(path: string): string[] {
    const params: string[] = [];
    let match: RegExpExecArray | null;
    const regex = new RegExp(PARAM_PATTERN.source, PARAM_PATTERN.flags);
    while ((match = regex.exec(path)) !== null) {
        params.push(match[1]);
    }
    return params;
}

// 通过稳定的 navigation node key 获取导航节点；key 不存在时直接暴露配置错误。
export function getNavigationNode(key: NavigationNodeKey): NavigationNode {
    const node = nodeByKey.get(key);
    if (!node) {
        throw new Error(`Unknown navigation node: ${key}`);
    }
    return node;
}

// 根据当前 URL 解析最匹配的导航节点，用于菜单高亮、工作区识别和上下文判断。
export function resolveActiveNode(pathname: string): NavigationNode {
    const normalized = normalizePath(pathname);
    const candidates = navigationNodes
        .map(node => ({ node, score: scorePathMatch(node.route.path, normalized) }))
        .filter(candidate => candidate.score >= 0)
        .sort((a, b) => b.score - a.score);
    return candidates[0]?.node ?? getNavigationNode('home.dashboard');
}

// 根据当前 URL 解析所属一级工作区。
export function resolveActiveWorkspace(pathname: string): WorkspaceKey {
    return resolveActiveNode(pathname).workspaceKey;
}

// 向上查找所属二级导航节点；三级及以下子路由统一继承二级节点配置。
export function resolveSecondLevelNode(node: NavigationNode): NavigationNode {
    if (node.level === 'secondary') {
        return node;
    }
    if (node.parentKey) {
        return resolveSecondLevelNode(getNavigationNode(node.parentKey));
    }
    return node;
}

// 获取节点最终生效的上下文需求；子路由可覆盖所属二级节点的需求。
export function getEffectiveContextRequirements(node: NavigationNode): ContextRequirements {
    if (node.contextRequirements) {
        return node.contextRequirements;
    }
    const secondLevelNode = resolveSecondLevelNode(node);
    return secondLevelNode.level === 'secondary' ? secondLevelNode.contextRequirements ?? {} : {};
}

// 生成一级工作区导航菜单；点击工作区时进入该工作区的默认导航节点。
export function getWorkspaceMenuGroup(): NavigationMenuGroup {
    return {
        items: workspaces.map(workspace => {
            const node = getNavigationNode(workspace.defaultNodeKey);
            return { key: node.key, label: workspace.label, url: node.route.toPath() };
        }),
    };
}

// 生成当前工作区的二级导航菜单，只包含 registry 中声明为可见的节点。
export function getSidebarGroups(workspaceKey: WorkspaceKey): NavigationMenuGroup[] {
    const visibleNodes = navigationNodes.filter(node => node.visibleInSidebar && node.workspaceKey === workspaceKey);
    const workspace = workspaceByKey.get(workspaceKey);
    return [{
        title: workspace?.label,
        divider: true,
        items: visibleNodes.map(node => ({ key: node.key, label: node.label, url: node.route.toPath() })),
    }].filter(group => group.items.length > 0);
}

export interface NavigationContextResolution {
    node: NavigationNode;
    reachable: boolean;
}

// 根据当前路径和上下文判断目标是否可达；缺少必需上下文时保留原目标并标记不可达。
export function resolveContextReachability(
    pathname: string,
    context: Partial<Record<string, string>>,
): NavigationContextResolution {
    const activeNode = resolveActiveNode(pathname);
    const requirements = getEffectiveContextRequirements(activeNode);
    const missingRequiredContext = Object.keys(requirements).some(key => !context[key]);
    return { node: activeNode, reachable: !missingRequiredContext };
}

// 将导航 registry 转成 Agent 可消费的结构化导航目标列表。
export function getAgentNavigationTargets(): AgentNavigationTarget[] {
    return navigationNodes.map(node => ({
        key: node.key,
        label: node.label,
        workspaceKey: node.workspaceKey,
        routeKey: routeKeyByPath.get(node.route.path) ?? node.key,
        params: getRouteParams(node.route.path),
        contextRequirements: getEffectiveContextRequirements(node),
        agentDescription: node.agentDescription,
    }));
}
