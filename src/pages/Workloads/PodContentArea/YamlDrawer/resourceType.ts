/**
 * 将 Workload 的 resourceType（格式 `group/version/resource`，如 `apps/v1/deployments`）
 * 解析为 getGroupVersionResource 所需的三段参数。
 *
 * 长度不为 3 时视为数据异常，返回 null。
 */
export interface GroupVersionResource {
    group: string;
    version: string;
    resource: string;
}

export function parseResourceType(resourceType: string | undefined): GroupVersionResource | null {
    if (!resourceType) {
        return null;
    }
    const parts = resourceType.split('/');
    if (parts.length !== 3 || parts.some(part => part.length === 0)) {
        return null;
    }
    const [group, version, resource] = parts;
    return { group, version, resource };
}
