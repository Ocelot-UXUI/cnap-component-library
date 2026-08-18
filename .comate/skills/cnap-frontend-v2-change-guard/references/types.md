# TypeScript 类型

**真源**：`docs/context/conventions.md`（Code Style）。

- 函数组件一律带**显式 Props interface**。
- **不用 `any`**：第三方逼你用时，收窄为 `unknown` + 类型守卫，或 import 真实类型。
- antd 类型也走 `@/design` 的类型出口（如 `import {type SelectProps} from '@/design'`），不直接从 `antd` import 类型。
- 类型就近原则：只在一个文件用就 inline；跨文件复用再抽到合适的 `types` 位置。出现第二个消费方时再提升。
