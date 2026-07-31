import {beforeEach, describe, expect, it, vi} from 'vitest';

import {writeStoredContext} from '@/contexts/navigationContextData';
import {router} from '@/routers';
import {agentCapabilities, getAgentCapability} from './registry';

vi.mock('@/routers', () => ({
    router: {
        navigate: vi.fn(),
    },
}));

describe('agentCapabilities registry', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.mocked(router.navigate).mockClear();
    });

    it('registers navigation and context capabilities', () => {
        expect(agentCapabilities.map(capability => capability.id)).toEqual([
            'navigate',
            'selectAccount',
            'selectApplication',
            'selectEnvironment',
            'listAvailableAccounts',
            'listAvailableApplications',
            'listAvailableEnvironments',
        ]);
    });

    it('uses structured result envelopes for list capabilities', () => {
        const result = getAgentCapability('listAvailableAccounts')?.execute({});

        expect(result).toMatchObject({
            ok: true,
            tool: 'listAvailableAccounts',
            code: 'CONTEXT_CANDIDATES_LISTED',
            phase: 'execute',
        });
        expect(result?.data?.availableAccounts).toEqual(expect.any(Array));
    });

    it('selects context through controlled capability execution', () => {
        const result = getAgentCapability('selectApplication')?.execute({ applicationId: 999 });

        expect(result).toMatchObject({
            ok: false,
            tool: 'selectApplication',
            code: 'CONTEXT_INVALID',
            data: { invalidContext: ['applicationId'] },
        });
    });

    it('delegates navigate through the registry without fallback navigation', () => {
        writeStoredContext({ current: { accountId: '1' }, byWorkspace: {} });

        const result = getAgentCapability('navigate')?.execute({ routeKey: 'changes.pipelines' });

        expect(result).toMatchObject({
            ok: false,
            tool: 'navigate',
            code: 'NAVIGATION_CONTEXT_MISSING',
        });
        expect(router.navigate).not.toHaveBeenCalled();
    });
});
