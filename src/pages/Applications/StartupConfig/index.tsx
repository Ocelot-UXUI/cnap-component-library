/* eslint-disable max-lines */
import {Button, Form, message, Space} from 'antd';
import React, {useMemo} from 'react';
import {useParams} from 'react-router-dom';
import {isFieldSchema, isGroupSchema} from '../RuntimeConfig/schema/types';
import type {SchemaNode, TabSchema, ValidatorRegistry} from '../RuntimeConfig/schema/types';
import {baseValidatorRegistry} from '../RuntimeConfig/schema/validatorRegistry';
import {SchemaRenderer} from '../RuntimeConfig/SchemaRenderer';
import {startupSchema} from '../RuntimeConfig/schemas/startup.schema';

const validatorRegistry: ValidatorRegistry = baseValidatorRegistry;

// 从 Schema 收集初始值
function collectInitialValues(schema: TabSchema): Record<string, unknown> {
    const values: Record<string, unknown> = {};

    const collectNode = (node: SchemaNode) => {
        if (isFieldSchema(node) && node.initialValue !== undefined && node.name) {
            const key = Array.isArray(node.name) ? node.name[0] : node.name;
            values[key] = node.initialValue;
        }
        if (isGroupSchema(node)) {
            node.fields.forEach(collectNode);
        }
    };

    for (const node of schema.fields) {
        collectNode(node);
    }

    return values;
}

const StartupConfig: React.FC = () => {
    const { appId } = useParams<{ appId: string; }>();
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const initialValues = useMemo(
        () => collectInitialValues(startupSchema),
        [],
    );

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            // TODO: 调用 API 保存启动配置
            // eslint-disable-next-line no-console
            console.log('startup config values:', appId, values);
            messageApi.success('启动配置保存成功');
        } catch {
            messageApi.error('请检查表单填写是否正确');
        }
    };

    const handleReset = () => {
        form.resetFields();
    };

    return (
        <div
            style={{ maxWidth: 800 }}
            data-ai-role="page"
            data-ai-entity="startupConfig"
            data-ai-desc={`应用 ${appId} 的启动配置`}
        >
            {contextHolder}
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
                data-ai-role="form"
                data-ai-entity="startupConfigForm"
            >
                {startupSchema.fields.map((node, index) => {
                    if (isGroupSchema(node)) {
                        return (
                            <SchemaRenderer
                                key={node.title}
                                schema={node}
                                form={form}
                                validatorRegistry={validatorRegistry}
                            />
                        );
                    }
                    const key = isFieldSchema(node) && node.name
                        ? (Array.isArray(node.name) ? node.name.join('.') : node.name)
                        : `node-${index}`;
                    return (
                        <SchemaRenderer
                            key={key}
                            schema={node}
                            form={form}
                            validatorRegistry={validatorRegistry}
                        />
                    );
                })}
                <Form.Item>
                    <Space>
                        <Button
                            type="primary"
                            onClick={handleSave}
                            data-ai-action="saveStartupConfig"
                        >
                            保存配置
                        </Button>
                        <Button
                            onClick={handleReset}
                            data-ai-action="resetStartupConfig"
                        >
                            重置
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
};

export default StartupConfig;
