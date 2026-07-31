# Comate Stack Frontend Template

一个基于 React 19 + Vite 6 + Ant Design 6 + TypeScript 的前端脚手架模板。

## 技术栈

- **框架**: React 19
- **构建工具**: Vite 6
- **UI 组件库**: Ant Design 6
- **样式方案**: Emotion (CSS-in-JS)
- **路由**: React Router 7
- **HTTP 请求**: Axios
- **日期处理**: Day.js
- **代码规范**: dprint (格式化) + ESLint (代码质量) + TypeScript

## 快速开始

### 环境要求

- Node.js >= 18
- Yarn 1.x 或更高版本

### 安装依赖

```shell
yarn install
```

> `yarn install` 会自动执行 `prepare` 脚本（`husky`），配置 Git pre-commit hook。
> 此后每次 `git commit` 会通过 `lint-staged` + `dprint` 自动格式化暂存文件并重新暂存。
> 无需手动安装或配置 husky。

### 开发模式

```shell
yarn start
```

访问 http://localhost:3000

### 构建生产版本

```shell
yarn build
```

### 运行测试

```shell
yarn test
```

### 代码检查

```shell
yarn lint          # ESLint 代码质量检查
yarn lint-type     # TypeScript 类型检查
yarn format        # dprint 格式化全部代码
yarn format:check  # dprint 检查格式（不修改文件）
```

## 项目结构

```
src/
├── constants/        # 常量定义（颜色、设计 token 等）
├── design/           # 通用设计组件（布局、错误处理、加载状态等）
├── pages/            # 页面组件
│   ├── Home/         # 首页示例
│   ├── About/        # 关于页示例
│   └── Example/      # 功能示例页
├── routers/          # 路由配置
├── styles/           # 全局样式
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数
└── index.tsx         # 应用入口
```

## 主要依赖版本

| 依赖              | 版本     |
| ----------------- | -------- |
| React             | ^19.0.0  |
| React Router DOM  | ^7.1.3   |
| Ant Design        | ^6.0.0   |
| @ant-design/icons | ^6.0.0   |
| Vite              | ^6.0.7   |
| TypeScript        | ^5.7.3   |
| Day.js            | ^1.11.13 |
| Axios             | ^1.7.9   |

## 开发规范

- [代码风格](./docs/Code.md)

## License

MIT
