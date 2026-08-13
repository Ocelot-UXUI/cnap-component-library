import {describe, expect, it} from 'vitest';
import {serializeGetAccessesParams} from './trafficAccess';

const serialize = (params: Record<string, unknown>) =>
    serializeGetAccessesParams.serialize(params);

describe('serializeGetAccessesParams', () => {
    it('type 数组序列化为重复 key（?type=service&type=headless）', () => {
        expect(serialize({type: ['service', 'headless'], page: 1})).toBe(
            'type=service&type=headless&page=1',
        );
    });

    it('null / undefined 参数被跳过', () => {
        expect(serialize({clusterId: null, workload: undefined, page: 1})).toBe('page=1');
    });

    it('标量参数按原样输出', () => {
        expect(serialize({clusterId: 'cluster-bjdd', workload: 'my-svc', page: 1, pageSize: 20})).toBe(
            'clusterId=cluster-bjdd&workload=my-svc&page=1&pageSize=20',
        );
    });
});
