import {WorkspacePrimaryNavigationContainer} from './primary/WorkspacePrimaryNavigationContainer';
import {WorkspaceSecondaryNavigationLayout} from './secondary/WorkspaceSecondaryNavigationLayout';

import type {WorkspaceNavigationItem} from './WorkspaceNavigationLayout.types';

export type {WorkspaceNavigationItem} from './WorkspaceNavigationLayout.types';

interface WorkspaceNavigationLayoutProps {
    activePrimaryKey: string;
    activeSecondaryKey: string;
    primaryItems: WorkspaceNavigationItem[];
    secondaryItems: WorkspaceNavigationItem[];
    secondaryTitle?: string;
    secondaryCollapsed: boolean;
    onPrimarySelect: (key: string) => void;
    onSecondarySelect: (key: string) => void;
    onSecondaryCollapseChange: (collapsed: boolean) => void;
}

export function WorkspaceNavigationLayout({
    activePrimaryKey,
    activeSecondaryKey,
    primaryItems,
    secondaryItems,
    secondaryTitle,
    secondaryCollapsed,
    onPrimarySelect,
    onSecondarySelect,
    onSecondaryCollapseChange,
}: WorkspaceNavigationLayoutProps) {
    return (
        <>
            <WorkspacePrimaryNavigationContainer
                activeKey={activePrimaryKey}
                items={primaryItems}
                onSelect={onPrimarySelect}
            />
            <WorkspaceSecondaryNavigationLayout
                activeKey={activeSecondaryKey}
                collapsed={secondaryCollapsed}
                items={secondaryItems}
                title={secondaryTitle}
                onCollapseChange={onSecondaryCollapseChange}
                onSelect={onSecondarySelect}
            />
        </>
    );
}
