import {describe, expect, it} from 'vitest';

import {toGetPodsParams} from '../filterParams';
import type {GroupQuery, PodFilterState} from '../types';

const baseFilter: PodFilterState = { status: [], blocked: undefined, keyword: '', quick: null };
const baseQuery: GroupQuery = { page: 1, pageSize: 10 };

describe('toGetPodsParams', () => {
    it('omits empty status/keyword and passes paging', () => {
        expect(toGetPodsParams('7', 'c1', 'g1', baseFilter, baseQuery)).toEqual({
            appEnvID: '7',
            clusterId: 'c1',
            groupId: 'g1',
            page: 1,
            pageSize: 10,
            sort: undefined,
            status: undefined,
            blocked: undefined,
            keyword: undefined,
        });
    });

    it('joins multi status with comma and trims keyword', () => {
        const filter: PodFilterState = {
            status: ['Running Ready', 'CrashLoopBackOff'],
            blocked: true,
            keyword: '  api  ',
            quick: 'abnormal',
        };
        const params = toGetPodsParams('1', undefined, 'g2', filter, { page: 2, pageSize: 20, sort: '-restarts' });
        expect(params.status).toBe('Running Ready,CrashLoopBackOff');
        expect(params.keyword).toBe('api');
        expect(params.blocked).toBe(true);
        expect(params.sort).toBe('-restarts');
        expect(params.page).toBe(2);
    });
});
