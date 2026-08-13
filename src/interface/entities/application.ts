/**
 * 应用实体
 *
 * 来源接口文档：《应用》
 * https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/zJ9Wp5AQ1cmFAU
 */

/** 用户标签（REST 响应中 ID 为字符串） */
export interface ApplicationUserLabel {
    /** 标签 ID */
    id: string;
    /** 标签名 */
    name: string;
}

/** 应用环境（列表项内嵌） */
export interface ApplicationEnvironment {
    /** 应用环境 ID */
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
    /** 应用 ID */
    id: string;
    /** 所属账号 ID */
    accountId: string;
    /** 应用名 */
    name: string;
    /** 应用分类，如 microservice */
    category?: string;
    /** 应用展示名 */
    displayName?: string;
    /** 应用描述 */
    description?: string;
    /** 系统标签（平台生成，如 CLONESET、Python） */
    systemLabels?: string[];
    /** 用户标签 */
    userLabels?: ApplicationUserLabel[];
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

/** 筛选项中的环境 */
export interface ApplicationFilterEnvironment {
    /** 环境 ID */
    id: string;
    /** 环境名 */
    name: string;
}

/**
 * 应用列表筛选项（GET /rest/v1/accounts/:accountID/applications/filter-options）
 *
 * 用于初始化应用列表页的应用分类、环境和用户标签筛选器；没有数据时对应字段返回空数组。
 */
export interface ApplicationFilterOptions {
    /** 当前账号应用实际使用的应用分类（取 application_type.category，去重后按名称升序） */
    applicationCategories: string[];
    /** 当前账号下未删除的公共环境（按 ID 升序） */
    environments: ApplicationFilterEnvironment[];
    /** 当前账号下未删除的用户标签（按 ID 升序） */
    userLabels: ApplicationUserLabel[];
}

/** 收藏 / 取消收藏应用结果（POST/DELETE /rest/v1/applications/:applicationID/collection） */
export interface ApplicationCollectionResult {
    /** 应用 ID */
    applicationId: string;
    /** 收藏后是否已收藏 */
    isCollected: boolean;
}
