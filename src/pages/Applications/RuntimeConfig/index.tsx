/* eslint-disable max-lines */
import {Button, Form, message, Space, Tabs} from '@/design';
import React, {useMemo} from 'react';
import {useParams} from 'react-router-dom';
import {isFieldSchema, isGroupSchema} from './schema/types';
import type {SchemaNode, TabSchema, ValidatorRegistry} from './schema/types';
import {baseValidatorRegistry, mergeValidators} from './schema/validatorRegistry';
import {SchemaGroup} from './SchemaGroup';
import {SchemaRenderer} from './SchemaRenderer';
import {advancedConfigSchema, advancedConfigValidators} from './schemas/advancedConfig.schema';
import {aiDataReflowSchema, aiDataReflowValidators} from './schemas/aiDataReflow.schema';
import {annotationSchema, annotationValidators, podLabelSchema} from './schemas/annotation.schema';
import {containerSchema} from './schemas/container.schema';
import {containerValidators} from './schemas/container.validators';
import {fpmConfigSchema, fpmConfigValidators} from './schemas/fpmConfig.schema';
import {ingressSchema} from './schemas/ingress.schema';
import {ingressValidators} from './schemas/ingress.validators';
import {logSchema, logValidators} from './schemas/log.schema';
import {scheduledTaskSchema, scheduledTaskValidators} from './schemas/scheduledTask.schema';
import {secretSchema, secretValidators} from './schemas/secret.schema';
import {workloadSchema, workloadValidators} from './schemas/workload.schema';

// 合并所有模块的 validator，在模块加载时编译一次
const validatorRegistry: ValidatorRegistry = mergeValidators(
    baseValidatorRegistry,
    containerValidators,
    ingressValidators,
    workloadValidators,
    logValidators,
    scheduledTaskValidators,
    annotationValidators,
    secretValidators,
    aiDataReflowValidators,
    fpmConfigValidators,
    advancedConfigValidators,
);

// 全量 11 个 Tab，与 CNAP1.0 对齐
const TABS: TabSchema[] = [
    containerSchema, // 实例配置
    scheduledTaskSchema, // 定时任务
    ingressSchema, // 服务访问
    logSchema, // 监控日志
    workloadSchema, // 变更与调度
    annotationSchema, // Annotation
    podLabelSchema, // Label
    secretSchema, // Secret
    aiDataReflowSchema, // AI数据回流
    fpmConfigSchema, // FPM配置
    advancedConfigSchema, // 高级配置
];

// 从 TabSchema[] 中收集所有字段的初始值（支持 GroupSchema 嵌套）
function collectInitialValues(tabs: TabSchema[]): Record<string, unknown> {
    const values: Record<string, unknown> = {};

    const collectNode = (node: SchemaNode) => {
        if (isFieldSchema(node) && node.initialValue !== undefined && node.name) {
            const key = Array.isArray(node.name) ? node.name[0] : node.name;
            values[key] = node.initialValue;
        }
        // GroupSchema 和 ObjectSchema 递归处理子节点
        if (isGroupSchema(node)) {
            node.fields.forEach(collectNode);
        }
    };

    for (const tab of tabs) {
        for (const node of tab.fields) {
            collectNode(node);
        }
    }

    return values;
}

const RuntimeConfig: React.FC = () => {
    const { appId } = useParams<{ appId: string; }>();
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const initialValues = useMemo(
        () => collectInitialValues(TABS),
        [],
    );

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            // TODO: 调用 API 保存运行配置
            // eslint-disable-next-line no-console
            console.log('runtime config values:', appId, values);
            messageApi.success('运行配置保存成功');
        } catch {
            messageApi.error('请检查表单填写是否正确');
        }
    };

    const handleReset = () => {
        form.resetFields();
    };

    const tabItems = useMemo(
        () =>
            TABS.map(tab => ({
                key: tab.key,
                label: tab.label,
                children: (
                    <div
                        style={{ padding: '16px 0' }}
                        data-ai-role="tabPanel"
                        data-ai-entity={tab.key}
                    >
                        {tab.fields.map((node, index) => {
                            if (isGroupSchema(node)) {
                                // 渲染分组容器
                                return (
                                    <SchemaGroup
                                        key={node.title}
                                        group={node}
                                        form={form}
                                        validatorRegistry={validatorRegistry}
                                    />
                                );
                            }
                            // 渲染普通字段（支持 FieldSchema / ArraySchema / ObjectSchema）
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
                    </div>
                ),
            })),
        [form],
    );

    return (
        <div
            style={{ maxWidth: 800 }}
            data-ai-role="page"
            data-ai-entity="runtimeConfig"
            data-ai-desc={`应用 ${appId} 的运行配置`}
        >
            {contextHolder}
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
                data-ai-role="form"
                data-ai-entity="runtimeConfigForm"
            >
                <Tabs
                    items={tabItems}
                    type="card"
                    size="small"
                    style={{ marginBottom: 24 }}
                />
                <Form.Item>
                    <Space>
                        <Button
                            type="primary"
                            onClick={handleSave}
                            data-ai-action="saveRuntimeConfig"
                        >
                            保存配置
                        </Button>
                        <Button
                            onClick={handleReset}
                            data-ai-action="resetRuntimeConfig"
                        >
                            重置
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
};

export default RuntimeConfig;
