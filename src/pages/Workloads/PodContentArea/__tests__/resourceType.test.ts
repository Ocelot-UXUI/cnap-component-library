import {describe, expect, it} from 'vitest';

import {parseResourceType} from '../YamlDrawer/resourceType';

describe('parseResourceType', () => {
    it('parses group/version/resource', () => {
        expect(parseResourceType('apps/v1/deployments')).toEqual({
            group: 'apps',
            version: 'v1',
            resource: 'deployments',
        });
    });

    it('returns null for wrong segment count', () => {
        expect(parseResourceType('v1/pods')).toBeNull();
        expect(parseResourceType('apps/v1/deployments/extra')).toBeNull();
    });

    it('returns null for empty segments', () => {
        expect(parseResourceType('apps//deployments')).toBeNull();
        expect(parseResourceType('/v1/deployments')).toBeNull();
    });

    it('returns null for empty or undefined input', () => {
        expect(parseResourceType('')).toBeNull();
        expect(parseResourceType(undefined)).toBeNull();
    });
});
