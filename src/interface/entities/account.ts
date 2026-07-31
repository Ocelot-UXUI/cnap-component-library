/**
 * 账号实体
 */

/** 账号信息 */
export interface Account {
    /** 账号 ID */
    id: string;
    /** 账号名（技术标识） */
    name: string;
    /**
     * 账号展示名（用于前端展示）
     *
     * 注：源文档示例写作 `display_name`（snake_case），
     * 但项目其余接口（如 RuntimeOperation.displayName）统一使用 camelCase，
     * 此处按 camelCase 约定定义。若后端实际返回 snake_case，需在调用侧做字段映射。
     */
    displayName: string;
}

/**
 * 应用信息（账号下应用列表项）
 *
 * 来源接口：GET /rest/v1/accounts/:accountID/applications
 */
export interface Application {
    /** 应用 ID */
    id: string;
    /** 所属账号 ID */
    accountId: string;
    /** 应用名 */
    name: string;
}
