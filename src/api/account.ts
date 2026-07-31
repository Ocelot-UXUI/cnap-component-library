import type {Account, Application} from '@/interface/entities/account';
import {createInterface} from './services/primary';

interface ParamsGetAccounts {
    /** 查询关键字 */
    keyword: string;
}

interface ParamsGetApplicationsByAccount {
    /** 账号 ID */
    accountID: string;
    /** 查询关键字 */
    keyword: string;
}

/**
 * 查询账号列表
 *
 * GET /rest/v1/accounts
 */
const getMany = createInterface<ParamsGetAccounts, Account[]>(
    'GET',
    '/accounts',
);

/**
 * 查询账号下应用列表
 *
 * GET /rest/v1/accounts/:accountID/applications
 */
const getApplicationsByAccount = createInterface<ParamsGetApplicationsByAccount, Application[]>(
    'GET',
    '/accounts/{accountID}/applications',
);

export default {
    getMany,
    getApplicationsByAccount,
};
