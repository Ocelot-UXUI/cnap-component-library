import {describe, expect, it} from 'vitest';
import {createRouteFactory} from '../create';

describe('createRouteFactory', () => {
    it('generates internal paths without basename', () => {
        const { route } = createRouteFactory('/devops/cnap');
        expect(route('/home').toPath()).toBe('/home');
    });

    it('generates external urls with basename', () => {
        const { route } = createRouteFactory('/devops/cnap');
        expect(route('/home').toUrl()).toBe('/devops/cnap/home');
    });

    it('replaces dynamic params for both internal paths and external urls', () => {
        const { route } = createRouteFactory('/devops/cnap');
        const applicationRoute = route('/applications/{appId}/overview');
        expect(applicationRoute.toPath({ appId: 'app-1' })).toBe('/applications/app-1/overview');
        expect(applicationRoute.toUrl({ appId: 'app-1' })).toBe('/devops/cnap/applications/app-1/overview');
    });
});
