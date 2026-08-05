import {QuestionCircleOutlined} from '@ant-design/icons';
import {Form, Tooltip} from '@/design';
import type {FormInstance, Rule} from '@/design';
import React, {useMemo} from 'react';
import {componentRegistry} from './schema/componentRegistry';
import type {FieldSchema, ValidatorRegistry} from './schema/types';

interface SchemaFieldProps {
    schema: FieldSchema;
    form: FormInstance;
    validatorRegistry: ValidatorRegistry;
}

/**
 * 根据 FieldSchema 渲染单个 Form.Item。
 * - 从 componentRegistry 解析组件
 * - 从 validatorRegistry 解析自定义校验器
 * - 处理 visible 条件（依赖字段变化时重新判断可见性）
 * - 通过 dependencies 触发跨字段重新校验
 */
export const SchemaField: React.FC<SchemaFieldProps> = ({ schema, form, validatorRegistry }) => {
    const {
        name,
        label,
        component,
        componentProps = {},
        options,
        initialValue,
        required,
        rules: staticRules = [],
        validators = [],
        visible,
        dependencies,
        tooltip,
        placeholder,
        formItemProps = {},
        aiMeta,
    } = schema;

    const Component = componentRegistry[component];

    // Switch 使用 checked 而非 value 作为受控 prop
    const valuePropName = component === 'Switch' ? 'checked' : 'value';

    // 编译 rules：静态规则 + 动态校验器工厂（useMemo 避免每次渲染重建）
    const compiledRules = useMemo<Rule[]>(
        () => {
            const result: Rule[] = [];

            if (required) {
                result.push({ required: true, message: `${label}为必填项` });
            }

            result.push(...staticRules);

            for (const ref of validators) {
                const factory = validatorRegistry[ref.name];
                if (factory) {
                    result.push(factory(ref.params ?? {}, form));
                }
            }

            return result;
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [required, label, staticRules, validators, validatorRegistry, form],
    );

    // 合并传给组件的 props
    const resolvedComponentProps = useMemo(
        () => {
            const props: Record<string, unknown> = { ...componentProps };
            if (options) {
                props.options = options;
            }
            if (placeholder) {
                props.placeholder = placeholder;
            }
            if (aiMeta?.param) {
                props['data-ai-param'] = aiMeta.param;
            }
            return props;
        },
        [componentProps, options, placeholder, aiMeta],
    );

    // Form.Item label（带 tooltip）
    const labelNode = tooltip
        ? (
            <span>
                {label}
                <Tooltip title={tooltip}>
                    <QuestionCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                </Tooltip>
            </span>
        )
        : label;

    // 核心 Form.Item
    const formItem = (
        <Form.Item
            name={name}
            label={labelNode}
            rules={compiledRules}
            initialValue={initialValue}
            dependencies={dependencies}
            valuePropName={valuePropName}
            {...formItemProps}
            data-ai-role={aiMeta?.role ?? 'field'}
            data-ai-entity={aiMeta?.desc}
        >
            <Component {...resolvedComponentProps} />
        </Form.Item>
    );

    // 无可见性条件，直接渲染
    if (!visible) {
        return formItem;
    }

    // 有可见性条件：用 dependencies 监听目标字段，满足条件才渲染
    const { fieldName, and } = visible;

    // 收集所有需要监听的字段（主字段 + and 子条件字段）
    const watchFields = [fieldName, ...(and?.map(c => c.fieldName) ?? [])];

    return (
        <Form.Item noStyle dependencies={watchFields}>
            {({ getFieldValue }) => {
                const checkCondition = (cond: typeof visible): boolean => {
                    const watched = getFieldValue(cond.fieldName);
                    if (cond.oneOf !== undefined) {
                        return cond.oneOf.includes(watched);
                    }
                    if (cond.value !== undefined) {
                        return watched === cond.value;
                    }
                    return watched !== undefined && watched !== null && watched !== '';
                };

                const isVisible = checkCondition(visible)
                    && (and?.every(checkCondition) ?? true);

                if (!isVisible) {
                    return null;
                }

                return formItem;
            }}
        </Form.Item>
    );
};
