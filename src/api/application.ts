import type {
    ApplicationCollectionResult,
    ApplicationFilterOptions,
    ApplicationListResult,
} from '@/interface/entities/application';
import {createInterface} from './services/primary';

interface ParamsGetApplicationsByAccount {
    /** 账号 ID */
    accountId: string;
    /** 按应用名称、展示名称模糊搜索 */
    keyword?: string;
    /** 按应用分类筛选，例如 microservice */
    category?: string;
    /** 按公共环境 ID 筛选 */
    environmentId?: string;
    /** 用户标签 ID，多个 ID 使用英文逗号分隔，例如 "7,8" */
    labelIds?: string;
    /** 页码，从 1 开始 */
    page?: number;
    /** 每页数量，必须大于 0；不传时默认 20 */
    pageSize?: number;
    curApplicationId?: string;
}

interface ParamsAccountID {
    /** 账号 ID */
    accountId: string;
}

interface ParamsApplicationID {
    /** 应用 ID */
    applicationId: string;
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

/**
 * 获取应用列表筛选项（初始化应用分类、环境和用户标签筛选器）
 *
 * GET /rest/v1/accounts/{accountID}/applications/filter-options
 */
const getApplicationsFilterOptions = createInterface<ParamsAccountID, ApplicationFilterOptions>(
    'GET',
    '/accounts/{accountId}/applications/filter-options',
);

/**
 * 收藏应用（重复收藏不会创建重复记录；需调用方注入 x-baidu-int-username 请求头）
 *
 * POST /rest/v1/applications/{applicationID}/collection
 */
const collectApplication = createInterface<ParamsApplicationID, ApplicationCollectionResult>(
    'POST',
    '/applications/{applicationId}/collection',
);

/**
 * 取消收藏（应用未收藏时重复取消不会报错；需调用方注入 x-baidu-int-username 请求头）
 *
 * DELETE /rest/v1/applications/{applicationID}/collection
 */
const uncollectApplication = createInterface<ParamsApplicationID, ApplicationCollectionResult>(
    'DELETE',
    '/applications/{applicationId}/collection',
);

export default {
    getApplicationsByAccount,
    getApplicationsFilterOptions,
    collectApplication,
    uncollectApplication,
};
