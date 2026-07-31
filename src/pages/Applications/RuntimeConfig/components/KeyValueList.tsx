import {DeleteOutlined, PlusOutlined} from '@ant-design/icons';
import {Button, Input, Space, Table} from 'antd';
import React from 'react';

export interface KeyValueEntry {
    key: string;
    value: string;
}

interface KeyValueListProps {
    value?: KeyValueEntry[];
    onChange?: (value: KeyValueEntry[]) => void;
    keyPlaceholder?: string;
    valuePlaceholder?: string;
    addLabel?: string;
}

export const KeyValueList: React.FC<KeyValueListProps> = ({
    value = [],
    onChange,
    keyPlaceholder = 'key',
    valuePlaceholder = 'value',
    addLabel = '添加',
}) => {
    const handleAdd = () => {
        onChange?.([...value, { key: '', value: '' }]);
    };

    const handleRemove = (index: number) => {
        onChange?.(value.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, field: 'key' | 'value', val: string) => {
        const next = value.map((item, i) => (i === index ? { ...item, [field]: val } : item));
        onChange?.(next);
    };

    const columns = [
        {
            title: 'Key',
            dataIndex: 'key',
            render: (_: unknown, _record: KeyValueEntry, index: number) => (
                <Input
                    value={value[index].key}
                    placeholder={keyPlaceholder}
                    onChange={e => handleChange(index, 'key', e.target.value)}
                    data-ai-param="kvKey"
                />
            ),
        },
        {
            title: 'Value',
            dataIndex: 'value',
            render: (_: unknown, _record: KeyValueEntry, index: number) => (
                <Input
                    value={value[index].value}
                    placeholder={valuePlaceholder}
                    onChange={e => handleChange(index, 'value', e.target.value)}
                    data-ai-param="kvValue"
                />
            ),
        },
        {
            title: '操作',
            width: 60,
            render: (_: unknown, _record: KeyValueEntry, index: number) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemove(index)}
                    data-ai-action="removeKv"
                />
            ),
        },
    ];

    return (
        <Space direction="vertical" style={{ width: '100%' }} data-ai-role="keyValueList">
            <Table
                dataSource={value}
                columns={columns}
                rowKey={(_, index) => String(index ?? 0)}
                pagination={false}
                size="small"
            />
            <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                data-ai-action="addKv"
            >
                {addLabel}
            </Button>
        </Space>
    );
};
