/**
 * AI 语义化 Dropdown 组件
 */
import type {AISemanticProps} from '@/types/semantic';
import {Dropdown as AntDropdown} from 'antd';
import type {DropdownProps} from 'antd';
import type {ReactNode} from 'react';

type AIDropdownProps = DropdownProps & {
    children: ReactNode;
} & AISemanticProps;

export const Dropdown = ({
    'data-ai-role': role = 'dropdown',
    'data-ai-action': action,
    'data-ai-entity': entity,
    'data-ai-param': param,
    'data-ai-desc': desc,
    children,
    ...props
}: AIDropdownProps) => (
    <AntDropdown {...props}>
        <span
            data-ai-role={role}
            data-ai-action={action}
            data-ai-entity={entity}
            data-ai-param={param}
            data-ai-desc={desc}
        >
            {children}
        </span>
    </AntDropdown>
);
