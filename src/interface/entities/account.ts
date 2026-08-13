/**
 * 账号实体
 *
 * 来源接口文档：《账户-基本能力》
 * https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/wDHcvK7WzdAhj5
 */

/** 账号角色 */
export interface AccountRole {
    /** 角色编码，如 ACCOUNT_ADMIN */
    code: string;
    /** 角色中文名称，如"账户负责人" */
    name: string;
}

/** 关联的资源账户信息 */
export interface AccountResourceAccount {
    /** 包含父节点的资源账户完整路径 */
    name: string;
}

/** 账号信息（导航栏列表项，GET /rest/v1/accounts） */
export interface Account {
    /** 账号 ID */
    id: string;
    /** 账号名（技术标识，英文） */
    name: string;
    /** 账号展示名（中文，用于前端展示） */
    displayName: string;
    /** 账户图标的 BOS 公网地址 */
    icon?: string;
    /** 关联的 BCOP 资源账户 UUID */
    externalId?: string;
}

/** 账户详情字段（创建/更新响应，及详情响应的 account 内嵌对象） */
export interface AccountDetail extends Account {
    /** 账户描述 */
    description?: string;
    /** 创建人 */
    createdBy?: string;
    /** 创建时间，RFC 3339 格式 */
    createdAt?: string;
    /** 更新时间，RFC 3339 格式 */
    updatedAt?: string;
}

/** 账户详情响应（GET /rest/v1/accounts/:accountId，account 嵌套结构） */
export interface AccountDetailResponse {
    /** 账户对象 */
    account: AccountDetail;
    /** 关联的资源账户；无法匹配时不返回该字段 */
    resourceAccount?: AccountResourceAccount;
}

/** 账户列表及统计信息（GET /rest/v1/account-summaries 列表项） */
export interface AccountSummary {
    /** 账户基本信息，字段说明与"查询账户基本信息列表"一致 */
    account: Account;
    /** 关联的资源账户；无法匹配时不返回该字段 */
    resourceAccount?: AccountResourceAccount;
    /** 账户应用数 */
    applicationCount: string;
    /** 账户环境数 */
    environmentCount: string;
    /** 账户环境关联的集群记录数 */
    clusterCount: string;
}

/** 用户账户角色（GET /rest/v1/user-account-roles 列表项） */
export interface UserAccountRoles {
    /** CNAP 账户 ID */
    accountId: string;
    /** 用户在该账户下拥有的角色列表 */
    roles: AccountRole[];
}

/** 关联的 CNAP 账户（资源账户叶子节点的 linkedAccounts 项） */
export interface LinkedAccount {
    /** CNAP 账户 ID（接口文档为 number，项目约定按 string 使用） */
    id: string;
    /** CNAP 账户英文名称 */
    name: string;
    /** CNAP 账户中文名称 */
    displayName: string;
}

/** BCOP 资源账户节点类型 */
export type ResourceAccountNodeType = 'ORGANIZATION_UNIT' | 'ACCOUNT';

/** 资源账户树节点（GET /rest/v1/resource-accounts） */
export interface ResourceAccountNode {
    /** BCOP 资源账户或组织节点 UUID */
    accountUuid: string;
    /** 资源账户或组织节点名称 */
    name: string;
    /** BCOP 节点类型 */
    type: ResourceAccountNodeType;
    /** 子节点列表；叶子节点不返回该字段 */
    children?: ResourceAccountNode[];
    /** 关联的 CNAP 账户；仅资源账户叶子节点返回，无关联账户时返回空数组 */
    linkedAccounts?: LinkedAccount[];
}

/**
 * 应用信息（账号下应用列表项）
 *
 * 来源接口：GET /rest/v1/accounts/:accountId/applications
 */
export interface Application {
    /** 应用 ID */
    id: string;
    /** 所属账号 ID */
    accountId: string;
    /** 应用名 */
    name: string;
}
