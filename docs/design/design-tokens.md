# CNAP 2.0 Design Tokens 使用规范

> **本文档是所有 UI 代码（包括 AI Agent 生成的代码）必须遵守的强制规范。**
> 违反本文档规则的代码将无法通过 CR。

## 1. 目标与背景

CNAP 2.0 采用绿色系品牌色（`#41D08D`），但 Figma 视觉规范明确要求：
边框、下拉背景、输入框 focus 环等**中性交互面不得使用品牌绿**。

antd 默认会把大量组件（Input hover 边框、Select 选中项、Menu hover、Tabs
inkBar 等）从 `colorPrimary` 派生，一旦品牌色变绿就会全站泛绿。为此我们通过
`controlItemBgHover` / `controlOutline` / 组件级 `hoverBorderColor` 等 alias
token 显式钉死中性色，形成"品牌绿只出现在明确强调的地方"的约束。

真源：`src/constants/themes/presets.ts` 中的 `cnap2` preset。

## 2. Token 目录结构

```text
src/constants/
├── colors/
│   ├── base.ts          @deprecated — 旧代码兼容层，禁止新引用
│   ├── palette.ts       原子色板（gray/primary/brand/navigation/success/warning/error 各 10 阶）
│   ├── semantic.ts      语义 token（bg/border/text/icon/button/state）
│   ├── navigation.ts    侧边导航专用 token（sidebar.level1/level2）
│   ├── token.ts         antd 主题派生 token（getDesignToken）
│   └── index.ts         聚合导出入口，通过 `@/constants/colors` 引用
├── radius.ts            圆角 sm/md/lg/xl/xl2/xl3/xl4
├── spacing.ts           间距 xs2/xs/s/m/l/xl/xl2..xl9
├── shadow.ts            阴影 xs/s/m/l
├── typography.ts        字体 heading/body/caption/code
└── themes/presets.ts    antd ConfigProvider.theme 配置（含 cnap2 preset）
```

## 3. 引用规则（强制）

### 3.1 引用优先级

```text
antd ConfigProvider theme  >  semantic / sidebar  >  palette  >  hex 字面量（禁止）
```

- **首选**：让 antd 组件通过 ConfigProvider 自动应用主题，不写自定义样式。
- **次选**：Emotion 样式中引用 `semantic.*` 或 `sidebar.*`。
- **原子色板 `palette.*`**：仅在语义 token 无法覆盖时使用，且需在 PR 描述中说明理由。
- **hex 字面量**：禁止。发现即拒绝 CR。

### 3.2 导入路径

```ts
// ✅ 推荐
import {palette, semantic, sidebar} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {shadow} from '@/constants/shadow';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

// ❌ 禁止（新代码）
import {colors} from '@/constants/colors'; // 旧的 kebab-case 色板，已 deprecated
```

### 3.3 Emotion 用法示例

```tsx
import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {shadow} from '@/constants/shadow';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import styled from '@emotion/styled';

const Card = styled.div`
    background: ${semantic.bg.default};
    border: 1px solid ${semantic.border.card};
    border-radius: ${radius.xl}px;
    padding: ${spacing.l}px;
    box-shadow: ${shadow.s};
`;

const Title = styled.h2`
    ${typography.heading.h2};
    color: ${semantic.text.primary};
    margin-bottom: ${spacing.m}px;
`;
```

## 4. 关键设计决策（不要改）

### 4.1 品牌色分布

| 场景                            | 值                      | 决策依据                                              |
| ------------------------------- | ----------------------- | ----------------------------------------------------- |
| `colorPrimary`（全局强调色）    | `#41D08D` 品牌 06       | 承载 Switch/Radio/Checkbox/Slider/Progress 等强调组件 |
| 主要按钮背景                    | `#1C202B` navigation 09 | 品牌深色主按钮；文字用 `#A7F3CF`                      |
| 下拉选中项背景                  | `#E6FAF1` 品牌 01       | 视觉规范 select-active，浅到不刺眼                    |
| Table 行多选态                  | `#E6FAF1` 品牌 01       | 批量选中给一抹绿，才有品牌感                          |
| Input focus 边框                | `#181818` gray 10       | **非绿**，视觉规范 state-focus                        |
| Input hover 边框                | `#BFBFBF` gray 06       | **非绿**，视觉规范 state-hover                        |
| Menu / Tabs / Pagination 选中态 | gray 系                 | **非绿**，遵循侧边导航二级规范                        |

### 4.2 组件对应关系

| 组件类别 | 代表组件                                                                                                 | 品牌绿是否出现              |
| -------- | -------------------------------------------------------------------------------------------------------- | --------------------------- |
| 输入类   | Input / InputNumber / Select / TreeSelect / DatePicker / TimePicker / Cascader / AutoComplete / Mentions | ❌ 只出现在下拉"选中项"背景 |
| 选择控件 | Switch / Radio / Checkbox / Slider                                                                       | ✅ 强调色即绿色             |
| 反馈类   | Progress / Badge / Rate                                                                                  | ✅（Rate 保持默认黄）       |
| 导航类   | Menu / Tabs / Pagination / Anchor                                                                        | ❌ 走黑/灰                  |
| 侧边栏   | Sider（Layout）                                                                                          | ✅ 一级选中态为绿；二级为灰 |
| 数据展示 | Table                                                                                                    | ✅ 仅 rowSelectedBg 为浅绿  |
| 反馈层   | Modal / Drawer / Tooltip / Message / Notification                                                        | ❌                          |
| 按钮     | Button (primary)                                                                                         | 深色 + 绿文字（复合品牌）   |

## 5. Semantic Token 快查表

### bg（背景）

| Token                 | 值        | 用途               |
| --------------------- | --------- | ------------------ |
| `semantic.bg.page`    | `#F5F7FA` | 页面底色、分栏底色 |
| `semantic.bg.default` | `#FFFFFF` | 组件 / 卡片背景    |

### border（边框）

| Token                       | 值        | 用途           |
| --------------------------- | --------- | -------------- |
| `semantic.border.divider`   | `#E8E8E8` | 分割线         |
| `semantic.border.card`      | `#D9D9D9` | 卡片外边框     |
| `semantic.border.cardHover` | `#BFBFBF` | 卡片边框 hover |

### text（文字）

| Token                       | 值        | 用途            |
| --------------------------- | --------- | --------------- |
| `semantic.text.primary`     | `#181818` | 主要正文 / 标题 |
| `semantic.text.secondary`   | `#545454` | 次要文字        |
| `semantic.text.tertiary`    | `#8F8F8F` | 辅助 / 提示     |
| `semantic.text.placeholder` | `#BFBFBF` | 占位符          |
| `semantic.text.disabled`    | `#CCCCCC` | 禁用            |
| `semantic.text.inverse`     | `#FFFFFF` | 深色底文字      |
| `semantic.text.link`        | `#0080FF` | 链接            |

### state.component（关键：组件交互状态，非品牌色）

| Token                                    | 值        | 用途                             |
| ---------------------------------------- | --------- | -------------------------------- |
| `semantic.state.component.borderDefault` | `#D9D9D9` | 默认边框                         |
| `semantic.state.component.borderHover`   | `#BFBFBF` | 边框 hover                       |
| `semantic.state.component.borderFocus`   | `#181818` | focus / 选中边框（**黑，非绿**） |
| `semantic.state.component.borderError`   | `#E62C4B` | 错误状态边框                     |
| `semantic.state.component.selectHover`   | `#F2F2F2` | 下拉 hover 背景（**灰，非绿**）  |
| `semantic.state.component.selectActive`  | `#E6FAF1` | 下拉选中背景（浅绿）             |
| `semantic.state.component.disabledBg`    | `#F7F7F7` | 禁用背景                         |

### state.{brand|info|success|warning|error}

每组 6 阶：`default / hover / active / disabled / focus / light`。

例：`semantic.state.error.default` = `#E62C4B`；`semantic.state.info.default` = `#0080FF`。

### sidebar（侧边导航专用）

| Token                       | 值                      | 用途                     |
| --------------------------- | ----------------------- | ------------------------ |
| `sidebar.level1.bg`         | `#1C202B`               | 一级导航深色背景         |
| `sidebar.level1.selectedBg` | `#A7F3CF`               | 一级选中态（品牌薄荷绿） |
| `sidebar.level1.hoverBg`    | `rgba(167,243,207,0.3)` | 一级 hover               |
| `sidebar.level2.bg`         | `#FFFFFF`               | 二级面板背景             |
| `sidebar.level2.selectedBg` | `#E8E8E8`               | 二级选中（灰）           |
| `sidebar.level2.hoverBg`    | `#F2F2F2`               | 二级 hover               |

## 6. Radius / Spacing / Shadow / Typography 快查

### radius（圆角）

| Token        | 值 | 用途                |
| ------------ | -- | ------------------- |
| `radius.sm`  | 4  | Tag、进度条、小容器 |
| `radius.md`  | 6  | 输入框、下拉菜单    |
| `radius.lg`  | 8  | 卡片、面板、按钮    |
| `radius.xl`  | 12 | 大卡片、Modal       |
| `radius.xl2` | 16 | 少用                |
| `radius.xl3` | 20 | 圆形按钮            |
| `radius.xl4` | 24 | 头像框              |

### spacing（间距）

| Token         | 值 (px) | 典型用途       |
| ------------- | ------- | -------------- |
| `spacing.xs2` | 0       | 最小间距       |
| `spacing.xs`  | 4       | 图标与文字     |
| `spacing.s`   | 8       | 卡片内元素间距 |
| `spacing.m`   | 12      | 按钮、文字     |
| `spacing.l`   | 16      | 模块间距       |
| `spacing.xl`  | 20      | 表单           |
| `spacing.xl2` | 24      | 区块           |
| `spacing.xl4` | 32      | 页面留白       |
| `spacing.xl9` | 64      | 侧边栏内边距   |

### shadow（阴影）

| Token       | 用途                     |
| ----------- | ------------------------ |
| `shadow.xs` | 浮动元素微投影           |
| `shadow.s`  | 卡片、统计模块（最常用） |
| `shadow.m`  | 导航栏侧向               |
| `shadow.l`  | 抽屉 / 浮层              |

### typography（字体）

- 标题：`typography.heading.{h0..h4}`
- 正文：`typography.body.{regular, medium, small, smallMedium}`
- 注释：`typography.caption.{regular, medium, tiny}`
- 代码：`typography.code.{regular, small}`

用法：`css({ ...typography.body.regular })` 展开到 Emotion 样式。

## 7. 反模式（禁止的写法）

### 7.1 硬编码颜色

```tsx
// ❌ 禁止
<div style={{ color: '#181818', background: '#F5F7FA' }} />;

// ✅ 正确
const Wrapper = styled.div`
    color: ${semantic.text.primary};
    background: ${semantic.bg.page};
`;
```

### 7.2 直接改 antd 的 primary 派生

```tsx
// ❌ 禁止 — 会导致 Switch/Radio 等强调组件失去品牌绿
<ConfigProvider theme={{ token: { colorPrimary: '#181818' } }}>

// ✅ 正确 — Input focus 用组件级覆盖
<ConfigProvider
    theme={{
        components: {
            Input: { activeBorderColor: '#181818' },
        },
    }}
>
```

新增自定义主题时请扩展 `themePresets`，不要覆盖 `cnap2`。

### 7.3 引用 palette 而非 semantic

```tsx
// ⚠️ 不推荐 — 缺失语义信息
color: ${palette.gray[10]};

// ✅ 推荐 — 语义明确
color: ${semantic.text.primary};
```

### 7.4 使用旧的 `colors['gray-8']`

```tsx
// ❌ 禁止（新代码）
import { colors } from '@/constants/colors';
color: ${colors['gray-8']};

// ✅ 正确
import { semantic } from '@/constants/colors';
color: ${semantic.text.secondary};
```

## 8. 污染防护（为什么这么设计）

antd 的 seed → map → alias token 是级联派生：改 `colorPrimary` 会影响
`controlItemBgActive` / `controlOutline` / `colorPrimaryBg` / `colorPrimaryHover`
等一大票 alias token。这是为什么第一版只改 `colorPrimary` 会导致：

- Input focus 边框变绿
- Select 选中项变绿
- Menu hover 变绿
- Tabs inkBar 变绿

`cnap2` preset 在 alias 层做了以下钉死：

| Token                     | 值                    | 作用                       |
| ------------------------- | --------------------- | -------------------------- |
| `controlItemBgActive`     | `#E6FAF1`             | 下拉选中背景（浅绿，控量） |
| `controlItemBgHover`      | `#F2F2F2`             | 下拉 hover（灰）           |
| `controlOutline`          | `rgba(24,24,24,0.06)` | focus 轮廓（黑）           |
| `Input.hoverBorderColor`  | `#BFBFBF`             | Input hover 边框（灰）     |
| `Input.activeBorderColor` | `#181818`             | Input focus 边框（黑）     |
| `Select.colorPrimary`     | `#181818`             | Select 内部派生源改为黑    |
| `Tabs.inkBarColor`        | `#181818`             | Tabs 下划线（黑）          |
| `Menu.itemSelectedBg`     | `#E8E8E8`             | Menu 选中（灰）            |

**新增 antd 组件时**：先看该组件在 antd 官网 theme 里从 `colorPrimary` 派生了什么，
如果那个语义在 CNAP 视觉规范里是"中性色"，就必须在 `cnap2.components.<Name>` 里
显式覆盖。

## 9. AI Agent 使用指引

给 AI Agent 的提示词模板：

```text
遵循 docs/design/design-tokens.md：
1. 所有颜色引用 semantic.* / sidebar.* / palette.*，禁止 hex 字面量。
2. 圆角/间距/阴影/字体分别引用 radius.* / spacing.* / shadow.* / typography.*。
3. antd 组件通过 <ConfigProvider theme={themePresets.cnap2}> 自动应用主题，
   不要在组件内二次覆盖 antd 主题 token。
4. 品牌绿只允许出现在 Switch/Radio/Checkbox/Slider/Progress/Sider 一级选中；
   Input/Select/Menu/Tabs/Pagination 一律走黑或灰。
5. 遇到 Figma 未覆盖的组件，参考"污染防护"章节判断，或让人工评审。
```

## 10. 变更流程

- Token 值调整：改 `src/constants/colors/palette.ts` + `themes/presets.ts`。
- 新增语义：改 `semantic.ts` + 本文档 § 5。
- 新增 antd 组件覆盖：改 `themes/presets.ts` 的 `cnap2.components`。
- 涉及品牌色分布决策的调整：需在 `docs/discussions/` 讨论后落档，本文档同步。

## 11. 图标（icon）着色

单色图标统一以 `#545454`（= `semantic.text.secondary`）着色，由 `vite-plugin-svgr` 作用域在导入期注入为 `currentColor`（详见 `docs/architecture/svg-icon-system.md`）。

- 单色图标以组件方式消费（`import { X } from '@/assets/icons'`）时颜色随容器 `color` 变化；改色请设容器 `color`，勿在 SVG 源写死颜色或改成品牌绿。
- 多彩插画放 `src/assets/illustrations/`，保留原色，不受色 token 约束。
- 图标目录 / 新增 / 消费的完整规范以 `docs/architecture/svg-icon-system.md` 为准。
