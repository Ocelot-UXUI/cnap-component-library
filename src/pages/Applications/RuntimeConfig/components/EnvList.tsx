import {DeleteOutlined, PlusOutlined} from '@ant-design/icons';
import {Button, Input, Space, Table} from 'antd';
import React from 'react';

// ── 与 CNAP1.0 一致，只有 name 和 value 两个字段 ────────────────────
export interface EnvEntry {
    name: string;
    value: string;
}

interface EnvListProps {
    value?: EnvEntry[];
    onChange?: (value: EnvEntry[]) => void;
}

const createDefault = (): EnvEntry => ({ name: '', value: '' });

export const EnvList: React.FC<EnvListProps> = ({ value = [], onChange }) => {
    const handleAdd = () => {
        onChange?.([...value, createDefault()]);
    };

    const handleRemove = (index: number) => {
        onChange?.(value.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, field: keyof EnvEntry, val: string) => {
        onChange?.(value.map((item, i) => (i === index ? { ...item, [field]: val } : item)));
    };

    const columns = [
        {
            title: '名称',
            key: 'name',
            width: '40%',
            render: (_: unknown, _record: EnvEntry, index: number) => (
                <Input
                    value={value[index].name}
                    placeholder="请输入变量名称"
                    size="small"
                    onChange={e => handleChange(index, 'name', e.target.value)}
                    data-ai-param="envName"
                />
            ),
        },
        {
            title: '值',
            key: 'value',
            width: '40%',
            render: (_: unknown, _record: EnvEntry, index: number) => (
                <Input
                    value={value[index].value}
                    placeholder="请输入变量值"
                    size="small"
                    onChange={e => handleChange(index, 'value', e.target.value)}
                    data-ai-param="envValue"
                />
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 60,
            render: (_: unknown, _record: EnvEntry, index: number) => (
                <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemove(index)}
                    data-ai-action="removeEnv"
                />
            ),
        },
    ];

    return (
        <Space direction="vertical" style={{ width: '100%' }} data-ai-role="envList">
            <Table
                dataSource={value}
                columns={columns}
                rowKey={(_, index) => String(index ?? 0)}
                pagination={false}
                size="small"
            />
            <Button
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                data-ai-action="addEnv"
            >
                添加环境变量
            </Button>
        </Space>
    );
};
