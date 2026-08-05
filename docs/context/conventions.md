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
- UI components: Ant Design 6.x, class override prefix `.ant-5`.
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
