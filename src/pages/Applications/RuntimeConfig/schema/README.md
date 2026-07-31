# Schema 驱动表单渲染方案

基于 JSON Schema 的动态表单渲染方案，支持层级嵌套、行级布局、可见性联动、AI 标签等能力。

## 一、核心架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Schema 定义层                           │
│  (startup.schema.ts / containerFields.schema.ts)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SchemaRenderer                            │
│  统一渲染器，根据 schema type 分发到对应组件                  │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  RenderField  │     │  RenderArray  │     │  RenderRow    │
│  普通字段渲染  │     │  数组字段渲染  │     │  行布局渲染    │
└───────────────┘     └───────────────┘     └───────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  componentRegistry                           │
│  组件注册表，映射 component key 到 React 组件                 │
└─────────────────────────────────────────────────────────────┘
```

## 二、Schema 节点类型

### 1. FieldSchema - 普通字段

最基础的表单字段节点，对应一个表单控件。

```typescript
{
    type: 'field',           // 可省略，默认值
    name: 'startCommand',    // 字段名，支持嵌套路径
    label: '启动命令',
    component: 'Input',      // 组件类型
    placeholder: '请输入',
    required: true,
    initialValue: '',
    options: [...],          // Select/Radio/Checkbox 的选项
    tooltip: '帮助提示',
    visible: {               // 可见性条件
        fieldName: 'expanded',
        value: true
    },
    aiMeta: {                // AI 标签
        role: 'field',
        param: 'startCommand',
        desc: '启动命令字段'
    }
}
```

### 2. ArraySchema - 数组字段

支持动态增删、排序、展开/折叠的数组容器。

```typescript
{
    type: 'array',
    name: 'commandList',
    label: '启动配置列表',
    itemSchema: { ... },       // 数组项的 Schema
    initialValue: [...],       // 默认值
    minItems: 1,               // 最小项数
    maxItems: 10,              // 最大项数
    sortable: true,            // 支持排序
    confirmDelete: '确定删除吗？',  // 删除确认提示
    expandedField: 'expanded', // 展开状态字段
    addButtonText: '添加配置'
}
```

### 3. ObjectSchema - 对象字段

嵌套对象容器，用于组织一组相关字段。

```typescript
{
    type: 'object',
    name: 'startupProbe',
    fields: [
        { type: 'field', name: 'enable', ... },
        { type: 'field', name: 'type', ... },
        ...
    ]
}
```

### 4. GroupSchema - 分组容器

带标题的可折叠分组容器。

```typescript
{
    type: 'group',
    title: '高级配置',
    collapsible: true,
    defaultCollapsed: true,
    expandedField: 'groupExpanded',  // 绑定到表单字段
    fields: [...]
}
```

### 5. RowSchema - 行布局

多列水平布局容器，用于实现两列表单。

```typescript
{
    type: 'row',
    fields: [
        { type: 'field', name: 'killGroup', ... },
        { type: 'field', name: 'keyModule', ... }
    ],
    gutter: 16,         // 列间距
    spans: [12, 12],    // 各列宽度（24栅格）
    visible: { ... }
}
```

## 三、核心能力

### 1. 层级嵌套

支持任意深度的嵌套结构：

```typescript
// 嵌套字段名
name: ['startupProbe', 'enable']  // → startupProbe.enable

// 嵌套对象
{
    type: 'object',
    name: 'startupProbe',
    fields: [
        { type: 'field', name: 'enable', ... },
        { type: 'object', name: 'config', fields: [...] }
    ]
}

// 数组嵌套对象
{
    type: 'array',
    itemSchema: {
        type: 'object',
        fields: [...]
    }
}
```

### 2. 行级布局

通过 `RowSchema` 实现多列布局：

```typescript
{
    type: 'row',
    fields: [
        { type: 'field', name: 'killGroup', label: '停止进程组', ... },
        { type: 'field', name: 'keyModule', label: '关键模块', ... }
    ]
}
```

渲染为：

```
┌──────────────────────┬──────────────────────┐
│  停止进程组: [是/否]  │  关键模块: [是/否]    │
└──────────────────────┴──────────────────────┘
```

### 3. 可见性联动

支持复杂的条件显示逻辑：

```typescript
// 单条件
visible: { fieldName: 'expanded', value: true }

// 多条件 AND
visible: {
    fieldName: 'expanded',
    value: true,
    and: [
        { fieldName: 'enableProbe', value: true },
        { fieldName: ['startupProbe', 'enable'], value: true }
    ]
}

// 多值匹配
visible: { fieldName: 'type', oneOf: ['TCP', 'HTTP'] }
```

### 4. 动态渲染

运行时根据 Schema 动态渲染表单：

```typescript
// 定义 Schema
const mySchema: TabSchema = {
    key: 'config',
    label: '配置',
    fields: [...]
};

// 渲染
<SchemaRenderer
    schema={mySchema}
    form={form}
    validatorRegistry={validatorRegistry}
/>
```

### 5. 数组操作

- **增删**：动态添加/删除数组项
- **排序**：上移、下移、置顶
- **删除确认**：可配置删除前确认弹窗
- **展开/折叠**：支持数组项展开/折叠

### 6. AI 标签

为 AI 场景提供语义化标签：

```typescript
aiMeta: {
    role: 'field',        // 元素角色
    param: 'startCommand', // 参数名
    desc: '启动命令'       // 描述
}
```

渲染结果：

```html
<div
    data-ai-role="field"
    data-ai-param="startCommand"
    data-ai-entity="启动命令"
>
    ...
</div>
```

## 四、组件注册表

| 组件名              | 说明         | 来源   |
| ------------------- | ------------ | ------ |
| Input               | 文本输入框   | antd   |
| InputNumber         | 数字输入框   | antd   |
| Select              | 下拉选择     | antd   |
| Switch              | 开关         | antd   |
| Slider              | 滑块         | antd   |
| Radio               | 单选组       | antd   |
| Checkbox            | 多选组       | antd   |
| TextArea            | 多行文本     | antd   |
| PortList            | 端口列表     | 自定义 |
| EnvList             | 环境变量列表 | 自定义 |
| ProbeConfig         | 探针配置     | 自定义 |
| ResourceLimit       | 资源限制     | 自定义 |
| KeyValueList        | 键值对列表   | 自定义 |
| ContainerList       | 容器列表     | 自定义 |
| MountVolumeList     | 挂载卷列表   | 自定义 |
| ConfigReferenceList | 配置引用列表 | 自定义 |

## 五、类型定义

### VisibleCondition 可见性条件

```typescript
interface VisibleCondition {
    fieldName: string | string[]; // 字段名，支持嵌套路径
    value?: unknown; // 期望值
    oneOf?: unknown[]; // 多值匹配
    and?: VisibleCondition[]; // AND 条件
}
```

### AI 元数据

```typescript
interface AiMeta {
    role?: string; // 元素角色：field / arrayField / objectField / fieldGroup
    param?: string; // 参数名
    entity?: string; // 实体描述
    desc?: string; // 详细描述
}
```

### 校验器

```typescript
// 静态规则
rules: [
    { required: true, message: '必填' },
    { max: 100, message: '最多100字符' },
];

// 动态校验器
validators: [
    { name: 'portRange', params: { min: 1, max: 65535 } },
];
```

## 六、使用示例

### 完整表单定义

```typescript
const startupSchema: TabSchema = {
    key: 'startup',
    label: '启动配置',
    fields: [
        {
            type: 'array',
            name: 'commandList',
            label: '启动配置列表',
            itemSchema: {
                type: 'object',
                fields: [
                    // 始终显示
                    {
                        type: 'field',
                        name: 'startCommand',
                        label: '启动命令',
                        component: 'Input',
                        required: true
                    },
                    // 展开后显示
                    {
                        type: 'field',
                        name: 'stopCommand',
                        label: '停止命令',
                        component: 'Input',
                        visible: { fieldName: 'expanded', value: true }
                    },
                    // 行布局
                    {
                        type: 'row',
                        fields: [
                            { type: 'field', name: 'killGroup', ... },
                            { type: 'field', name: 'keyModule', ... }
                        ],
                        visible: { fieldName: 'expanded', value: true }
                    },
                    // 条件显示
                    {
                        type: 'field',
                        name: 'probeURI',
                        label: 'URI',
                        component: 'Input',
                        visible: {
                            fieldName: 'expanded',
                            value: true,
                            and: [{ fieldName: 'enableProbe', value: true }]
                        }
                    }
                ]
            },
            sortable: true,
            confirmDelete: '确定删除吗？',
            expandedField: 'expanded'
        }
    ]
};
```

### 页面渲染

```typescript
const StartupConfig: React.FC = () => {
    const [form] = Form.useForm();

    return (
        <Form form={form} layout="vertical">
            {startupSchema.fields.map((node, index) => (
                <SchemaRenderer
                    key={index}
                    schema={node}
                    form={form}
                    validatorRegistry={validatorRegistry}
                />
            ))}
        </Form>
    );
};
```

## 七、扩展指南

### 添加新组件

1. 在 `types.ts` 的 `ComponentType` 中添加类型：

```typescript
export type ComponentType = ... | 'MyCustomComponent';
```

2. 在 `componentRegistry.tsx` 中注册：

```typescript
import { MyCustomComponent } from './components/MyCustomComponent';

export const componentRegistry = {
    ...,
    MyCustomComponent,
};
```

### 添加新校验器

1. 在 `validatorRegistry.ts` 中定义：

```typescript
export const baseValidatorRegistry: ValidatorRegistry = {
    myValidator: (params, form) => ({
        validator: (_, value) => {
            if (value && !/^[A-Z]+$/.test(value)) {
                return Promise.reject('必须为大写字母');
            }
            return Promise.resolve();
        },
    }),
};
```

2. 在 Schema 中使用：

```typescript
{
    type: 'field',
    name: 'code',
    validators: [{ name: 'myValidator' }]
}
```
