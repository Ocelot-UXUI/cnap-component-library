/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable max-lines */
import {DownOutlined, QuestionCircleOutlined, RightOutlined} from '@ant-design/icons';
import {Form, Tooltip} from '@/design';
import type {FormInstance} from '@/design';
import React, {useState} from 'react';
import type {GroupSchema, ValidatorRegistry} from './schema/types';
import {isFieldSchema} from './schema/types';
import {SchemaRenderer} from './SchemaRenderer';

interface SchemaGroupProps {
    group: GroupSchema;
    form: FormInstance;
    validatorRegistry: ValidatorRegistry;
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

const groupWrapperStyle: React.CSSProperties = {
    marginBottom: 16,
};

/**
 * 渲染一个带标题栏的字段分组容器。
 * 对应 CNAP1.0 的 InheritFormFieldLayout + FieldSecondaryContainer 组合。
 * 支持可见性条件（整组 show/hide）和可折叠。
 */
export const SchemaGroup: React.FC<SchemaGroupProps> = ({ group, form, validatorRegistry }) => {
    const { title, tooltip, collapsible, defaultCollapsed = false, visible, fields, aiMeta } = group;
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    // 处理整组可见性条件
    if (visible) {
        return (
            <Form.Item noStyle dependencies={[visible.fieldName, ...(visible.and?.map(c => c.fieldName) ?? [])]}>
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
                        && (visible.and?.every(checkCondition) ?? true);

                    if (!isVisible) {
                        return null;
                    }

                    return (
                        <GroupContent
                            title={title}
                            tooltip={tooltip}
                            collapsible={collapsible}
                            collapsed={collapsed}
                            onToggle={() => setCollapsed(v => !v)}
                            fields={fields}
                            form={form}
                            validatorRegistry={validatorRegistry}
                            aiMeta={aiMeta}
                        />
                    );
                }}
            </Form.Item>
        );
    }

    return (
        <GroupContent
            title={title}
            tooltip={tooltip}
            collapsible={collapsible}
            collapsed={collapsed}
            onToggle={() => setCollapsed(v => !v)}
            fields={fields}
            form={form}
            validatorRegistry={validatorRegistry}
            aiMeta={aiMeta}
        />
    );
};

interface GroupContentProps {
    title: string;
    tooltip?: string;
    collapsible?: boolean;
    collapsed: boolean;
    onToggle: () => void;
    fields: GroupSchema['fields'];
    form: FormInstance;
    validatorRegistry: ValidatorRegistry;
    aiMeta?: GroupSchema['aiMeta'];
}

const GroupContent: React.FC<GroupContentProps> = ({
    title,
    tooltip,
    collapsible,
    collapsed,
    onToggle,
    fields,
    form,
    validatorRegistry,
    aiMeta,
}) => (
    <div style={groupWrapperStyle} data-ai-role={aiMeta?.role ?? 'fieldGroup'} data-ai-entity={aiMeta?.entity}>
        {/* 标题栏 */}
        <div
            style={{
                ...groupHeaderStyle,
                cursor: collapsible ? 'pointer' : 'default',
            }}
            onClick={collapsible ? onToggle : undefined}
            data-ai-desc={aiMeta?.desc}
        >
            {collapsible && (
                collapsed
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
        {!collapsed && (
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
                        />
                    );
                })}
            </div>
        )}
    </div>
);
