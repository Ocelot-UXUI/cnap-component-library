import type {Account} from '@/interface/entities/account';
import type {Application} from '@/interface/entities/application';
import type {AppEnvironment} from '@/interface/entities/applicationEnvironment';

export type NavigationSelectorTabKey = 'all' | 'favorites' | 'recent' | 'production' | 'test';

export type NavigationSelectorIconType = 'application' | 'production-environment' | 'test-environment';

export interface NavigationSelectorOption {
    id: string;
    name: string;
    identifier?: string;
    favorite?: boolean;
    avatarText?: string;
    type?: string;
    typeLabel?: string;
    iconType?: NavigationSelectorIconType;
}

export type NavigationSelectorOptionGroups = Partial<
    Record<NavigationSelectorTabKey, NavigationSelectorOption[]>
>;

const avatarColors = ['#a1e8ce', '#b1d4ff', '#fee685', '#b8c4ff'];

function getAvatarText(name: string): string {
    return name.trim().slice(0, 1).toLowerCase() || '?';
}

function getAvatarColor(index: number): string {
    return avatarColors[index % avatarColors.length];
}

function byRecentOrder<TItem>(items: TItem[]): TItem[] {
    return items.slice(0, 4);
}

function byFavorite<TItem extends { favorite?: boolean; }>(items: TItem[]): TItem[] {
    return items.filter(item => item.favorite);
}

function getEnvironmentTypeLabel(environment: AppEnvironment): string {
    if (environment.environmentName.includes('生产')) {
        return '生产环境';
    }
    if (environment.environmentName.includes('测试') || environment.environmentName.includes('开发')) {
        return '测试环境';
    }
    return '特殊环境';
}

function getEnvironmentType(environment: AppEnvironment): string {
    return getEnvironmentTypeLabel(environment) === '生产环境' ? 'production' : 'test';
}

export function buildAccountSelectorOptionGroups(accounts: Account[]): NavigationSelectorOptionGroups {
    const all = accounts.map((account, index) => ({
        id: String(account.id),
        name: account.name,
        identifier: String(account.id),
        favorite: index < 2,
        avatarText: getAvatarText(account.name),
        type: getAvatarColor(index),
    }));

    return {
        all,
        favorites: byFavorite(all),
        recent: byRecentOrder(all),
    };
}

export function buildApplicationSelectorOptionGroups(
    applications: Application[],
): NavigationSelectorOptionGroups {
    const all = applications.map((application, index) => ({
        id: String(application.id),
        name: application.name,
        favorite: index < 2,
        avatarText: getAvatarText(application.name),
        type: getAvatarColor(index),
        iconType: 'application' as const,
    }));

    return {
        all,
        favorites: byFavorite(all),
        recent: byRecentOrder(all),
    };
}

export function buildEnvironmentSelectorOptionGroups(
    environments: AppEnvironment[],
): NavigationSelectorOptionGroups {
    const all = environments.map(environment => {
        const type = getEnvironmentType(environment);
        return {
            id: String(environment.id),
            name: environment.environmentName,
            iconType: type === 'production' ? 'production-environment' as const : 'test-environment' as const,
            type,
            typeLabel: getEnvironmentTypeLabel(environment),
        };
    });

    return {
        all,
        recent: byRecentOrder(all),
        production: all.filter(option => option.type === 'production'),
        test: all.filter(option => option.type === 'test'),
    };
}
