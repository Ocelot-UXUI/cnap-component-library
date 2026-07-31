/**
 * AI 语义化 Table 组件
 */
import type {AISemanticProps} from '@/types/semantic';
import {css} from '@emotion/css';
import {Table as AntTable} from 'antd';
import type {TableProps} from 'antd';

const tableHoverClass = css`
    .ant-5-table-row {
        transition: transform 0.12s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .ant-5-table-row:hover {
        transform: translateX(3px);
    }
`;

type AITableProps<T> = TableProps<T> & AISemanticProps;

export const Table = <T extends object>({
    'data-ai-role': role = 'table',
    'data-ai-action': action,
    'data-ai-entity': entity,
    'data-ai-param': param,
    'data-ai-desc': desc,
    className,
    ...props
}: AITableProps<T>) => {
    return (
        <AntTable
            data-ai-role={role}
            data-ai-action={action}
            data-ai-entity={entity}
            data-ai-param={param}
            data-ai-desc={desc}
            className={className ? `${tableHoverClass} ${className}` : tableHoverClass}
            {...props}
        />
    );
};
