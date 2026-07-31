import {useEffect, useMemo, useState} from 'react';

import {usePrimaryNavigationOverflow} from './usePrimaryNavigationOverflow';
import {
    getNextPrimaryOrderAfterSelect,
    getVisiblePrimaryItems,
    sortPrimaryItems,
    syncStoredOrder,
} from './workspaceNavigationOrder';
import {
    readPrimaryNavVisibleOrder,
    writePrimaryNavVisibleOrder,
} from './workspaceNavigationStorage';
import {WorkspacePrimaryNavigationLayout} from './WorkspacePrimaryNavigationLayout';

import type {WorkspaceNavigationItem} from '../WorkspaceNavigationLayout.types';

interface WorkspacePrimaryNavigationContainerProps {
    activeKey: string;
    items: WorkspaceNavigationItem[];
    onSelect: (key: string) => void;
}

export function WorkspacePrimaryNavigationContainer({
    activeKey,
    items,
    onSelect,
}: WorkspacePrimaryNavigationContainerProps) {
    const [visibleOrder, setVisibleOrder] = useState<string[]>(() => readPrimaryNavVisibleOrder());
    const {
        businessRef,
        hiddenCount,
        primaryRef,
        utilityRef,
    } = usePrimaryNavigationOverflow(items.length);

    const orderedItems = useMemo(
        () => sortPrimaryItems(items, visibleOrder),
        [items, visibleOrder],
    );

    useEffect(() => {
        if (!items.length) {
            return;
        }
        setVisibleOrder(current => {
            const next = syncStoredOrder(current, items);
            writePrimaryNavVisibleOrder(next);
            return next;
        });
    }, [items]);

    const visibleItems = useMemo(
        () => getVisiblePrimaryItems(activeKey, hiddenCount, orderedItems),
        [activeKey, hiddenCount, orderedItems],
    );

    const hiddenItems = orderedItems.filter(
        item => !visibleItems.some(visible => visible.key === item.key),
    );

    const handleSelect = (key: string) => {
        const nextOrder = getNextPrimaryOrderAfterSelect(key, orderedItems, visibleItems);
        if (nextOrder) {
            setVisibleOrder(nextOrder);
            writePrimaryNavVisibleOrder(nextOrder);
        }
        onSelect(key);
    };

    return (
        <WorkspacePrimaryNavigationLayout
            activeKey={activeKey}
            businessRef={businessRef}
            hiddenItems={hiddenItems}
            primaryRef={primaryRef}
            utilityRef={utilityRef}
            visibleItems={visibleItems}
            onSelect={handleSelect}
        />
    );
}
