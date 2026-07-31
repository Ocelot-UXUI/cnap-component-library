import accountApi from '@/api/account';
import applicationEnvironmentApi from '@/api/applicationEnvironment';

import type {NavigationContextCandidates} from './navigationContextMachine';

export const defaultNavigationContextUserId = 'mock-user';

export const emptyNavigationContextCandidates: NavigationContextCandidates = {
    accounts: [],
    applications: [],
    environments: [],
};

export async function loadNavigationContextCandidates(
    _userId = defaultNavigationContextUserId,
): Promise<NavigationContextCandidates> {
    const accounts = await accountApi.getMany({ keyword: '' });
    const applicationResponses = await Promise.all(
        accounts.map(account => accountApi.getApplicationsByAccount({ accountID: account.id, keyword: '' })),
    );
    const applications = applicationResponses.flat();
    const environmentResponses = await Promise.all(
        applications.map(application => applicationEnvironmentApi.getEnvironments({ applicationID: application.id })),
    );
    return {
        accounts,
        applications,
        environments: environmentResponses.flat(),
    };
}
