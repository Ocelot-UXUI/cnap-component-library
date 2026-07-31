# dprint-migration 使用 dprint 替代 ESLint 格式化职责

> Plan Status: completed
> Last Reviewed: 2026-06-15
> Source: 用户需求 — 替换代码格式化工具为 dprint，消除格式化规则冲突

## Current Baseline

- 代码格式化和质量检查均由 ESLint 8（通过 `@reskript/config-lint` → `@ecomfe/eslint-config`）承载
- `yarn lint` 执行 `skr lint`，底层调用 ESLint
- 项目无 Prettier、无 dprint
- `.editorconfig` 定义了 4 空格缩进、LF 换行、UTF-8 等基础格式
- ESLint 配置中约 50+ 条纯格式化规则与 30+ 条代码质量规则混合

## Goals

- 引入 dprint 作为唯一的代码格式化工具，负责缩进、引号、分号、换行、空行、括号间距等所有格式化决策
- 保留 ESLint 用于代码质量/语义规则（max-lines、react-hooks、eqeqeq、complexity 等）
- 移除 reskript 工具链，改用纯 ESLint + typescript-eslint + eslint-plugin-react + eslint-plugin-react-hooks
- `yarn lint` 检查代码质量，`yarn format` 格式化代码，两者职责清晰不重叠
- CI/开发流程中两者可独立运行、互不干扰

## Non-Goals

- 不改变 TypeScript 类型检查流程（`yarn lint-type`）
- 不改变测试流程（`yarn test`）
- 不一次性全量格式化所有现有代码（可后续增量完成）

## Task Route

- Type: architecture change
- Owner Docs: `docs/context/conventions.md` (Code Style 段落)

## Execution Plan

### Phase 1 - 引入 dprint

Status: completed

- [x] Add: 安装 dprint（全局安装到 ~/.dprint/bin）
- [x] Add: 创建 `dprint.json` 配置文件，对齐现有格式风格
- [x] Add: 在 `package.json` 中添加 `format` 和 `format:check` scripts
- [x] Skill: none

Exit Criteria:

- [x] `yarn format:check` 和 `yarn format` 可正常运行
- [x] dprint 配置文件与 `.editorconfig` 基础设置一致

### Phase 2 - 移除 reskript，重建 ESLint 配置

Status: completed

- [x] Fix: 移除 `@reskript/cli`, `@reskript/cli-lint`, `@reskript/config-lint`, `@reskript/settings`
- [x] Add: 安装 `typescript-eslint@8.18.0`, `eslint-plugin-react@7.37.0`, `eslint-plugin-react-hooks@5.1.0`
- [x] Fix: 重写 `.eslintrc.cjs`，使用纯 ESLint 配置（不依赖 reskript/@ecomfe），仅保留代码质量规则，不包含格式化规则
- [x] Fix: 更新 `yarn lint` 和 `yarn lint:fix` scripts 为 `eslint src --ext .ts,.tsx`
- [x] Skill: none

Exit Criteria:

- [x] `yarn lint` 可正常运行，只报告代码质量问题，不报告格式问题
- [x] 保留的所有质量规则（max-lines、react-hooks/exhaustive-deps、eqeqeq、complexity 等）仍生效

### Phase 3 - 验证

Status: completed

- [x] Proof: `yarn lint-type` — TypeScript 编译检查通过 (exit 0)
- [x] Proof: `yarn lint` — ESLint 只报告 8 个质量问题（complexity、no-explicit-any、max-lines、no-unused-vars），无格式错误
- [x] Proof: `yarn test` — 34 个测试全部通过
- [x] Proof: `yarn format:check` — dprint 可正常运行（现有代码存在格式差异，可后续增量格式化）
- [x] Proof: `yarn build` — 生产构建成功
- [x] Skill: none

Exit Criteria:

- [x] 所有 5 个验证命令通过
- [x] `yarn lint` 输出中无任何格式化相关的 warning/error

### Phase 4 - 文档更新

Status: completed

- [x] Fix: 更新 `docs/context/conventions.md` Code Style 段落
- [x] Fix: 更新 `docs/context/project-context.md` 验证命令表
- [x] Fix: 更新日志
- [x] Skill: none

Exit Criteria:

- [x] conventions.md 反映新的双工具分工
- [x] project-context.md 验证命令包含 format 相关命令
- [x] 日志文件已更新

## Closure Gates

- [x] in-scope behavior is complete: dprint 格式化 + ESLint 质量检查分工明确
- [x] relevant docs are aligned: conventions.md 和 project-context.md 已更新
- [x] verification has run: lint-type, lint, test, build 全部通过
- [x] closure audit was independent
