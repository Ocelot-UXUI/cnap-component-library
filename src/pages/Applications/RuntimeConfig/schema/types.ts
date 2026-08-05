import type {FormItemProps} from '@/design';
import type {FormInstance, Rule} from '@/design';

// ── 支持的组件类型 ────────────────────────────────────────────────
export type ComponentType =
    | 'Input'
    | 'InputNumber'
    | 'Select'
    | 'Switch'
    | 'Slider'
    | 'Radio'
    | 'Checkbox'
    | 'TextArea'
    | 'PortList'
    | 'EnvList'
    | 'ProbeConfig'
    | 'ResourceLimit'
    | 'KeyValueList'
    | 'ContainerList'
    | 'MountVolumeList'
    | 'ConfigReferenceList';

// ── 选项定义（用于 Select / Radio / Checkbox）───────────────────
export interface FieldOption {
    label: string;
    value: string | number | boolean | null;
    disabled?: boolean;
}

// ── 可见性条件 ────────────────────────────────────────────────────
export interface VisibleCondition {
    // 字段名，支持嵌套路径（如 'startupProbe.enable' 或 ['startupProbe', 'enable']）
    fieldName: string | string[];
    value?: unknown;
    oneOf?: unknown[];
    and?: VisibleCondition[];
}

// ── 校验器引用 ────────────────────────────────────────────────────
export interface ValidatorRef {
    name: string;
    params?: Record<string, unknown>;
}

// ── 公共字段属性（所有 Schema 类型共享）───────────────────────────
export interface BaseSchemaProps {
    // 表单字段名（支持嵌套路径，如 'resources.cpu' 或 ['resources', 'cpu']）
    // 对于数组项（itemSchema），name 可以省略，表示值直接存储在数组索引位置
    name?: string | string[];
    // 展示标签
    label?: string;
    // 默认值
    initialValue?: unknown;
    // 是否必填
    required?: boolean;
    // antd 原生 rules
    rules?: Rule[];
    // 自定义校验器
    validators?: ValidatorRef[];
    // 可见性条件
    visible?: VisibleCondition;
    // 依赖字段
    dependencies?: string[];
    // 帮助文本
    tooltip?: string;
    // 透传给 Form.Item 的 props
    formItemProps?: Omit<FormItemProps, 'name' | 'rules' | 'initialValue' | 'dependencies' | 'valuePropName'>;
    // AI 元数据
    aiMeta?: {
        role?: string;
        param?: string;
        desc?: string;
    };
}

// ── 1. 普通字段 Schema（叶子节点）─────────────────────────────────
export interface FieldSchema extends BaseSchemaProps {
    type?: 'field'; // 默认，可省略
    // 对应 componentRegistry 中的组件 key
    component: ComponentType;
    // 传递给组件的 props
    componentProps?: Record<string, unknown>;
    // 选项（Select / Radio / Checkbox）
    options?: FieldOption[];
    // 占位符
    placeholder?: string;
}

// ── 2. 数组字段 Schema ─────────────────────────────────────────────
export interface ArraySchema extends BaseSchemaProps {
    type: 'array';
    // 数组项的 Schema（可以是 FieldSchema、ObjectSchema 或嵌套的 ArraySchema）
    itemSchema: SchemaNode;
    // 数组项的最小数量
    minItems?: number;
    // 数组项的最大数量
    maxItems?: number;
    // 添加按钮文本
    addButtonText?: string;
    // 是否至少保留一项（禁止删除最后一项）
    atLeastOne?: boolean;
    // 是否支持排序（上移、下移、置顶）
    sortable?: boolean;
    // 删除确认提示文案，设置后删除前会弹出确认框
    confirmDelete?: string;
    // 数组项头部 Schema（用于渲染操作按钮区域）
    itemHeader?: SchemaNode;
    // 展开状态字段名（用于控制数组项的展开/折叠）
    expandedField?: string;
}

// ── 3. 对象字段 Schema ─────────────────────────────────────────────
export interface ObjectSchema extends BaseSchemaProps {
    type: 'object';
    // 对象的子字段
    fields: SchemaNode[];
}

// ── 4. 分组 Schema（带标题的容器）─────────────────────────────────
export interface GroupSchema {
    type: 'group';
    // 分组标题
    title: string;
    // 分组说明
    tooltip?: string;
    // 是否可折叠
    collapsible?: boolean;
    // 默认是否折叠
    defaultCollapsed?: boolean;
    // 展开状态字段名（绑定到表单字段，而非组件内部状态）
    expandedField?: string;
    // 分组可见性
    visible?: VisibleCondition;
    // 组内的字段列表
    fields: SchemaNode[];
    // AI 元数据
    aiMeta?: {
        role?: string;
        entity?: string;
        desc?: string;
    };
}

// ── 5. 行布局 Schema（多列布局）─────────────────────────────────────
export interface RowSchema {
    type: 'row';
    // 行内的字段列表（每个字段占一列）
    fields: SchemaNode[];
    // 列间距
    gutter?: number;
    // 每列的 span（默认均分，如 2 列则各 12）
    spans?: number[];
    // 可见性条件
    visible?: VisibleCondition;
}

// ── Schema 节点联合类型 ───────────────────────────────────────────
export type SchemaNode = FieldSchema | ArraySchema | ObjectSchema | GroupSchema | RowSchema;

// ── Tab 内的节点类型 ──────────────────────────────────────────────
export type TabNode = SchemaNode;

// ── Tab 定义 ──────────────────────────────────────────────────────
export interface TabSchema {
    key: string;
    label: string;
    fields: TabNode[];
}

// ── 整个运行配置的 Schema ────────────────────────────────────────
export interface RuntimeConfigSchema {
    tabs: TabSchema[];
}

// ── 校验器工厂函数类型 ────────────────────────────────────────────
export type ValidatorFactory = (
    params: Record<string, unknown>,
    form: FormInstance,
) => Rule;

// ── 校验器注册表 ──────────────────────────────────────────────────
export type ValidatorRegistry = Record<string, ValidatorFactory>;

// ── 类型守卫 ──────────────────────────────────────────────────────
export function isFieldSchema(node: SchemaNode): node is FieldSchema {
    const type = (node as { type?: string; }).type;
    return type === 'field' || type === undefined;
}

export function isArraySchema(node: SchemaNode): node is ArraySchema {
    return (node as { type?: string; }).type === 'array';
}

export function isObjectSchema(node: SchemaNode): node is ObjectSchema {
    return (node as { type?: string; }).type === 'object';
}

export function isGroupSchema(node: SchemaNode): node is GroupSchema {
    return (node as { type?: string; }).type === 'group';
}

export function isRowSchema(node: SchemaNode): node is RowSchema {
    return (node as { type?: string; }).type === 'row';
}
