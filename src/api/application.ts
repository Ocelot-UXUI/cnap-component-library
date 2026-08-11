import type {ApplicationListResult} from '@/interface/entities/application';
import {createInterface} from './services/primary';

interface ParamsGetApplicationsByAccount {
    /** 账号 ID */
    accountId: string;
    /** 按应用名称、展示名称模糊搜索 */
    keyword?: string;
    /** 应用业务类型 */
    type?: string;
    /** 环境 id */
    environmentId?: number;
    /** 用户标签 ID，可多选 */
    labelIds?: number[];
    /** 页码，从 1 开始 */
    page?: number;
    /** 每页数量，范围为 1～100 */
    pageSize?: number;
}

/**
 * 获取账号下的应用列表
 *
 * GET /rest/v1/accounts/{accountID}/applications
 */
const getApplicationsByAccount = createInterface<ParamsGetApplicationsByAccount, ApplicationListResult>(
    'GET',
    '/accounts/{accountId}/applications',
);

export default {
    getApplicationsByAccount,
};
