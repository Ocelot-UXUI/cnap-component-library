/* eslint-disable max-lines */
/* eslint-disable max-len */
import {DeleteOutlined, PlusOutlined} from '@ant-design/icons';
import {Button, Form, Input, InputNumber, Select, Space, Table} from 'antd';
import React from 'react';

// ── 探针类型（与 CNAP1.0 一致，使用大写值）───────────────────────
export type ProbeType = 'HTTP' | 'TCP' | 'EXEC';

export interface HttpHeader {
    name: string;
    value: string;
}

export interface ProbeConfigValue {
    type: ProbeType;
    // HTTP 类型
    path?: string;
    port?: string | number; // 支持端口号或端口名称
    scheme?: 'HTTP' | 'HTTPS';
    httpHeaders?: HttpHeader[];
    // EXEC 类型：命令数组（与 CNAP1.0 一致）
    cmd?: string[];
    // 时间参数
    initialDelaySeconds: number;
    periodSeconds: number;
    timeoutSeconds: number;
    failureThreshold: number;
    successThreshold: number;
}

interface ProbeConfigProps {
    value?: ProbeConfigValue;
    onChange?: (value: ProbeConfigValue) => void;
    // readinessProbe 的 successThreshold 不可编辑（固定为 1）
    successThresholdDisabled?: boolean;
}

const DEFAULT_VALUE: ProbeConfigValue = {
    type: 'HTTP',
    path: '/health',
    port: 8080,
    scheme: 'HTTP',
    httpHeaders: [],
    initialDelaySeconds: 10,
    periodSeconds: 10,
    timeoutSeconds: 5,
    failureThreshold: 3,
    successThreshold: 1,
};

const SCHEME_OPTIONS = [
    { label: 'SSL', value: 'HTTPS' },
    { label: '不使用', value: 'HTTP' },
];

export const ProbeConfig: React.FC<ProbeConfigProps> = ({
    value = DEFAULT_VALUE,
    onChange,
    successThresholdDisabled = false,
}) => {
    const update = (patch: Partial<ProbeConfigValue>) => {
        onChange?.({ ...value, ...patch });
    };

    const handleTypeChange = (type: ProbeType) => {
        const base: ProbeConfigValue = {
            ...value,
            type,
            path: undefined,
            port: undefined,
            scheme: undefined,
            httpHeaders: undefined,
            cmd: undefined,
        };
        if (type === 'HTTP') {
            base.path = '/health';
            base.port = 8080;
            base.scheme = 'HTTP';
            base.httpHeaders = [];
        } else if (type === 'TCP') {
            base.port = 8080;
        } else {
            base.cmd = [''];
        }
        onChange?.(base);
    };

    // HTTP Headers 操作
    const headers = value.httpHeaders ?? [];
    const addHeader = () => {
        update({ httpHeaders: [...headers, { name: '', value: '' }] });
    };
    const removeHeader = (i: number) => {
        update({ httpHeaders: headers.filter((_, idx) => idx !== i) });
    };
    const updateHeader = (i: number, field: 'name' | 'value', v: string) => {
        update({
            httpHeaders: headers.map((h, idx) => (idx === i ? { ...h, [field]: v } : h)),
        });
    };

    // EXEC 命令操作
    const cmds = value.cmd ?? [];
    const addCmd = () => {
        update({ cmd: [...cmds, ''] });
    };
    const removeCmd = (i: number) => {
        update({ cmd: cmds.filter((_, idx) => idx !== i) });
    };
    const updateCmd = (i: number, v: string) => {
        update({ cmd: cmds.map((c, idx) => (idx === i ? v : c)) });
    };

    const headerColumns = [
        {
            title: 'Header 名称',
            key: 'name',
            render: (_: unknown, _r: HttpHeader, i: number) => (
                <Input
                    value={headers[i].name}
                    size="small"
                    placeholder="如 X-Custom-Header"
                    onChange={e => updateHeader(i, 'name', e.target.value)}
                />
            ),
        },
        {
            title: 'Header 值',
            key: 'value',
            render: (_: unknown, _r: HttpHeader, i: number) => (
                <Input
                    value={headers[i].value}
                    size="small"
                    placeholder="值"
                    onChange={e => updateHeader(i, 'value', e.target.value)}
                />
            ),
        },
        {
            title: '',
            key: 'action',
            width: 40,
            render: (_: unknown, _r: HttpHeader, i: number) => (
                <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeHeader(i)}
                />
            ),
        },
    ];

    return (
        <Space direction="vertical" style={{ width: '100%' }} data-ai-role="probeConfig">
            {/* 探测方法（与 CNAP1.0 一致） */}
            <Form.Item label="探测方法" style={{ marginBottom: 8 }}>
                <Select
                    value={value.type}
                    options={[
                        { label: 'HTTP GET请求', value: 'HTTP' },
                        { label: 'TCP', value: 'TCP' },
                        { label: 'EXEC', value: 'EXEC' },
                    ]}
                    style={{ width: 140 }}
                    onChange={handleTypeChange}
                    data-ai-param="probeType"
                />
            </Form.Item>

            {/* HTTP GET 字段 */}
            {value.type === 'HTTP' && (
                <>
                    <Space.Compact>
                        <Form.Item style={{ marginBottom: 8 }}>
                            <Input
                                value={value.path}
                                placeholder="程序暴露的探测地址，如/health"
                                style={{ width: 240 }}
                                onChange={e => update({ path: e.target.value })}
                                data-ai-param="httpPath"
                            />
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 8 }}>
                            <Input
                                value={value.port}
                                placeholder="请输入端口名称或端口号"
                                style={{ width: 160 }}
                                onChange={e => update({ port: e.target.value })}
                                data-ai-param="httpPort"
                            />
                        </Form.Item>
                    </Space.Compact>
                    <Form.Item label="安全协议" style={{ marginBottom: 8 }}>
                        <Select
                            value={value.scheme ?? 'HTTP'}
                            options={SCHEME_OPTIONS}
                            style={{ width: 200 }}
                            onChange={v => update({ scheme: v })}
                            data-ai-param="httpScheme"
                        />
                    </Form.Item>
                    {/* HTTP Headers */}
                    <Form.Item label="HTTP Headers" style={{ marginBottom: 8 }}>
                        <Table
                            dataSource={headers}
                            columns={headerColumns}
                            rowKey={(_, i) => String(i ?? 0)}
                            pagination={false}
                            size="small"
                        />
                        <Button
                            type="dashed"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={addHeader}
                            style={{ marginTop: 4 }}
                        >
                            添加 Header
                        </Button>
                    </Form.Item>
                </>
            )}

            {/* TCP Socket 字段 */}
            {value.type === 'TCP' && (
                <Form.Item style={{ marginBottom: 8 }}>
                    <Input
                        value={value.port}
                        placeholder="请输入端口名称或端口号"
                        style={{ width: 200 }}
                        onChange={e => update({ port: e.target.value })}
                        data-ai-param="tcpPort"
                    />
                </Form.Item>
            )}

            {/* EXEC 字段：命令数组（与 CNAP1.0 一致） */}
            {value.type === 'EXEC' && (
                <Space direction="vertical" style={{ width: '100%' }}>
                    {cmds.map((cmd, i) => (
                        <Space key={i} style={{ width: '100%' }}>
                            <Input
                                value={cmd}
                                placeholder="请输入命令"
                                style={{ width: 400 }}
                                onChange={e => updateCmd(i, e.target.value)}
                                data-ai-param={`execCmd${i}`}
                            />
                            {cmds.length > 1 && (
                                <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeCmd(i)}
                                />
                            )}
                        </Space>
                    ))}
                    <Button
                        type="dashed"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={addCmd}
                    >
                        添加命令
                    </Button>
                </Space>
            )}

            {/* 通用时间参数 */}
            <Space wrap>
                <Form.Item
                    label="初始延迟"
                    style={{ marginBottom: 8 }}
                    tooltip="单位: s，容器启动后，初次探测前等待的时间"
                >
                    <InputNumber
                        value={value.initialDelaySeconds}
                        min={0}
                        precision={0}
                        onChange={v => update({ initialDelaySeconds: v ?? 10 })}
                        data-ai-param="initialDelaySeconds"
                    />
                </Form.Item>
                <Form.Item label="超时时间" style={{ marginBottom: 8 }} tooltip="单位：s">
                    <InputNumber
                        value={value.timeoutSeconds}
                        min={0}
                        precision={0}
                        onChange={v => update({ timeoutSeconds: v ?? 5 })}
                        data-ai-param="timeoutSeconds"
                    />
                </Form.Item>
            </Space>
            <Form.Item label="探测频率" style={{ marginBottom: 8 }} tooltip="单位: s，每隔多久探测一次">
                <InputNumber
                    value={value.periodSeconds}
                    min={0}
                    precision={0}
                    onChange={v => update({ periodSeconds: v ?? 10 })}
                    data-ai-param="periodSeconds"
                />
            </Form.Item>

            {/* 探测状态阈值 */}
            <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                    <span>连续</span>
                    <InputNumber
                        value={value.failureThreshold}
                        min={0}
                        precision={0}
                        style={{ width: 60 }}
                        onChange={v => update({ failureThreshold: v ?? 3 })}
                        data-ai-param="failureThreshold"
                    />
                    <span>次探测失败则判定异常</span>
                </Space>
                <Space>
                    <span>连续</span>
                    <InputNumber
                        value={value.successThreshold}
                        min={0}
                        precision={0}
                        style={{ width: 60 }}
                        disabled={successThresholdDisabled}
                        onChange={v => update({ successThreshold: v ?? 1 })}
                        data-ai-param="successThreshold"
                    />
                    <span>次探测成功则说明正常运行</span>
                </Space>
            </Space>
        </Space>
    );
};
