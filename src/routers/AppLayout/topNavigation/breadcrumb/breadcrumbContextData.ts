import {
    ApiOutlined,
    AppstoreOutlined,
    ClusterOutlined,
} from '@ant-design/icons';
import {createElement} from 'react';

import type {NavigationSelectorOptionGroups} from '@/contexts/navigationSelectorBuilders';
import type {BreadcrumbSelectorOption} from './types';

function mapOptionIcon(iconType?: string) {
    if (iconType === 'application') {
        return createElement(AppstoreOutlined);
    }
    if (iconType === 'production-environment') {
        return createElement(ClusterOutlined);
    }
    if (iconType === 'test-environment') {
        return createElement(ApiOutlined);
    }
    return undefined;
}

export function mapBreadcrumbOptionGroups(
    optionGroups: NavigationSelectorOptionGroups,
): Record<string, BreadcrumbSelectorOption[]> {
    return Object.fromEntries(
        Object.entries(optionGroups).map(([key, options]) => [
            key,
            options.map(option => ({
                id: option.id,
                name: option.name,
                identifier: option.identifier,
                favorite: option.favorite,
                avatarText: option.avatarText,
                type: option.type,
                typeLabel: option.typeLabel,
                icon: mapOptionIcon(option.iconType),
            })),
        ]),
    );
}
