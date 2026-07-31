# 代码风格规范

## 基本原则

1. **ESLint 规则**: 风格相关的规则本身并没有对错，但为了团队代码一致性，请遵循项目配置的规则。

2. **文件行数限制**: 单个文件不超过 140 行，鼓励拆分代码以保持可维护性。如果某个文件不适合拆分，请在禁用规则的同时添加注释说明原因。

3. **组件目录结构**:
   - `src/pages/` - 页面级组件
   - `src/design/` - 通用设计组件（布局、错误处理等）
   - `src/components/` - 可复用的业务组件（如需要）

## 技术栈规范

### UI 组件库

- 使用 `antd` 6.x 作为主要 UI 组件库
- 使用 antd class 覆盖样式时，前缀为 `.ant-5`

### 样式方案

- 优先使用 `@emotion/react`、`@emotion/css`、`@emotion/styled`
- 避免使用内联样式
- 颜色变量从 `src/constants/colors/` 引入

### 日期处理

- 统一使用 `dayjs` 处理日期
- 格式化使用 `YYYY-MM-DD HH:mm:ss` 格式

### 路由

- 使用 React Router 7
- 页面组件使用 `React.lazy` 进行懒加载

## 导入顺序

```typescript
// 1. React 相关
import {useEffect, useState} from 'react';

// 2. 第三方库
import {Button} from 'antd';
import dayjs from 'dayjs';

// 3. 项目内部模块（使用 @ 别名）
import {formatDate} from '@/utils/date';

// 4. 相对路径导入
import {SomeComponent} from './SomeComponent';

// 5. 类型导入
import type {SomeType} from './types';
```

## 命令

```shell
yarn lint        # ESLint 代码检查
yarn lint-type   # TypeScript 类型检查
yarn test        # 运行测试
```
