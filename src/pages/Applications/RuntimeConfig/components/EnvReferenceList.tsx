/* eslint-disable max-lines */
/* eslint-disable max-len */
import {DeleteOutlined, PlusOutlined, QuestionCircleOutlined} from '@ant-design/icons';
import {Button, Input, Select, Space, Table, Tooltip} from '@/design';
import React from 'react';

// ── 环境变量引用类型（与 CNAP1.0 一致）─────────────────────────────
export type EnvReferenceType = 'fieldRef' | 'resourceFieldRef' | 'secretKeyRef' | 'configMapKeyRef';

export interface EnvReferenceEntry {
    type: EnvReferenceType;
    name: string; // 环境变量名称
    // fieldRef
    fieldRef?: { fieldPath: string; };
    // resourceFieldRef
    resourceFieldRef?: { resource: string; };
    // secretKeyRef
    secretKeyRef?: { name: string; key: string; };
    // configMapKeyRef
    configMapKeyRef?: { name: string; key: string; };
}

interface EnvReferenceListProps {
    value?: EnvReferenceEntry[];
    onChange?: (value: EnvReferenceEntry[]) => void;
}

const TYPE_OPTIONS = [
    { label: '引用pod字段', value: 'fieldRef' },
    { label: '引用容器resource字段', value: 'resourceFieldRef' },
    { label: '引用secret部分字段', value: 'secretKeyRef' },
    { label: '引用ConfigMap部分字段', value: 'configMapKeyRef' },
];

const INPUT_PLACEHOLDER: Record<string, string> = {
    fieldRef: '请输入pod字段路径',
    resourceFieldRef: '请输入resource中的字段路径',
    secretKeyRef: '请输入secret文件name',
    configMapKeyRef: '请输入ConfigMap文件name',
};

const KEY_PLACEHOLDER: Record<string, string> = {
    secretKeyRef: '请输入secret中的key',
    configMapKeyRef: '请输入ConfigMap中的key',
};

const createDefault = (): EnvReferenceEntry => ({
    type: 'fieldRef',
    name: '',
    fieldRef: { fieldPath: '' },
});

// ── 值输入组件 ────────────────────────────────────────────────────
const ValueInput: React.FC<{
    entry: EnvReferenceEntry;
    onChange: (entry: EnvReferenceEntry) => void;
}> = ({ entry, onChange }) => {
    const updateRef = (patch: Record<string, unknown>) => {
        switch (entry.type) {
            case 'fieldRef':
                onChange({ ...entry, fieldRef: { ...entry.fieldRef, ...patch } as { fieldPath: string; } });
                break;
            case 'resourceFieldRef':
                onChange({
                    ...entry,
                    resourceFieldRef: { ...entry.resourceFieldRef, ...patch } as { resource: string; },
                });
                break;
            case 'secretKeyRef':
                onChange({
                    ...entry,
                    secretKeyRef: { ...entry.secretKeyRef, ...patch } as { name: string; key: string; },
                });
                break;
            case 'configMapKeyRef':
                onChange({
                    ...entry,
                    configMapKeyRef: { ...entry.configMapKeyRef, ...patch } as { name: string; key: string; },
                });
                break;
        }
    };

    const getRefValue = (): string => {
        switch (entry.type) {
            case 'fieldRef':
                return entry.fieldRef?.fieldPath ?? '';
            case 'resourceFieldRef':
                return entry.resourceFieldRef?.resource ?? '';
            case 'secretKeyRef':
                return entry.secretKeyRef?.name ?? '';
            case 'configMapKeyRef':
                return entry.configMapKeyRef?.name ?? '';
            default:
                return '';
        }
    };

    const getKeyRefValue = (): string => {
        if (entry.type === 'secretKeyRef') {
            return entry.secretKeyRef?.key ?? '';
        }
        if (entry.type === 'configMapKeyRef') {
            return entry.configMapKeyRef?.key ?? '';
        }
        return '';
    };

    return (
        <Space.Compact>
            <Input
                value={getRefValue()}
                placeholder={INPUT_PLACEHOLDER[entry.type] ?? '请输入'}
                style={{ width: 200 }}
                onChange={e => {
                    const key = entry.type === 'fieldRef'
                        ? 'fieldPath'
                        : entry.type === 'resourceFieldRef'
                        ? 'resource'
                        : 'name';
                    updateRef({ [key]: e.target.value });
                }}
            />
            {['secretKeyRef', 'configMapKeyRef'].includes(entry.type) && (
                <Input
                    value={getKeyRefValue()}
                    placeholder={KEY_PLACEHOLDER[entry.type] ?? '请输入'}
                    style={{ width: 200 }}
                    onChange={e => updateRef({ key: e.target.value })}
                />
            )}
        </Space.Compact>
    );
};

// ── 主组件 ──────────────────────────────────────────────────────
export const EnvReferenceList: React.FC<EnvReferenceListProps> = ({ value = [], onChange }) => {
    const handleAdd = () => {
        onChange?.([...value, createDefault()]);
    };

    const handleRemove = (index: number) => {
        onChange?.(value.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, entry: EnvReferenceEntry) => {
        onChange?.(value.map((item, i) => (i === index ? entry : item)));
    };

    const handleTypeChange = (index: number, type: EnvReferenceType) => {
        const newEntry: EnvReferenceEntry = {
            type,
            name: value[index].name,
        };
        // 初始化对应类型的引用对象
        if (type === 'fieldRef') {
            newEntry.fieldRef = { fieldPath: '' };
        }
        if (type === 'resourceFieldRef') {
            newEntry.resourceFieldRef = { resource: '' };
        }
        if (type === 'secretKeyRef') {
            newEntry.secretKeyRef = { name: '', key: '' };
        }
        if (type === 'configMapKeyRef') {
            newEntry.configMapKeyRef = { name: '', key: '' };
        }
        onChange?.(value.map((item, i) => (i === index ? newEntry : item)));
    };

    const columns = [
        {
            title: (
                <Space>
                    类型
                    <Tooltip
                        title={
                            <>
                                仅部分pod字段和resource字段字段可作为环境变量使用，
                                <a
                                    href="https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/downward-api/#available-fields"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    点此查看
                                </a>
                            </>
                        }
                    >
                        <QuestionCircleOutlined style={{ color: '#999' }} />
                    </Tooltip>
                </Space>
            ),
            key: 'type',
            width: 200,
            render: (_: unknown, _r: EnvReferenceEntry, index: number) => (
                <Select
                    value={value[index].type}
                    options={TYPE_OPTIONS}
                    size="small"
                    style={{ width: '100%' }}
                    onChange={v => handleTypeChange(index, v)}
                    data-ai-param="envRefType"
                />
            ),
        },
        {
            title: '名称',
            key: 'name',
            width: 200,
            render: (_: unknown, _r: EnvReferenceEntry, index: number) => (
                <Input
                    value={value[index].name}
                    placeholder="请输入变量名称"
                    size="small"
                    style={{ width: '100%' }}
                    onChange={e => handleChange(index, { ...value[index], name: e.target.value })}
                    data-ai-param="envRefName"
                />
            ),
        },
        {
            title: '值',
            key: 'value',
            render: (_: unknown, _r: EnvReferenceEntry, index: number) => (
                <ValueInput
                    entry={value[index]}
                    onChange={entry => handleChange(index, entry)}
                />
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 60,
            render: (_: unknown, _r: EnvReferenceEntry, index: number) => (
                <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemove(index)}
                    data-ai-action="removeEnvRef"
                />
            ),
        },
    ];

    return (
        <Space direction="vertical" style={{ width: '100%' }} data-ai-role="envReferenceList">
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
                data-ai-action="addEnvRef"
            >
                添加环境变量引用
            </Button>
        </Space>
    );
};
