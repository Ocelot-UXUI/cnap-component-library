# Schema 驱动表单设计文档

> 适用范围：CNAP2.0 应用管理 - 运行配置（RuntimeConfig）
> 最后更新：2026-05-13

---

## 一、背景与目标

CNAP1.0 的运行配置是一个包含 11 个 Tab、数十个字段的大型表单，字段之间存在联动、分组、条件显隐等复杂关系。直接用 JSX 手写维护成本高，且难以附加 AI 上下文元数据。

CNAP2.0 采用 **Schema 驱动**方案：用 JSON 对象描述字段结构，由统一的渲染引擎负责渲染，实现"配置与渲染分离"。

---

## 二、整体架构

```
schemas/          ← 各 Tab 的字段描述（纯数据，无 JSX）
  container.schema.ts
  workload.schema.ts
  ...（共 11 个）

schema/
  types.ts        ← 所有类型定义
  componentRegistry.tsx  ← 组件名 → React 组件的映射表
  validatorRegistry.ts   ← 基础校验器注册表

SchemaField.tsx   ← 渲染单个字段（Form.Item + 组件）
SchemaGroup.tsx   ← 渲染字段分组容器（带标题栏）
index.tsx         ← 页面入口，组装 Tab + Form
```

---

## 三、核心类型

### 3.1 FieldSchema — 字段描述

```typescript
interface FieldSchema {
    name: string | string[]; // 字段名，支持嵌套路径
    label: string; // 展示标签
    component: ComponentType; // 使用哪个组件（见 3.4）
    componentProps?: Record<string, unknown>; // 透传给组件的 props
    options?: FieldOption[]; // Select/Radio/Checkbox 的选项
    initialValue?: unknown; // 默认值
    required?: boolean; // 是否必填（快捷方式）
    rules?: Rule[]; // antd 原生静态规则
    validators?: ValidatorRef[]; // 自定义校验器引用（见 3.3）
    visible?: VisibleCondition; // 可见性条件（见 3.5）
    dependencies?: string[]; // 跨字段重新校验触发器
    tooltip?: string; // 帮助文本
    placeholder?: string; // 占位符
    formItemProps?: Omit<
        FormItemProps, // 透传给 antd Form.Item 的原生 props
        'name' | 'rules' | 'initialValue' | 'dependencies' | 'valuePropName'
    >;
    aiMeta?: { // AI 上下文元数据
        role?: string;
        param?: string;
        desc?: string;
    };
}
```

### 3.2 GroupSchema — 字段分组

对应 CNAP1.0 的 `InheritFormFieldLayout + FieldSecondaryContainer` 组合，渲染为带蓝色标题栏的卡片容器。

```typescript
interface GroupSchema {
    type: 'group'; // 必须显式声明，用于类型判断
    title: string; // 分组标题
    tooltip?: string; // 标题旁的说明
    collapsible?: boolean; // 是否可折叠
    defaultCollapsed?: boolean; // 默认是否折叠
    visible?: VisibleCondition; // 整组的可见性条件
    fields: FieldSchema[]; // 组内字段（不支持嵌套 GroupSchema）
    aiMeta?: { role?: string; entity?: string; desc?: string; };
}
```

### 3.3 ValidatorRef — 校验器引用

```typescript
interface ValidatorRef {
    name: string; // 指向 validatorRegistry 中的 key
    params?: Record<string, unknown>; // 传给校验器工厂的参数
}

// 校验器工厂函数签名
type ValidatorFactory = (
    params: Record<string, unknown>,
    form: FormInstance, // 可通过 form.getFieldValue() 实现跨字段校验
) => Rule;
```

### 3.4 ComponentType — 支持的组件

| 值              | 对应组件            | 适用场景                                   |
| --------------- | ------------------- | ------------------------------------------ |
| `Input`         | antd Input          | 单行文本                                   |
| `InputNumber`   | antd InputNumber    | 数字输入                                   |
| `Select`        | antd Select         | 下拉选择                                   |
| `Switch`        | antd Switch         | 开关（自动处理 `valuePropName="checked"`） |
| `Slider`        | antd Slider         | 滑块                                       |
| `Radio`         | antd Radio.Group    | 单选组                                     |
| `Checkbox`      | antd Checkbox.Group | 多选组                                     |
| `TextArea`      | antd Input.TextArea | 多行文本                                   |
| `PortList`      | 自定义              | 端口列表（表格编辑）                       |
| `EnvList`       | 自定义              | 环境变量列表                               |
| `ProbeConfig`   | 自定义              | 探针配置（HTTP/TCP/Exec）                  |
| `ResourceLimit` | 自定义              | CPU/内存 Request/Limit                     |
| `KeyValueList`  | 自定义              | 键值对列表                                 |

### 3.5 VisibleCondition — 可见性条件

```typescript
interface VisibleCondition {
    fieldName: string; // 监听哪个字段
    value?: unknown; // 精确匹配
    oneOf?: unknown[]; // 多值匹配（满足其一即可见）
    and?: VisibleCondition[]; // AND 复合条件（所有子条件都满足才可见）
}
```

示例：

```typescript
// 简单：enableLivenessProbe 为 true 时显示
visible: { fieldName: 'enableLivenessProbe', value: true }

// 多值：workloadType 为 Deployment 或 StatefulSet 时显示
visible: { fieldName: 'workloadType', oneOf: ['Deployment', 'StatefulSet'] }

// AND 复合：updateStrategy 为 RollingUpdate 且 workloadType 不是 DaemonSet
visible: {
    fieldName: 'updateStrategy',
    value: 'RollingUpdate',
    and: [{ fieldName: 'workloadType', oneOf: ['Deployment', 'StatefulSet'] }]
}
```

---

## 四、渲染流程

```
index.tsx
  └── TABS: TabSchema[]
        └── tab.fields: TabNode[]
              ├── isGroupSchema(node) → <SchemaGroup>
              │     └── group.fields → <SchemaField> × n
              └── else → <SchemaField>
                    ├── componentRegistry[schema.component] → 解析组件
                    ├── validatorRegistry[ref.name](params, form) → 编译 rules
                    ├── visible 条件 → Form.Item noStyle + dependencies 包裹
                    └── formItemProps → 透传给 antd Form.Item
```

---

## 五、校验器体系

### 5.1 基础校验器（baseValidatorRegistry）

全局可用，无需额外注册：

| key               | 说明                                     |
| ----------------- | ---------------------------------------- |
| `required`        | 必填                                     |
| `positiveInteger` | 正整数                                   |
| `portRange`       | 端口范围 1-65535                         |
| `dnsLabel`        | DNS 标签格式（小写字母/数字/连字符）     |
| `envVarName`      | 环境变量名格式                           |
| `cpuFormat`       | CPU 格式（如 `500m`、`2`）               |
| `memoryFormat`    | 内存格式（如 `512Mi`、`2Gi`）            |
| `absolutePath`    | 绝对路径格式                             |
| `pattern`         | 自定义正则（params: `{regex, message}`） |
| `maxLength`       | 最大长度（params: `{max}`）              |
| `min` / `max`     | 数值范围（params: `{min}` / `{max}`）    |

### 5.2 模块级校验器

各 Tab 模块可定义私有校验器，在 `index.tsx` 通过 `mergeValidators()` 合并：

```typescript
// 示例：container.validators.ts
export const containerValidators: ValidatorRegistry = {
    portsValid: (_params, form) => ({
        validator: async () => {
            const ports = form.getFieldValue('ports');
            // 跨字段校验逻辑...
        },
    }),
};
```

### 5.3 跨字段校验

通过 `ValidatorFactory` 的第二个参数 `form` 实现：

```typescript
resourcesValid: ((_params, form) => ({
    validator: async () => {
        const resources = form.getFieldValue('resources');
        if (resources?.cpuRequest > resources?.cpuLimit) {
            throw new Error('CPU Request 不能大于 Limit');
        }
    },
}));
```

---

## 六、Form.Item 原生 Props 透传

`formItemProps` 字段允许透传任意 antd `Form.Item` 原生属性，优先级高于 schema 默认值：

```typescript
{
    name: 'someField',
    label: '某字段',
    component: 'Input',
    formItemProps: {
        noStyle: true,          // 去掉 label 和边框
        colon: false,           // 不显示冒号
        labelCol: { span: 8 },  // 自定义 label 宽度
        extra: '最多 64 个字符', // 字段下方说明文字
    }
}
```

以下属性被 `Omit` 排除，只能通过 schema 自身字段控制，不允许通过 `formItemProps` 覆盖：
`name`、`rules`、`initialValue`、`dependencies`、`valuePropName`

---

## 七、11 个 Tab 覆盖范围

| Tab key           | 标签       | 主要字段                                                 |
| ----------------- | ---------- | -------------------------------------------------------- |
| `container`       | 实例配置   | 镜像、资源限制、端口、环境变量、三种探针                 |
| `scheduled-task`  | 定时任务   | Cron 表达式（5字段）、并发策略、历史保留数               |
| `ingress`         | 服务访问   | Ingress 开关、域名、路径、TLS、NodePort                  |
| `log`             | 监控日志   | 日志类型（EFK/BLS）、日志路径、监控（Noah/cProm）        |
| `workload`        | 变更与调度 | 副本数、更新策略、Job/CronJob 配置、节点调度、Pod 反亲和 |
| `annotation`      | Annotation | Pod/Service Annotation 键值对                            |
| `pod-label`       | Label      | Pod Label 键值对                                         |
| `secret`          | Secret     | Secret 引用、镜像拉取 Secret                             |
| `ai-data-reflow`  | AI数据回流 | 飞轮开关、CPU/内存、采样率、存储路径                     |
| `fpm-config`      | FPM配置    | 故障迁移开关、类型、超时、迁移周期、安全模式阈值         |
| `advanced-config` | 高级配置   | 优雅停机、Debug 模式、节点架构、拓扑分布                 |

---

## 八、方案边界与局限

**适合用 Schema 描述的场景：**

- 字段结构均匀，交互简单（输入、选择、开关）
- 需要统一附加 AI 元数据（`data-ai-*`）
- 字段可见性依赖简单的值比较（`value` / `oneOf` / `and`）

**不适合用 Schema 描述的场景：**

- 字段之间有复杂联动（切换某字段后整块结构替换）
- 单个字段内部有复杂交互逻辑

**推荐的混合策略：**

- 80% 的普通字段：Schema 驱动（`FieldSchema`）
- 20% 的复杂字段：封装为自定义组件，注册到 `componentRegistry`，Schema 只负责挂载

`ProbeConfig`、`ResourceLimit`、`PortList`、`EnvList` 已经是这种模式——它们内部是完整的 React 组件，Schema 只是把它们"挂载"进来。

---

## 九、扩展指南

### 新增一个 Tab

1. 在 `schemas/` 下新建 `xxx.schema.ts`，导出 `xxxSchema: TabSchema`
2. 如有自定义校验器，导出 `xxxValidators: ValidatorRegistry`
3. 在 `index.tsx` 中 import 并加入 `TABS` 数组和 `mergeValidators()` 调用

### 新增一个组件类型

1. 在 `schema/types.ts` 的 `ComponentType` 联合类型中添加新值
2. 在 `schema/componentRegistry.tsx` 中注册映射

### 新增一个基础校验器

在 `schema/validatorRegistry.ts` 的 `baseValidatorRegistry` 中添加新的 `ValidatorFactory`。
