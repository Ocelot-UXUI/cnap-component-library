/**
 * AI 语义化 Menu 组件
 */
import type {AISemanticProps} from '@/types/semantic';
import {Menu as AntMenu} from 'antd';
import type {MenuProps} from 'antd';

type AIMenuProps = MenuProps & AISemanticProps;

export const Menu = ({
    'data-ai-role': role = 'menu',
    'data-ai-action': action,
    'data-ai-entity': entity,
    'data-ai-param': param,
    'data-ai-desc': desc,
    ...props
}: AIMenuProps) => (
    <AntMenu
        data-ai-role={role}
        data-ai-action={action}
        data-ai-entity={entity}
        data-ai-param={param}
        data-ai-desc={desc}
        {...props}
    />
);
