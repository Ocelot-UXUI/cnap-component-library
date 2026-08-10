import {beforeEach, describe, expect, it, vi} from 'vitest';

import {writeStoredContext} from '@/contexts/navigationContextData';
import {router} from '@/routers';

import {executeNavigate} from './navigationTool';

vi.mock('@/routers', () => ({
    router: {
        navigate: vi.fn(),
    },
}));

describe('executeNavigate', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.mocked(router.navigate).mockClear();
    });

    it('returns structured facts when route key is missing', () => {
        const result = executeNavigate({});

        expect(result).toMatchObject({
            ok: false,
            tool: 'navigate',
            code: 'NAVIGATION_ROUTE_KEY_MISSING',
            phase: 'validate_input',
            data: { missingParams: ['routeKey'] },
        });
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('returns structured facts when target cannot be resolved', () => {
        const result = executeNavigate({ routeKey: 'missing.route' });

        expect(result).toMatchObject({
            ok: false,
            tool: 'navigate',
            code: 'NAVIGATION_TARGET_NOT_FOUND',
            phase: 'resolve_target',
            data: { requestedRouteKey: 'missing.route' },
        });
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('does not navigate when required context is missing', () => {
        writeStoredContext({
            current: { accountId: '1' },
            byWorkspace: {},
        });

        const result = executeNavigate({ routeKey: 'changes.pipelines' });

        expect(result).toMatchObject({
            ok: false,
            tool: 'navigate',
            code: 'NAVIGATION_CONTEXT_MISSING',
            phase: 'validate_context',
            data: {
                requiredContext: { accountId: true, applicationId: true, environmentId: true },
                currentContext: { accountId: '1' },
                missingContext: ['applicationId', 'environmentId'],
                invalidContext: [],
            },
        });
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('does not navigate when route params are missing', () => {
        writeStoredContext({
            current: { accountId: '1' },
            byWorkspace: {},
        });

        const result = executeNavigate({ routeKey: 'applications.runtimeConfig' });

        expect(result).toMatchObject({
            ok: false,
            tool: 'navigate',
            code: 'NAVIGATION_ROUTE_PARAM_MISSING',
            phase: 'validate_input',
            data: {
                routeTemplate: '/applications/{appId}/runtime-config',
                requiredParams: ['appId'],
                resolvedParams: {},
                missingParams: ['appId'],
            },
        });
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('navigates to target route when context and params are complete', () => {
        writeStoredContext({
            current: { accountId: '1', applicationId: '11' },
            byWorkspace: {},
        });

        const result = executeNavigate({
            routeKey: 'applications.runtimeConfig',
            routeParams: { appId: 'app-a-1' },
        });

        expect(result).toMatchObject({
            ok: true,
            tool: 'navigate',
            code: 'NAVIGATION_EXECUTED',
            phase: 'execute',
            data: { path: '/applications/app-a-1/runtime-config' },
        });
        expect(router.navigate).toHaveBeenCalledWith('/applications/app-a-1/runtime-config');
    });
});
