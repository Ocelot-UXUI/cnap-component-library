import {DeleteOutlined, PlusOutlined, QuestionCircleOutlined} from '@ant-design/icons';
import {Button, Input, Space, Table, Tooltip} from '@/design';
import React from 'react';

export interface ConfigReference {
    containerPath: string;
    codePath?: string;
    confPath: string;
}

interface ConfigReferenceListProps {
    value?: ConfigReference[];
    onChange?: (value: ConfigReference[]) => void;
}

const createDefault = (): ConfigReference => ({
    containerPath: '',
    codePath: '',
    confPath: '',
});

export const ConfigReferenceList: React.FC<ConfigReferenceListProps> = ({ value = [], onChange }) => {
    const handleAdd = () => {
        onChange?.([...value, createDefault()]);
    };

    const handleRemove = (index: number) => {
        onChange?.(value.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, patch: Partial<ConfigReference>) => {
        onChange?.(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    };

    const columns = [
        {
            title: (
                <Tooltip title="请填写配置文件在容器中的挂载目录（如路径不存在会默认创建）">
                    容器中挂载路径 <QuestionCircleOutlined style={{ color: '#999' }} />
                </Tooltip>
            ),
            key: 'containerPath',
            width: 200,
            render: (_: unknown, _record: ConfigReference, index: number) => (
                <Input
                    value={value[index].containerPath}
                    placeholder="如 /conf"
                    size="small"
                    onChange={e => handleChange(index, { containerPath: e.target.value })}
                    data-ai-param="containerPath"
                />
            ),
        },
        {
            title: (
                <Tooltip title="支持填写到目录或具体文件名，如 /conf 或 /conf/config.json">
                    配置文件路径 <QuestionCircleOutlined style={{ color: '#999' }} />
                </Tooltip>
            ),
            key: 'confPath',
            render: (_: unknown, _record: ConfigReference, index: number) => (
                <Space.Compact style={{ width: '100%' }}>
                    <Input
                        value={value[index].codePath}
                        placeholder="代码库路径"
                        size="small"
                        style={{ width: '40%' }}
                        onChange={e => handleChange(index, { codePath: e.target.value })}
                        data-ai-param="codePath"
                    />
                    <Input
                        value={value[index].confPath}
                        placeholder="配置文件在代码库的具体路径"
                        size="small"
                        style={{ width: '60%' }}
                        onChange={e => handleChange(index, { confPath: e.target.value })}
                        data-ai-param="confPath"
                    />
                </Space.Compact>
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 60,
            render: (_: unknown, _record: ConfigReference, index: number) => (
                <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemove(index)}
                    data-ai-action="removeConfigRef"
                />
            ),
        },
    ];

    return (
        <Space direction="vertical" style={{ width: '100%' }} data-ai-role="configReferenceList">
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
                data-ai-action="addConfigRef"
            >
                添加配置文件
            </Button>
        </Space>
    );
};
