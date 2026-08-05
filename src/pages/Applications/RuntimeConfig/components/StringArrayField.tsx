import {DeleteOutlined, PlusOutlined} from '@ant-design/icons';
import {Button, Input, Space} from '@/design';
import React from 'react';

interface StringArrayFieldProps {
    value?: string[];
    onChange?: (value: string[]) => void;
    placeholder?: string;
    addText?: string;
}

/**
 * 对应 CNAP1.0 的 FieldArray<string>：
 * 每个元素一个 Input，可动态增删。
 * 用于 command（启动命令）和 args（启动参数）。
 */
export const StringArrayField: React.FC<StringArrayFieldProps> = ({
    value = [],
    onChange,
    placeholder = '请输入',
    addText = '添加',
}) => {
    const handleAdd = () => {
        onChange?.([...value, '']);
    };

    const handleRemove = (index: number) => {
        onChange?.(value.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, v: string) => {
        onChange?.(value.map((item, i) => (i === index ? v : item)));
    };

    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            {value.map((item, index) => (
                <Space key={index} style={{ width: '100%' }}>
                    <Input
                        value={item}
                        placeholder={placeholder}
                        style={{ width: 400 }}
                        onChange={e => handleChange(index, e.target.value)}
                    />
                    <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemove(index)}
                    />
                </Space>
            ))}
            <Button
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                onClick={handleAdd}
            >
                {addText}
            </Button>
        </Space>
    );
};
