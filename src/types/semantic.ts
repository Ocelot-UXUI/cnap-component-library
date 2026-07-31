/**
 * AI 语义化 DOM 属性类型定义
 * 用于 AI Agent 解析 DOM 结构并理解页面业务操作
 */

import type {AIAction} from './semantic-actions';
import type {AIEntity} from './semantic-entities';

export type {AIAction} from './semantic-actions';
export type {AIEntity} from './semantic-entities';

// ============================================================
// AI 组件角色类型
// ============================================================

export type AIRole =
    | 'button'
    | 'input'
    | 'select'
    | 'form'
    | 'table'
    | 'modal'
    | 'drawer'
    | 'link'
    | 'card'
    | 'tab'
    | 'menu'
    | 'dropdown'
    | 'switch'
    | 'checkbox'
    | 'radio';

// ============================================================
// AI 语义化属性接口
// ============================================================

/**
 * 带动态 ID 的实体类型
 * 支持 "entity:id" 格式，如 "cluster:123"
 */
export type AIEntityWithId = AIEntity | `${AIEntity}:${string}`;

export interface AISemanticProps {
    /** 组件角色（UI 类型） */
    'data-ai-role'?: AIRole;
    /** 触发的业务动作 */
    'data-ai-action'?: AIAction;
    /** 操作的业务对象 */
    'data-ai-entity'?: AIEntityWithId;
    /** 参数字段名（用于输入框） */
    'data-ai-param'?: string;
    /** 自然语言描述 */
    'data-ai-desc'?: string;
}

/**
 * 为现有 Props 类型添加 AI 语义化属性
 */
export type WithAISemanticProps<T> = T & AISemanticProps;
