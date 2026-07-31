/**
 * AI 语义化属性工具函数
 */
import type {AIAction, AIEntityWithId, AIRole, AISemanticProps} from '@/types/semantic';

interface AIPropsOptions {
    role?: AIRole;
    action?: AIAction;
    entity?: AIEntityWithId;
    param?: string;
    desc?: string;
}

/**
 * 生成 AI 语义化属性对象
 * @example
 * aiProps({ role: 'button', action: 'createUser', entity: 'user' })
 * // => { 'data-ai-role': 'button', 'data-ai-action': 'createUser', 'data-ai-entity': 'user' }
 */
export const aiProps = (options: AIPropsOptions): AISemanticProps => {
    const props: AISemanticProps = {};
    if (options.role) {
        props['data-ai-role'] = options.role;
    }
    if (options.action) {
        props['data-ai-action'] = options.action;
    }
    if (options.entity) {
        props['data-ai-entity'] = options.entity;
    }
    if (options.param) {
        props['data-ai-param'] = options.param;
    }
    if (options.desc) {
        props['data-ai-desc'] = options.desc;
    }
    return props;
};
