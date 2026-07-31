/* eslint-disable max-len */
/* eslint-disable max-lines */
/* eslint-disable max-statements-per-line */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable complexity */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-use-before-define */
import {
    DeleteOutlined,
    DownOutlined,
    PlusOutlined,
    QuestionCircleOutlined,
    RightOutlined,
    UpOutlined,
    VerticalAlignTopOutlined,
} from '@ant-design/icons';
import {css} from '@emotion/css';
import {Button, Col, Form, Modal, Row, Tooltip} from 'antd';
import type {FormInstance, Rule} from 'antd/es/form';
import React, {useCallback, useMemo, useState} from 'react';
import {componentRegistry} from './schema/componentRegistry';
import type {
    ArraySchema,
    FieldSchema,
    GroupSchema,
    ObjectSchema,
    RowSchema,
    SchemaNode,
    ValidatorRegistry,
} from './schema/types';
import {
    isArraySchema,
    isFieldSchema,
    isGroupSchema,
    isObjectSchema,
    isRowSchema,
} from './schema/types';
import type {VisibleCondition} from './schema/types';

// ── 辅助函数：处理可见性条件 ────────────────────────────────────────
function normalizeFieldName(fieldName: string | string[]): string[] {
    return Array.isArray(fieldName) ? fieldName : [fieldName];
}

function getWatchFields(
    visible: VisibleCondition,
    parentPath: Array<string | number> = [],
): Array<Array<string | number>> {
    return [
        [...parentPath, ...normalizeFieldName(visible.fieldName)],
        ...(visible.and?.map(c => [...parentPath, ...normalizeFieldName(c.fieldName)]) ?? []),
    ];
}

function checkVisibleCondition(
    getFieldValue: (name: Array<string | number>) => unknown,
    cond: VisibleCondition,
    parentPath: Array<string | number> = [],
): boolean {
    const watched = getFieldValue([...parentPath, ...normalizeFieldName(cond.fieldName)]);
    if (cond.oneOf !== undefined) return cond.oneOf.includes(watched);
    if (cond.value !== undefined) return watched === cond.value;
    return watched !== undefined && watched !== null && watched !== '';
}

interface SchemaRendererProps {
    schema: SchemaNode;
    form: FormInstance;
    validatorRegistry: ValidatorRegistry;
    // 父级路径（用于嵌套场景）
    parentPath?: Array<string | number>;
}

/**
 * 统一的 Schema 节点渲染器
 * 支持：FieldSchema | ArraySchema | ObjectSchema | GroupSchema | RowSchema
 */
export const SchemaRenderer: React.FC<SchemaRendererProps> = ({
    schema,
    form,
    validatorRegistry,
    parentPath = [],
}) => {
    // 根据类型分发渲染
    if (isFieldSchema(schema)) {
        return (
            <RenderField schema={schema} form={form} validatorRegistry={validatorRegistry} parentPath={parentPath} />
        );
    }
    if (isArraySchema(schema)) {
        return (
            <RenderArray schema={schema} form={form} validatorRegistry={validatorRegistry} parentPath={parentPath} />
        );
    }
    if (isObjectSchema(schema)) {
        return (
            <RenderObject schema={schema} form={form} validatorRegistry={validatorRegistry} parentPath={parentPath} />
        );
    }
    if (isGroupSchema(schema)) {
        return (
            <RenderGroup schema={schema} form={form} validatorRegistry={validatorRegistry} parentPath={parentPath} />
        );
    }
    if (isRowSchema(schema)) {
        return <RenderRow schema={schema} form={form} validatorRegistry={validatorRegistry} parentPath={parentPath} />;
    }
    return null;
};

// ── 1. 普通字段渲染 ────────────────────────────────────────────────
interface RenderFieldProps {
    schema: FieldSchema;
    form: FormInstance;
    validatorRegistry: ValidatorRegistry;
    parentPath: Array<string | number>;
}

const RenderField: React.FC<RenderFieldProps> = ({ schema, form, validatorRegistry, parentPath }) => {
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
    // name 可选：对于数组项，name 省略时直接使用 parentPath
    const fullName = name
        ? [...parentPath, ...(Array.isArray(name) ? name : [name])]
        : parentPath;
    const valuePropName = component === 'Switch' ? 'checked' : 'value';

    // 编译 rules
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
        [required, label, staticRules, validators, validatorRegistry],
    );

    // 组件 props
    const resolvedProps = useMemo(
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

    // label 节点
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

    const formItem = (
        <Form.Item
            name={fullName}
            label={labelNode ?? undefined}
            rules={compiledRules}
            initialValue={initialValue}
            dependencies={dependencies}
            valuePropName={valuePropName}
            {...formItemProps}
            data-ai-role={aiMeta?.role ?? 'field'}
            data-ai-entity={aiMeta?.desc}
            style={{ marginBottom: 0, ...formItemProps?.style }}
        >
            <Component {...resolvedProps} />
        </Form.Item>
    );

    // 可见性处理 - RenderField
    if (!visible) return formItem;

    const watchFields = getWatchFields(visible, parentPath);

    return (
        <Form.Item noStyle dependencies={watchFields}>
            {({ getFieldValue }) => {
                const isVisible = checkVisibleCondition(getFieldValue, visible, parentPath)
                    && (visible.and?.every(c => checkVisibleCondition(getFieldValue, c, parentPath)) ?? true);
                return isVisible ? formItem : null;
            }}
        </Form.Item>
    );
};

// ── 2. 数组字段渲染 ────────────────────────────────────────────────
interface RenderArrayProps {
    schema: ArraySchema;
    form: FormInstance;
    validatorRegistry: ValidatorRegistry;
    parentPath: Array<string | number>;
}

const RenderArray: React.FC<RenderArrayProps> = ({ schema, form, validatorRegistry, parentPath }) => {
    const {
        name,
        label,
        itemSchema,
        initialValue = [],
        minItems = 0,
        maxItems,
        addButtonText = '添加',
        atLeastOne = false,
        tooltip,
        required,
        aiMeta,
        sortable = false,
        confirmDelete,
        itemHeader,
        expandedField,
    } = schema;

    const fullName = [...parentPath, ...(Array.isArray(name) ? name : [name])];

    // label 节点
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

    // 删除处理（支持确认弹窗）
    const handleDelete = useCallback(
        (remove: (index: number) => void, index: number) => {
            if (confirmDelete) {
                Modal.confirm({
                    content: confirmDelete,
                    onOk: () => remove(index),
                });
            } else {
                remove(index);
            }
        },
        [confirmDelete],
    );

    // 移动操作
    const handleMove = useCallback(
        (type: 'up' | 'down' | 'top', index: number, total: number) => {
            const values = form.getFieldValue(fullName as Array<string | number>);
            if (!values || !Array.isArray(values)) return;

            const newValues = [...values];
            if (type === 'up' && index > 0) {
                [newValues[index - 1], newValues[index]] = [newValues[index], newValues[index - 1]];
            } else if (type === 'down' && index < total - 1) {
                [newValues[index], newValues[index + 1]] = [newValues[index + 1], newValues[index]];
            } else if (type === 'top' && index > 0) {
                const item = newValues.splice(index, 1)[0];
                newValues.unshift(item);
            }
            form.setFieldValue(fullName as Array<string | number>, newValues);
        },
        [form, fullName],
    );

    return (
        <Form.Item
            label={labelNode}
            required={required}
            data-ai-role={aiMeta?.role ?? 'arrayField'}
            data-ai-entity={aiMeta?.desc}
        >
            <Form.List name={fullName as Array<string | number>} initialValue={initialValue as unknown[]}>
                {(fields, { add, remove }) => (
                    <div>
                        {fields.map((field, index) => (
                            <ArrayItemContainer
                                key={field.key}
                                field={field}
                                index={index}
                                total={fields.length}
                                itemSchema={itemSchema}
                                itemHeader={itemHeader}
                                form={form}
                                validatorRegistry={validatorRegistry}
                                parentPath={fullName as Array<string | number>}
                                sortable={sortable}
                                atLeastOne={atLeastOne}
                                minItems={minItems}
                                expandedField={expandedField}
                                onMove={handleMove}
                                onDelete={() => handleDelete(remove, field.name)}
                            />
                        ))}
                        {(!maxItems || fields.length < maxItems) && (
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={() => add()}
                                data-ai-action="addArrayItem"
                            >
                                {addButtonText}
                            </Button>
                        )}
                    </div>
                )}
            </Form.List>
        </Form.Item>
    );
};

// ── 数组项容器组件 ────────────────────────────────────────────────
interface ArrayItemContainerProps {
    field: { key: number; name: number; };
    index: number;
    total: number;
    itemSchema: SchemaNode;
    itemHeader?: SchemaNode;
    form: FormInstance;
    validatorRegistry: ValidatorRegistry;
    parentPath: Array<string | number>;
    sortable: boolean;
    atLeastOne: boolean;
    minItems: number;
    expandedField?: string;
    onMove: (type: 'up' | 'down' | 'top', index: number, total: number) => void;
    onDelete: () => void;
}

// 模拟 CNAP1.0 的 FieldSecondaryContainer 样式
const arrayItemContainerStyle = css`
    position: relative;
    padding: 20px 20px 1px 20px;
    background-image: linear-gradient(50deg, rgba(49,127,245,0.12) 0%, rgba(160,97,240,0.02) 100%);
    width: 100%;
    margin-bottom: 12px;
`;

const ArrayItemContainer: React.FC<ArrayItemContainerProps> = ({
    field,
    index,
    total,
    itemSchema,
    itemHeader,
    form,
    validatorRegistry,
    parentPath,
    sortable,
    atLeastOne,
    minItems,
    expandedField,
    onMove,
    onDelete,
}) => {
    // 展开/折叠状态
    const [expanded, setExpanded] = useState(true);
    const showExpandButton = !!expandedField || isObjectSchema(itemSchema);

    // 从表单获取展开状态
    const formExpanded = expandedField
        ? Form.useWatch([...parentPath, field.name, expandedField], form)
        : undefined;
    const isExpanded = formExpanded !== undefined ? formExpanded : expanded;

    const handleToggle = useCallback(
        () => {
            if (expandedField) {
                form.setFieldValue([...parentPath, field.name, expandedField], !isExpanded);
            } else {
                setExpanded(v => !v);
            }
        },
        [form, parentPath, field.name, expandedField, isExpanded],
    );

    const canDelete = (!atLeastOne || total > 1) && (!minItems || total > minItems);

    return (
        <div className={arrayItemContainerStyle}>
            {/* 操作栏 */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: 12,
                }}
            >
                {sortable && (
                    <>
                        <Button
                            type="text"
                            size="small"
                            icon={<UpOutlined />}
                            disabled={index === 0}
                            onClick={() => onMove('up', index, total)}
                            title="上移"
                        />
                        <Button
                            type="text"
                            size="small"
                            icon={<DownOutlined />}
                            disabled={index === total - 1}
                            onClick={() => onMove('down', index, total)}
                            title="下移"
                        />
                        <Button
                            type="text"
                            size="small"
                            icon={<VerticalAlignTopOutlined />}
                            disabled={index === 0}
                            onClick={() => onMove('top', index, total)}
                            title="置顶"
                        />
                    </>
                )}
                {canDelete && (
                    <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={onDelete}
                        title="删除"
                    />
                )}
                {showExpandButton && (
                    <Button
                        type="text"
                        size="small"
                        icon={isExpanded ? <DownOutlined /> : <UpOutlined />}
                        onClick={handleToggle}
                        title={isExpanded ? '收起' : '展开'}
                    />
                )}
            </div>
            {/* 内容区 */}
            {isExpanded && (
                <>
                    {itemHeader && (
                        <SchemaRenderer
                            schema={itemHeader}
                            form={form}
                            validatorRegistry={validatorRegistry}
                            parentPath={[...parentPath, field.name] as Array<string | number>}
                        />
                    )}
                    <SchemaRenderer
                        schema={itemSchema}
                        form={form}
                        validatorRegistry={validatorRegistry}
                        parentPath={[...parentPath, field.name] as Array<string | number>}
                    />
                </>
            )}
        </div>
    );
};

// ── 3. 对象字段渲染 ────────────────────────────────────────────────
interface RenderObjectProps {
    schema: ObjectSchema;
    form: FormInstance;
    validatorRegistry: ValidatorRegistry;
    parentPath: Array<string | number>;
}

const RenderObject: React.FC<RenderObjectProps> = ({ schema, form, validatorRegistry, parentPath }) => {
    const { name, fields, label, tooltip, visible, aiMeta } = schema;
    const fullName = name
        ? [...parentPath, ...(Array.isArray(name) ? name : [name])]
        : parentPath;

    // label 节点
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

    const content = (
        <div data-ai-role={aiMeta?.role ?? 'objectField'} data-ai-entity={aiMeta?.desc}>
            {label && <div style={{ fontWeight: 500, marginBottom: 8 }}>{labelNode}</div>}
            {fields.map((field, index) => {
                const key = isFieldSchema(field) && field.name
                    ? (Array.isArray(field.name) ? field.name.join('.') : field.name)
                    : `field-${index}`;
                return (
                    <SchemaRenderer
                        key={key}
                        schema={field}
                        form={form}
                        validatorRegistry={validatorRegistry}
                        parentPath={fullName}
                    />
                );
            })}
        </div>
    );

    // 可见性处理 - RenderObject
    if (!visible) return content;

    const watchFields = getWatchFields(visible, parentPath);

    return (
        <Form.Item noStyle dependencies={watchFields}>
            {({ getFieldValue }) => {
                const isVisible = checkVisibleCondition(getFieldValue, visible, parentPath)
                    && (visible.and?.every(c => checkVisibleCondition(getFieldValue, c, parentPath)) ?? true);
                return isVisible ? content : null;
            }}
        </Form.Item>
    );
};

// ── 4. 分组渲染 ─────────────────────────────────────────────────────
interface RenderGroupProps {
    schema: GroupSchema;
    form: FormInstance;
    validatorRegistry: ValidatorRegistry;
    parentPath: Array<string | number>;
}

const groupHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    background: 'linear-gradient(90deg, rgba(49,127,245,0.10) 0%, rgba(160,97,240,0.04) 100%)',
    borderRadius: '4px 4px 0 0',
    borderLeft: '3px solid #317ff5',
    cursor: 'default',
    userSelect: 'none',
};

const groupBodyStyle: React.CSSProperties = {
    padding: '12px 16px 4px',
    background: 'linear-gradient(135deg, rgba(49,127,245,0.04) 0%, rgba(160,97,240,0.01) 100%)',
    border: '1px solid rgba(49,127,245,0.15)',
    borderTop: 'none',
    borderRadius: '0 0 4px 4px',
    marginBottom: 16,
};

const RenderGroup: React.FC<RenderGroupProps> = ({ schema, form, validatorRegistry, parentPath }) => {
    const { title, tooltip, collapsible, defaultCollapsed = false, expandedField, visible, fields, aiMeta } = schema;
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    // 从表单获取展开状态
    const formExpanded = expandedField
        ? Form.useWatch(expandedField, form)
        : undefined;
    const isCollapsed = formExpanded !== undefined ? !formExpanded : collapsed;

    const handleToggle = useCallback(
        () => {
            if (expandedField) {
                form.setFieldValue(expandedField, !formExpanded);
            } else {
                setCollapsed(v => !v);
            }
        },
        [form, expandedField, formExpanded],
    );

    const content = (
        <div style={{ marginBottom: 16 }} data-ai-role={aiMeta?.role ?? 'fieldGroup'} data-ai-entity={aiMeta?.entity}>
            {/* 标题栏 */}
            <div
                style={{ ...groupHeaderStyle, cursor: collapsible ? 'pointer' : 'default' }}
                onClick={collapsible ? handleToggle : undefined}
            >
                {collapsible && (
                    isCollapsed
                        ? <RightOutlined style={{ fontSize: 11, color: '#317ff5' }} />
                        : <DownOutlined style={{ fontSize: 11, color: '#317ff5' }} />
                )}
                <span style={{ fontWeight: 500, fontSize: 13, color: '#1a1a2e' }}>{title}</span>
                {tooltip && (
                    <Tooltip title={tooltip}>
                        <QuestionCircleOutlined style={{ fontSize: 12, color: '#999' }} />
                    </Tooltip>
                )}
            </div>
            {/* 内容区 */}
            {!isCollapsed && (
                <div style={groupBodyStyle}>
                    {fields.map((field, index) => {
                        const key = isFieldSchema(field) && field.name
                            ? (Array.isArray(field.name) ? field.name.join('.') : field.name)
                            : `field-${index}`;
                        return (
                            <SchemaRenderer
                                key={key}
                                schema={field}
                                form={form}
                                validatorRegistry={validatorRegistry}
                                parentPath={parentPath}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );

    // 可见性处理 - RenderGroup
    if (!visible) return content;

    const watchFields = getWatchFields(visible, parentPath);

    return (
        <Form.Item noStyle dependencies={watchFields}>
            {({ getFieldValue }) => {
                const isVisible = checkVisibleCondition(getFieldValue, visible, parentPath)
                    && (visible.and?.every(c => checkVisibleCondition(getFieldValue, c, parentPath)) ?? true);
                return isVisible ? content : null;
            }}
        </Form.Item>
    );
};

// ── 5. 行布局渲染 ───────────────────────────────────────────────────
interface RenderRowProps {
    schema: RowSchema;
    form: FormInstance;
    validatorRegistry: ValidatorRegistry;
    parentPath: Array<string | number>;
}

const RenderRow: React.FC<RenderRowProps> = ({ schema, form, validatorRegistry, parentPath }) => {
    const { fields, gutter = 16, spans, visible } = schema;

    // 默认均分 span
    const defaultSpan = Math.floor(24 / fields.length);
    const colSpans = spans || fields.map(() => defaultSpan);

    const content = (
        <Row gutter={gutter}>
            {fields.map((field, index) => (
                <Col key={`col-${index}`} span={colSpans[index] || defaultSpan}>
                    <SchemaRenderer
                        schema={field}
                        form={form}
                        validatorRegistry={validatorRegistry}
                        parentPath={parentPath}
                    />
                </Col>
            ))}
        </Row>
    );

    // 可见性处理 - RenderRow
    if (!visible) return content;

    const watchFields = getWatchFields(visible, parentPath);

    return (
        <Form.Item noStyle dependencies={watchFields}>
            {({ getFieldValue }) => {
                const isVisible = checkVisibleCondition(getFieldValue, visible, parentPath)
                    && (visible.and?.every(c => checkVisibleCondition(getFieldValue, c, parentPath)) ?? true);
                return isVisible ? content : null;
            }}
        </Form.Item>
    );
};

// 保持向后兼容，导出 SchemaField 别名
export const SchemaField = SchemaRenderer;
