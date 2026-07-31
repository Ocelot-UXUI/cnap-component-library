# Module Boundaries

## Purpose

定义 CNAP 前端的模块边界和依赖规则。

## Module Map

```
src/
├── api/           # API 层 - HTTP 请求与响应类型
│   ├── ai/        # AI 对话和工具定义 API
│   └── base.ts    # Axios 实例、拦截器
├── assets/        # 静态资源 (SVG, images)
├── auth/          # 认证层 - UUAP 登录与会话管理
├── capabilities/  # 能力层 - AI 可调用的业务操作
├── components/    # 可复用 UI 组件
├── constants/     # 常量定义 (颜色、主题、设计 token)
├── contexts/      # React Context Providers
├── design/        # 设计系统组件 (Layout, Error, Loading, Motion)
├── domain/        # 领域层 - 纯业务模型/值对象/适配器 (无 React；DTO↔Domain 转换)
├── executor/      # AI 执行器 - Agent 循环和步骤执行引擎
├── hooks/         # 自定义 React Hooks
├── interface/     # 接口层 DTO 实体类型 (entities/，贴近后端接口)
├── pages/         # 页面组件 (每个页面一个目录)
├── routers/       # 路由定义和页面级布局组件
├── styles/        # 全局样式
├── types/         # TypeScript 类型定义
└── utils/         # 工具函数 (color, date, i18n, semantic)
```

## Dependency Rules

### Allowed Dependencies (从上到下分层)

```
routers/
  → pages/, design/Layouts/, contexts/

pages/
  → components/, hooks/, contexts/, api/, capabilities/, domain/, utils/

components/
  → constants/, types/, utils/  (不应直接引用 contexts 或 pages)

executor/
  → capabilities/, hooks/usePageContext, api/ai/

capabilities/
  → types/, utils/  (不应直接引用 React 组件)

domain/
  → interface/entities/ (DTO 类型), types/, utils/  (纯逻辑层：不依赖 React / 组件 / api / contexts / pages)

contexts/
  → hooks/, utils/, api/

api/
  → auth/  (仅 base.ts 引用 login.ts)
  → types/

utils/
  → (仅底层库，不应引用业务模块)
```

### Forbidden Dependencies

- `src/components/` 不可导入 `src/pages/`
- `src/utils/` 不可导入任何业务模块 (api, contexts, pages, components)
- `src/capabilities/` 不可导入 React 组件或 pages
- `src/domain/` 不可导入 React、组件 (components/pages)、api、contexts（保持纯逻辑，仅依赖 interface/entities、types、utils）
- `src/types/` 不可导入任何含运行时代码的模块

## Page-Level Layout Boundary

- 如果一个组件在语义上可以表明自己明确占据页面的哪一部分，则该组件所处空间的布局信息必须外置为 `*Layout` 组件。
- 页面级 `*Layout` 组件负责页面区域占位、尺寸、定位、滚动容器、跨区域关系、动画容器和 portal/frame 容器。
- 业务组件负责填充父级 Layout 提供的空间、业务数据渲染、交互命令和组件内部局部排版。
- 业务组件可以拥有内部 `flex`、`gap`、局部 padding 等排版；不能拥有页面级 `fixed/sticky`、workspace/header/sidebar 尺寸、主滚动容器或跨区域 margin 关系。
- 组件私有样式可以与组件共置：如果使用独立样式文件，文件必须命名为 `ComponentA.style.ts`，并位于以组件名命名的 `ComponentA/` 目录下。调用方只能 import 组件公共入口，不得 import 组件内部 style 文件。
- Layout 组件优先使用 `@emotion/styled` 定义布局容器；仅在第三方 className 接入、状态 class 组合、已有 API 约束或很小的局部样式场景使用 `css`。
- 跨组件复用的尺寸、颜色、token 继续放在 `src/constants/` 或设计系统模块中。

## Key Modules

### AI 执行器 (executor/)

**职责**: 将 LLM tool_calls 转换为可执行的页面操作步骤。

**核心组件**:

- `agentLoop.ts` - Agent 循环 (最多 5 轮)，SSE 流式响应处理
- `AIExecutorProvider.tsx` - 步骤执行引擎，支持 navigate/input/action/wait 四种类型
- `useAIExecutor.ts` - 执行器 Hook
- `index.ts` - 公共 API 导出

### 能力层 (capabilities/)

**职责**: 定义 AI 可调用的业务操作函数，是 AI 与页面交互的桥梁。

**核心组件**:

- `application.ts` - 应用 CRUD 能力
- `cluster.ts` - 集群管理能力
- `environment.ts` - 环境管理能力
- `navigation.ts` - 页面导航能力
- `index.ts` - 能力注册与调度
- `utils.ts` - 异步轮询和 DOM 等待工具

### Semantic Locator 系统

**职责**: 让 AI 能通过 DOM 属性 (data-ai-*) 理解和操作页面元素。

**类型定义**:

- `types/semantic-entities.ts` - 业务实体类型
- `types/semantic-actions.ts` - 业务动作类型
- `types/semantic.ts` - AISemanticProps 接口

**工具函数**:

- `utils/semantic.ts` - `aiProps()` 生成 data-ai-* 属性
