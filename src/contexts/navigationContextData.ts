import type {Account} from '@/interface/entities/account';
import type {Application} from '@/interface/entities/account';
import type {AppEnvironment} from '@/interface/entities/applicationEnvironment';

export type {Account, AppEnvironment, Application};

export interface NavigationContextState {
    accountId?: string;
    applicationId?: string;
    environmentId?: string;
    clusterId?: string;
}

export interface StoredNavigationContext {
    current: NavigationContextState;
    byWorkspace: Record<string, NavigationContextState>;
}

interface NavigationContextCandidates {
    accounts: Account[];
    applications: Application[];
    environments: AppEnvironment[];
}

const STORAGE_KEY = 'cnap_navigation_context';

export function normalizeNavigationContext(
    context: NavigationContextState,
    candidates: NavigationContextCandidates,
): NavigationContextState {
    const accountId = candidates.accounts.some(account => account.id === context.accountId)
        ? context.accountId
        : undefined;
    const application = candidates.applications.find(item =>
        String(item.id) === context.applicationId && item.accountId === accountId
    );
    const environment = candidates.environments.find(
        item =>
            item.id === context.environmentId
            && item.applicationId === (application ? String(application.id) : undefined),
    );
    return {
        accountId,
        applicationId: application ? String(application.id) : undefined,
        environmentId: environment?.id,
        clusterId: environment ? context.clusterId : undefined,
    };
}

function isValidStoredContext(value: unknown): value is StoredNavigationContext {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const obj = value as Record<string, unknown>;
    if (typeof obj.current !== 'object' || obj.current === null) {
        return false;
    }
    const current = obj.current as Record<string, unknown>;
    const idKeys = ['accountId', 'applicationId', 'environmentId'] as const;
    for (const key of idKeys) {
        if (current[key] !== undefined && typeof current[key] !== 'string') {
            return false;
        }
    }
    if (current.clusterId !== undefined && typeof current.clusterId !== 'string') {
        return false;
    }
    return true;
}

function normalizeStoredShape(value: Partial<StoredNavigationContext>): StoredNavigationContext {
    return { current: value.current ?? {}, byWorkspace: value.byWorkspace ?? {} };
}

export function readStoredContext(): StoredNavigationContext {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return { current: {}, byWorkspace: {} };
        }
        const parsed = JSON.parse(raw) as unknown;
        if (!isValidStoredContext(parsed)) {
            localStorage.removeItem(STORAGE_KEY);
            return { current: {}, byWorkspace: {} };
        }
        return normalizeStoredShape(parsed as Partial<StoredNavigationContext>);
    } catch {
        return { current: {}, byWorkspace: {} };
    }
}

export function writeStoredContext(value: StoredNavigationContext): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeStoredShape(value)));
}

export function getWorkspaceStoredContext(workspaceKey: string): NavigationContextState {
    const storedContext = readStoredContext();
    return storedContext.byWorkspace[workspaceKey] ?? storedContext.current;
}
