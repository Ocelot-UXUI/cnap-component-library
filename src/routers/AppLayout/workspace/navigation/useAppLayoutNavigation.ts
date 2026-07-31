import {useMemo} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

import {navigationActions} from '@/contexts/NavigationContext';
import {
    getEffectiveContextRequirements,
    getNavigationNode,
    getSidebarGroups,
    getWorkspaceMenuGroup,
    resolveActiveNode,
    resolveActiveWorkspace,
    resolveSecondLevelNode,
} from '@/navigation';

import {navigationIcons} from './navigationIcons';

import type {WorkspaceNavigationItem} from './WorkspaceNavigationLayout.types';

export function useAppLayoutNavigation() {
    const location = useLocation();
    const navigate = useNavigate();
    const { rememberWorkspaceContext, restoreWorkspaceContext } = navigationActions;

    const activeNode = useMemo(() => resolveActiveNode(location.pathname), [location.pathname]);
    const activeWorkspace = useMemo(() => resolveActiveWorkspace(location.pathname), [location.pathname]);
    const contextRequirements = useMemo(() => getEffectiveContextRequirements(activeNode), [activeNode]);
    const selectedKey = useMemo(() => resolveSecondLevelNode(activeNode).key, [activeNode]);

    const primaryItems = useMemo<WorkspaceNavigationItem[]>(
        () =>
            getWorkspaceMenuGroup().items.map(item => ({
                key: item.key,
                icon: navigationIcons[item.key],
                label: item.label,
            })),
        [],
    );

    const sidebarGroups = useMemo(() => getSidebarGroups(activeWorkspace), [activeWorkspace]);

    const secondaryItems = useMemo<WorkspaceNavigationItem[]>(
        () =>
            sidebarGroups.flatMap(group =>
                group.items.map(item => ({
                    key: item.key,
                    icon: navigationIcons[item.key],
                    label: item.label,
                }))
            ),
        [sidebarGroups],
    );

    const secondaryTitle = sidebarGroups[0]?.title;

    const activePrimaryKey = useMemo(
        () =>
            primaryItems.find(
                item => getNavigationNode(item.key as never).workspaceKey === activeWorkspace,
            )?.key ?? selectedKey,
        [activeWorkspace, primaryItems, selectedKey],
    );

    const onSelect = (key: string) => {
        const selectedNode = getNavigationNode(key as never);
        rememberWorkspaceContext(activeWorkspace);
        restoreWorkspaceContext(selectedNode.workspaceKey);
        navigate(selectedNode.route.toPath());
    };

    return {
        activePrimaryKey,
        contextRequirements,
        pathname: location.pathname,
        primaryItems,
        secondaryItems,
        secondaryTitle,
        selectedKey,
        onSelect,
    };
}
