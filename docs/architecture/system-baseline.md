# System Baseline

## Purpose

定义 CNAP 前端的当前支持技术基线。

## Technology Stack

| Layer           | Technology                                    |
| --------------- | --------------------------------------------- |
| Framework       | React 19                                      |
| Build Tool      | Vite 6                                        |
| Language        | TypeScript 5.7                                |
| UI Library      | Ant Design 6.3                                |
| AI Chat         | @ant-design/x 2.5                             |
| CSS-in-JS       | @emotion/react, @emotion/css, @emotion/styled |
| Routing         | React Router 7                                |
| HTTP Client     | Axios 1.7                                     |
| Animation       | Framer Motion 12                              |
| 3D Effects      | Three.js 0.184                                |
| Date Handling   | Day.js 1.11                                   |
| Package Manager | Yarn 4.13                                     |
| Node Version    | 22.12 (via Volta)                             |

## Dev Tools

| Tool                | Purpose                                |
| ------------------- | -------------------------------------- |
| dprint              | 代码格式化 (dprint fmt / dprint check) |
| ESLint 8            | 代码质量检查 (eslint src)              |
| Vitest              | 单元测试 (vitest run)                  |
| Husky               | Git hooks 管理                         |
| jsdom               | 测试 DOM 环境                          |
| vite-plugin-qiankun | 微前端集成                             |

## Runtime Configuration

- **Basename**: `/devops/cnap`
- **API Base**: 通过 Axios base instance 配置
- **AI Context**: `/ai-context.json` (由 `yarn gen:ai-context` 生成)
- **Mock Mode**: AI 对话在开发环境默认使用 mock 模式 (`USE_MOCK = true`)

## Build And Deploy

- `yarn build` - 生产构建 (先运行 `gen:ai-context`)
- `yarn start` - 开发服务器 (Vite dev server)
- `yarn preview` - 预览生产构建

## Verification Baseline

| Command             | Purpose             |
| ------------------- | ------------------- |
| `yarn lint-type`    | TypeScript 类型检查 |
| `yarn test`         | 单元测试            |
| `yarn lint`         | ESLint 代码质量检查 |
| `yarn format:check` | dprint 格式化检查   |
| `yarn build`        | 生产构建验证        |
