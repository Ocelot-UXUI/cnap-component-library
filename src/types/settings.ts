/**
 * 设置相关类型定义
 */

// API 密钥
export interface APIKey {
    id: string;
    name: string;
    key: string;
    created: string;
    lastUsed: string;
}

// Webhook
export interface Webhook {
    id: string;
    url: string;
    events: string[];
    status: 'active' | 'inactive';
}

// 用户角色
export type UserRole = 'admin' | 'developer' | 'viewer';

// 通知设置
export interface NotificationSettings {
    emailNotifications: boolean;
    deploymentSuccess: boolean;
    deploymentFailed: boolean;
    alertCritical: boolean;
    alertWarning: boolean;
}

// 安全设置
export interface SecuritySettings {
    twoFactorAuth: boolean;
    sessionTimeout: number;
}
