/**
 * 应用实体
 *
 * 来源接口文档：《应用》
 * https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/zJ9Wp5AQ1cmFAU
 */

/** 系统标签 */
export interface ApplicationSystemTag {
    /** 标签 key */
    key: string;
    /** 标签值 */
    value: string;
}

/** 用户标签 */
export interface ApplicationLabel {
    /** 标签 ID（接口文档为 number，项目约定按 string 使用） */
    id: string;
    /** 所属账号 ID */
    accountId: string;
    /** 标签名 */
    name: string;
    /** 标签描述 */
    description?: string;
    /** 创建人 */
    createdBy?: string;
    /** 创建时间，RFC 3339 格式 */
    createdAt?: string;
    /** 更新时间，RFC 3339 格式 */
    updatedAt?: string;
}

/** 应用环境（列表项内嵌） */
export interface ApplicationEnvironment {
    /** 应用环境 ID（接口文档为 number，项目约定按 string 使用） */
    applicationEnvironmentId: string;
    /** 环境名 */
    environmentName: string;
}

/** 环境最近一次成功操作 */
export interface ApplicationRecentChange {
    /** 应用环境 ID */
    applicationEnvironmentId: string;
    /** 环境 ID */
    environmentId: string;
    /** 环境名 */
    environmentName: string;
    /** 操作人 */
    changedBy?: string;
    /** 操作时间，RFC 3339 格式 */
    changedAt?: string;
    /** 操作类型，如 workload-horizontal-scale */
    changeType?: string;
}

/**
 * 应用信息（账号下应用列表项）
 *
 * GET /rest/v1/accounts/:accountID/applications
 */
export interface Application {
    /** 应用 ID（接口文档为 number，项目约定按 string 使用） */
    id: string;
    /** 所属账号 ID */
    accountId: string;
    /** 应用名 */
    name: string;
    /** 应用类型，如 MICRO_SERVICE */
    type?: string;
    /** 应用展示名 */
    displayName?: string;
    /** 应用描述 */
    description?: string;
    /** 系统标签 */
    systemTags?: ApplicationSystemTag[];
    /** 用户标签 */
    labels?: ApplicationLabel[];
    /** 应用环境列表 */
    environments?: ApplicationEnvironment[];
    /** 默认进入的应用环境 ID */
    defaultApplicationEnvironmentId?: string;
    /** 每个环境最近一次成功操作 */
    recentChanges?: ApplicationRecentChange[];
    /** 当前请求用户是否收藏该应用 */
    isCollected?: boolean;
}

/** 账号下应用列表分页响应（GET /rest/v1/accounts/:accountID/applications） */
export interface ApplicationListResult {
    /** 总数 */
    total: number;
    /** 当前页码，从 1 开始 */
    page: number;
    /** 每页数量 */
    pageSize: number;
    /** 应用列表 */
    items: Application[];
}
