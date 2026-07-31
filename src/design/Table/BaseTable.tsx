import {Table} from 'antd';
import type {TableProps} from 'antd';

import {baseTableClassName} from './BaseTable.style';

/**
 * 基础表格：仅统一样式（轻量表头/行高/分割线），行为与 antd Table 完全一致。
 * 默认 size="small"；调用方传入的 className 会与基础样式合并。
 */
export const BaseTable = <RecordType extends object>({
    size = 'small',
    className,
    ...rest
}: TableProps<RecordType>) => (
    <Table<RecordType>
        {...rest}
        size={size}
        className={className ? `${baseTableClassName} ${className}` : baseTableClassName}
    />
);
