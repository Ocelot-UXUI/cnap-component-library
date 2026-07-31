import type {WorkspaceNavigationItem} from '../WorkspaceNavigationLayout.types';

export function syncStoredOrder(current: string[], items: WorkspaceNavigationItem[]): string[] {
    const existing = current.filter(key => items.some(item => item.key === key));
    const missing = items.map(item => item.key).filter(key => !existing.includes(key));
    return [...existing, ...missing];
}

export function sortPrimaryItems(
    items: WorkspaceNavigationItem[],
    visibleOrder: string[],
): WorkspaceNavigationItem[] {
    const order = visibleOrder.length ? visibleOrder : items.map(item => item.key);
    const rank = new Map(order.map((key, index) => [key, index]));
    return [...items].sort((left, right) => (
        (rank.get(left.key) ?? items.length) - (rank.get(right.key) ?? items.length)
    ));
}

export function getVisiblePrimaryItems(
    activeKey: string,
    hiddenCount: number,
    items: WorkspaceNavigationItem[],
): WorkspaceNavigationItem[] {
    const maxVisible = Math.max(1, items.length - hiddenCount);
    const visible = items.slice(0, maxVisible);
    if (visible.some(item => item.key === activeKey)) {
        return visible;
    }
    const activeItem = items.find(item => item.key === activeKey);
    if (!activeItem) {
        return visible;
    }
    return [...visible.slice(0, Math.max(0, visible.length - 1)), activeItem];
}

export function getNextPrimaryOrderAfterSelect(
    key: string,
    orderedItems: WorkspaceNavigationItem[],
    visibleItems: WorkspaceNavigationItem[],
): string[] | undefined {
    const visibleKeys = visibleItems.map(item => item.key);
    if (visibleKeys.includes(key)) {
        return undefined;
    }
    const replacementKey = visibleKeys[visibleKeys.length - 1];
    const nextOrder = orderedItems.map(item => item.key).filter(itemKey => itemKey !== key);
    const replacementIndex = nextOrder.indexOf(replacementKey);
    nextOrder.splice(Math.max(0, replacementIndex), 0, key);
    return nextOrder;
}
