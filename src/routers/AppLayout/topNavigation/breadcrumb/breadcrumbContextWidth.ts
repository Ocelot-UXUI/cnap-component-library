export function getBreadcrumbSelectorMaxWidth(containerWidth: number, itemCount: number): number | undefined {
    if (!containerWidth || itemCount <= 0) {
        return undefined;
    }
    return (containerWidth / itemCount) * 1.2;
}
