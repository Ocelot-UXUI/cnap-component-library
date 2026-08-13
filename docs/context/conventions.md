# Project Conventions

## Purpose

Project-wide rules AI agents apply by default.

## File-In / File-Out

- Important inputs should be written to files before implementation.
- Important outputs should be written back to the repo, not left only in chat.

## Design Split

- App-layer behavior design belongs in `docs/design/`.
- Technical architecture design belongs in `docs/architecture/`.
- Cross-reference instead of duplicating the same rule in multiple docs.

## Code Style

### Formatting (dprint)

dprint 是项目唯一的代码格式化工具，负责缩进、引号、分号、换行、括号间距、尾逗号等所有格式化决策。配置文件 `dprint.json`。

关键规则：

- 行宽 120，4 空格缩进，LF 换行
- TypeScript 单引号，JSX 双引号
- 始终使用分号
- 尾逗号仅在多行时保留

命令：`yarn format`（格式化）、`yarn format:check`（检查不修改）。

### Linting (ESLint)

ESLint 负责代码质量检查（max-lines、react-hooks、eqeqeq、complexity 等），配置文件 `.eslintrc.cjs`。

**强制约束：ESLint 不得包含任何格式化规则。** 不要在 `.eslintrc.cjs` 中添加 `indent`、`quotes`、`semi`、`comma-spacing` 等格式化规则，也不要 extend `@typescript-eslint/stylistic` 等含格式化规则的 shared config。格式化由 dprint 独占，引入重复的格式化规则会导致两个工具冲突。

命令：`yarn lint`（检查）、`yarn lint:fix`（自动修复质量问题）。

### Git Hook 集成

- Husky 通过 `package.json` 中的 `"prepare": "husky"` 脚本自动安装。新用户执行 `yarn install` 后，`core.hooksPath` 自动设置为 `.husky/_`，无需手动配置。
- `.husky/pre-commit` 通过 `lint-staged` 对暂存文件执行 `dprint fmt`，格式化后的改动自动重新暂存到本次提交。
- pre-commit 当前不执行 `yarn lint`；ESLint 检查需在提交前手动运行或由 CI 承担。
- CI 应执行 `yarn format:check` 作为兜底，防止有人用 `git commit --no-verify` 跳过 hook 提交未格式化代码。

### 历史背景

项目曾使用 `@reskript/cli` 统一承载格式化和质量检查。迁移至 dprint + ESLint 双工具分工的完整记录见 `docs/plans/dprint-migration.md`。

### 其他代码约定

- React components: functional components with explicit Props interfaces.
- Styles: Emotion (CSS-in-JS), no inline styles unless necessary.
- UI components: Ant Design 6.x（class override prefix `.ant-5`），但**只能经 `@/design` 引入**，禁止业务代码直接 import `antd`（详见 Base Component Imports）。
- Simple flex layouts: 纯 flex 对齐 / 排列直接用 antd `Flex`（经 `@/design` 引入，如 `<Flex justify="flex-end">`）。**不要仅为使用 flex 布局而在 style 文件中新建 styled 布局容器**；仅当容器承载真实业务样式（颜色、圆角、间距、字体等组合，或需要响应式断点）时才用 `@emotion/styled` 定义。
- Imports order: React → third-party → `@/` aliases → relative → type imports.
- File size: max ~150 lines per file; split when exceeding.
- Forms: use Ant Design Form component.

### Clipboard / 复制到剪贴板

- 所有"复制到剪贴板"能力**必须**调用 `@/utils/clipboard` 的 `copyText(text, options?)`，**禁止**在业务代码里直接使用 `navigator.clipboard.writeText` 或 `document.execCommand('copy')`。
- 理由：借鉴 antd `Typography` 的做法，统一委托 `copy-to-clipboard`（antd 本身也依赖它）。当前安装 v4：优先走 `navigator.clipboard`，失败自动回退 `execCommand`，比裸用 `navigator.clipboard` 在 HTTP / iframe / 旧浏览器 / 内网下更稳。
- `copyText` **返回 `Promise<boolean>`**（v4 的 `copy()` 是异步的）；调用方必须 `await` 结果再决定成功/失败反馈，不能用 `if (copyText(...))` 直接判断（Promise 恒为真值）。`copyText` 只做复制、不含 UI 副作用，反馈由调用方用 antd `message` 给出。
- 需要复制富文本时传 `{ format: 'text/html' }`。

## Component Boundaries

- Layout responsibility can be nested: if a component positions, sizes, arranges, or allocates space for its children, it is a layout component even when it is inside another layout.
- Components that own layout responsibility must use a `Layout` suffix; avoid `Shell` for layout components.
- Business state, persistence, and interaction rules should live in containers, hooks, or pure functions instead of layout components.

## Base Component Imports (@/design 强制)

项目所有基础组件、antd 工具与 antd 类型统一从 `@/design` 引入，收敛在设计系统一个出口。

- **禁止**在 `src/design/` 以外的任何代码里直接 `import ... from 'antd'` 或 `antd/*` 子路径（含类型）。
- **`src/design/` 只承载 antd 组件及其增强**，不允许出现带业务含义的组件：
  - 对 antd 原组件的透传放在同名目录（如 `Button/`、`Input/`、`Table/`），仅 `export {X} from 'antd'`。
  - 对 antd 组件的增强 / 封装放在各自目录（如 `Drawer/`、`Select/`），以某个 antd 组件为基座扩展，自带实现与私有样式。
  - 统一出口 `src/design/index.ts` 聚合全部组件、工具（`message` / `notification` / `theme`）与类型。
- **带业务含义的基础组件**（页面布局壳、错误兜底、加载屏、业务搜索框等，非单一 antd 组件的封装）一律放 `src/components/<Name>/`，经 `@/components/<Name>` 引用；其内部可消费 `@/design` 的 antd 组件。
- 业务代码一律 `import {Button, Table, type SelectProps} from '@/design'`。
- 新增需要用到的 antd 组件时：先在 `src/design/<Name>/index.ts` 建透传目录并在 `src/design/index.ts` 补出口，再在业务侧引用；不要绕过设计系统直接引 antd。

### 豁免范围（允许直接依赖 antd）

- `src/design/**` — 设计系统实现与再导出层。
- `src/constants/**` — 主题 token / preset 派生（`theme` 工具、`ThemeConfig`）。
- 应用根 `ConfigProvider` / 主题装配：`src/index.tsx`、`src/routers/AppLayout/index.tsx`、`src/contexts/ThemeContext.tsx`。

### 强制手段

`.eslintrc.cjs` 通过 `no-restricted-imports` 对 `antd` 与 `antd/*` 报错，并对上述豁免路径 `off`。违规在 `yarn lint` 阶段拦截。

## 增强组件契约（Drawer / Select）

`src/design/` 下少数组件不是透传，而是对 antd 的增强封装。它们与 antd 同名但行为有约定，使用时按下面契约走，不要绕开去直接拼 antd 原组件。

### Drawer（`@/design` 的 `Drawer`）

- 标准头部布局固定为：**标题居左、关闭按钮居右、关闭按钮左侧是 `extra` 额外操作插槽**。
- 已屏蔽 antd 原生关闭按钮（类型上 `Omit` 掉了 `closable` / `closeIcon`），**不要再自己塞关闭按钮或传 `closeIcon`**；关闭态统一由 header 右侧承载。
- 关闭回调走 `onClose`；关闭按钮的显隐由 `showClose` 控制（默认 `true`），无需关闭按钮时传 `showClose={false}`。
- 头部额外操作（如「保存」「更多」）放 `extra`，会渲染在关闭按钮左侧。

### Select（`@/design` 的 `Select`）

- 是 antd Select 的 drop-in 替代，类型完全对齐（保留泛型签名与 `Option` / `OptGroup` 静态成员），单选场景（不传 `mode`，或 `mode` 非 `multiple` / `tags`）行为与 antd 原生**完全一致**。
- **多选统一用 `mode="multiple"`（或 `tags`）驱动**：此时下拉项自动前置 Checkbox 呈现多选态，并移除 antd 默认右侧对勾。**不要再造独立的 MultiSelect 组件**（旧 MultiSelect 已收敛进本组件）。
- 主题色 / token 由 `ConfigProvider` 统一注入，组件内不做二次覆盖——不要为选中态/边框单独传色值（遵循 `docs/design/design-tokens.md` 的污染防护约束）。

### Empty（`@/design` 的 `Empty`）

- `Empty` 是 antd Empty 的 drop-in 增强组件，保留 `PRESENTED_IMAGE_DEFAULT` / `PRESENTED_IMAGE_SIMPLE` 静态成员；除 `classNames`（见下）外的原生参数全部透传，`imageType` / `size` 不会传给 antd 或根 DOM。
- `imageType` 可选值为 `empty-table`、`empty`、`no-auth`、`no-data`、`no-target`，分别使用 `src/assets/images/` 下的同名 PNG 插图。
- `size` 可选值为 `s` / `m` / `l`，默认 `m`，对应插图尺寸 125×110 / 175×154 / 248×218；只有传入有效 `imageType` 时生效。
- 命中 `imageType` 时：插图尺寸由 `size` 固定，`imageStyle` / `styles.image` 的尺寸类覆盖不生效（其余样式照常透传）；root 应用纵向居中 flex 布局，图-文间距 S 4px / M·L 12px；`classNames` 仅 `root` 生效，`image` / `description` / `footer` 不生效。
- 未传或运行时传入无效 `imageType` 时，`Empty` 完整回退 antd 原生 `image` 行为，`size` 不生效；该分支下 `classNames` 不传给 antd。

新增其它增强组件（对 antd 组件做行为封装）时，沿用同样模式：与 antd 同名、drop-in、契约写进本节，出口补到 `src/design/index.ts`。

## API And Data Source Boundaries

- If data should be obtained through an API, consumers must call the corresponding API function instead of importing local data or deriving data-source behavior locally.
- Product runtime data written directly in code is static data, not static mock data.
- API modules may temporarily serve static data while preserving the same consumer-facing contract that server-backed data will use later.
- Consumers should not know whether API-returned data came from static data or a server response.
- UI modules may adapt API DTOs into render-ready view models, but must not decide API-owned semantics such as favorites, recent items, permissions, availability, or backend classifications.

## State Management: XState vs constate

Two state tools coexist, split by whether the state must be observable/controllable **outside** the React tree.

### XState — externally observable / persistent authority

- XState (module-level actors) is the authority for state that must be readable or drivable from outside the React tree — navigation context, and anything exposed to AI capabilities or the qiankun host — plus persistent state, cross-cutting cascade rules, and localStorage-backed lifecycle.
- For this class of state, all data lifecycle (initialization, async loading, cascade, persistence) lives inside the machine. React components are thin consumers: read via `useSelector`, dispatch via `actorRef.send`; they must not fetch, manage loading, or write localStorage directly.
- When an actor needs to be accessible outside the React tree, create it at module level via `createActor().start()` and pass the ref through React Context.

### constate — view-local shared state

- constate is for shared state that is only consumed **inside** React (never read or driven from outside the React tree). Co-locating ephemeral data fetching and loading state inside a constate hook is allowed for this class of state.
- Default to constate for page-scoped shared UI state; promote to XState only when the state must gain external/AI observability.
- A constate store that later needs external exposure should be refactored into an XState actor rather than bridged out of React.

## Review Rule

- High-risk changes require independent review (human review when possible).
- Every non-trivial bug fix should add or update automated test coverage.

## Bug Rule

- Every non-trivial bug fix should add or update automated test coverage.
- If automated coverage is impossible, record the reason and manual proof.

## Comment Policy

- Prefer no comments by default.
- Add comments only when a local constraint is easy to misread.

## Verification Rule

- Keep verification commands current in `docs/context/project-context.md`.
- Run `yarn lint-type` and `yarn test` before marking work complete.
- Run `yarn lint` for code quality checks.
- Run `yarn format:check` for code formatting checks.
