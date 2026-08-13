import type {
    Account,
    AccountDetail,
    AccountDetailResponse,
    AccountSummary,
    ResourceAccountNode,
    UserAccountRoles,
} from '@/interface/entities/account';
import {createInterface} from './services/primary';

interface ParamsGetAccounts {
    /** 搜索关键词，支持账户中文名称、账户英文名称；为空返回全部账户（资源账户名称及完整路径搜索见 /account-summaries） */
    keyword?: string;
}

interface ParamsAccountID {
    /** CNAP 账户 ID */
    accountId: string;
}

/**
 * 查询用户资源账户树
 *
 * GET /rest/v1/resource-accounts
 *
 * 创建账户前调用本接口加载可选的资源账户树，选择 type=ACCOUNT 的叶子节点后，
 * 将其 accountUuid 作为创建账户时的 externalId 提交。
 */
const getResourceAccounts = createInterface<void, ResourceAccountNode[]>(
    'GET',
    '/resource-accounts',
);

/**
 * 查询账户列表（导航栏接口，精简字段）
 *
 * GET /rest/v1/accounts
 */
const getMany = createInterface<ParamsGetAccounts, Account[]>(
    'GET',
    '/accounts',
);

/**
 * 查询账户列表及统计信息
 *
 * GET /rest/v1/account-summaries
 */
const getSummaries = createInterface<ParamsGetAccounts, AccountSummary[]>(
    'GET',
    '/account-summaries',
);

/**
 * 查询用户账户角色
 *
 * GET /rest/v1/user-account-roles
 */
const getUserAccountRoles = createInterface<void, UserAccountRoles[]>(
    'GET',
    '/user-account-roles',
);

/**
 * 获取账户基本信息
 *
 * GET /rest/v1/accounts/:accountId
 */
const getDetail = createInterface<ParamsAccountID, AccountDetailResponse>(
    'GET',
    '/accounts/{accountId}',
);

// ── 创建 / 更新（multipart/form-data）──────────────────────

/** 创建账户的低层接口，请求体为 FormData（POST /rest/v1/account） */
const create = createInterface<FormData, AccountDetail>('POST', '/account');

/** 更新账户的低层接口，FormData 通过 callOptions.data 传入（PUT /rest/v1/accounts/:accountId） */
const update = createInterface<ParamsAccountID, AccountDetail>(
    'PUT',
    '/accounts/{accountId}',
);

/** 创建账户输入（对应创建接口的 Form Data 字段） */
export interface CreateAccountInput {
    /** 账户英文名称，最长 256 个字符 */
    name: string;
    /** 账户中文名称，最长 512 个字符 */
    displayName: string;
    /** BCOP 资源账户 UUID，最长 128 个字符 */
    externalId: string;
    /** 账户图标，仅支持 JPG、PNG，最大 500 KB */
    icon: File;
    /** 账户描述，最长 1024 个字符 */
    description?: string;
}

/** 更新账户输入（仅允许修改 displayName、description、icon） */
export interface UpdateAccountInput {
    /** CNAP 账户 ID */
    accountId: string;
    /** 账户中文名称，最长 512 个字符 */
    displayName: string;
    /** 账户描述，允许传空字符串，最长 1024 个字符 */
    description: string;
    /** 新账户图标，仅支持 JPG、PNG，最大 500 KB；不传表示图标不修改 */
    icon?: File;
}

/** 按文档字段构建账户 FormData；icon 未传时（更新场景）不添加 icon 字段以保留原图标 */
const buildAccountFormData = (fields: {
    name?: string;
    displayName?: string;
    externalId?: string;
    description?: string;
    icon?: File;
}): FormData => {
    const formData = new FormData();
    if (fields.name !== undefined) {
        formData.append('name', fields.name);
    }
    if (fields.displayName !== undefined) {
        formData.append('displayName', fields.displayName);
    }
    if (fields.externalId !== undefined) {
        formData.append('externalId', fields.externalId);
    }
    if (fields.description !== undefined) {
        formData.append('description', fields.description);
    }
    if (fields.icon !== undefined) {
        formData.append('icon', fields.icon);
    }
    return formData;
};

/**
 * 创建账户
 *
 * POST /rest/v1/account（multipart/form-data）
 */
export const createAccount = (input: CreateAccountInput) =>
    create(buildAccountFormData(input));

/**
 * 更新账户
 *
 * PUT /rest/v1/accounts/:accountId（multipart/form-data）
 */
export const updateAccount = (input: UpdateAccountInput) =>
    update(
        { accountId: input.accountId },
        { data: buildAccountFormData(input) },
    );

export default {
    getResourceAccounts,
    getMany,
    getSummaries,
    getUserAccountRoles,
    getDetail,
    createAccount,
    updateAccount,
};
