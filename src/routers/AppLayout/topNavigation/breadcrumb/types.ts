import type {ReactNode} from 'react';

export type BreadcrumbDimensionType = 'account' | 'application' | 'environment' | 'cluster';

export interface BreadcrumbSelectorOption {
    id: string;
    name: string;
    identifier?: string;
    favorite?: boolean;
    avatarText?: string;
    type?: string;
    typeLabel?: string;
    icon?: ReactNode;
}
