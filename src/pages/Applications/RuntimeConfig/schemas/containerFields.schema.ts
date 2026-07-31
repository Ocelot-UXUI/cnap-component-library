import type {GroupSchema} from '../schema/types';

/**
 * 启动命令和参数分组 Schema
 * 用于验证 schema 支持嵌套结构（数组类型）
 */
export const commandAndArgsGroup: GroupSchema = {
    type: 'group',
    title: '启动命令和参数',
    fields: [
        {
            type: 'array',
            name: 'command',
            label: '启动命令',
            tooltip: '请将启动命令按空格拆分后填写到多个输入框中',
            initialValue: [],
            itemSchema: {
                type: 'field',
                // 不设置 name，数组项直接存储在索引位置
                component: 'Input',
                placeholder: '请输入命令',
                formItemProps: { style: { marginBottom: 0 } },
            },
            addButtonText: '添加命令',
            aiMeta: { role: 'arrayField', param: 'command', desc: '容器启动命令' },
        },
        {
            type: 'array',
            name: 'args',
            label: '参数',
            initialValue: [],
            itemSchema: {
                type: 'field',
                // 不设置 name，数组项直接存储在索引位置
                component: 'Input',
                placeholder: '请输入参数',
                formItemProps: { style: { marginBottom: 0 } },
            },
            addButtonText: '添加参数',
            aiMeta: { role: 'arrayField', param: 'args', desc: '容器启动参数' },
        },
    ],
    aiMeta: { role: 'fieldGroup', entity: 'commandAndArgs' },
};

// 导出类型供类型检查使用
export interface CommandAndArgsValue {
    command?: string[];
    args?: string[];
}
