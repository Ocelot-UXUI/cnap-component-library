# 2026-08-12 组件视觉验收修复计划

> Plan Status: partially completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-08-12
> Source: 设计验收文档《cnap2.0 组件 设计验收》(ku.baidu-int.com/knowledge/HFVrC7hq1Q/HsaDGrX8HH/emP9chCPG3/VYZSFhHAYV-mhY) + 会话内设计侧数值澄清

## Current Baseline

- `src/constants/themes/presets.ts` 的 `cnap2` preset 承载 antd 组件级 token；`Input.borderRadius = radius.md`、`Table.rowHoverBg = palette.warning[1]`、`Pagination.itemActiveBg = selectHover`。
- `src/styles/global-table.ts` 用 `injectGlobal` 覆盖 Table / Checkbox / Radio / Tooltip / btn-sm；其中 Checkbox 选中态被写成 `semantic.button.primary.bg`（深色），与 preset 的品牌绿冲突。
- `src/styles/reset.css` 有一段 `.ant-5-message` 右上角定位 + 右滑入动画，导致 Message 不在顶部居中。
- `src/design/` 中 Drawer / Select 为增强组件，Modal / Input / Tag 等为透传导出。
- `src/components/LogSearchInput/` 使用 `@ant-design/icons` 的 Search / Up / Down 图标，匹配数字用 `typography.body.regular`（Inter 由根 fontFamily 覆盖）。
- 图标资源已就绪：`@/assets/icons` 已导出 `Search` / `ArrowUp` / `ArrowDown` / `ChevronUp` / `ChevronDown`。

## Goals

- 让验收文档中已确认的组件样式偏差在 cnap2 主题基线内收敛，颜色/尺寸全部走 token。
- 消除 preset 与全局样式之间的两处冲突（Checkbox 绿色、Table hover 橙色）。
- Drawer / Modal 提供设计规范的 S / M / L 尺寸档，默认 M。
- Message 恢复顶部居中。

## Non-Goals

- 面包屑可下拉、Empty 插画与尺寸档（设计侧要求本轮不做）。
- InputNumber hover 边框颜色（设计侧未定）。
- Input 出错态 hover 气泡。
- Tab / 导航 / 折叠面板 / 置顶悬浮球 / 信息分栏 / 底部操作 bar（设计侧未提供稿）。
- Input 的 8px 圆角不外扩到 InputNumber / Select / DatePicker。

## Task Route

- Type: app-layer design change（视觉基线收敛）+ implementation-only change
- Owner Docs: `docs/design/design-tokens.md`、`docs/context/conventions.md`

## Confirmed Design Values

| 项 | 值 |
| - | - |
| Switch 大 | 宽 32 / handle 16（高度由内部元素决定，不设 trackHeight） |
| Switch 小 | 宽 24 / handle 10 |
| Input 字号 | small 12 / middle 14 |
| Input 圆角 | 8px（仅 Input） |
| InputNumber 小尺寸字号 | 12 |
| Tag | 无描边 |
| Drawer | S 600 / M 800 / L 980，默认 M |
| Modal | S 600·300~600 / M 800·480~600 / L 1024·560~800，默认 M |
| LogSearchInput | prefix 用 `@/assets/icons` Search；上下切换用项目上下箭头 icon；匹配数字用 PingFang SC |
| Radio 已选禁用态 | 默认态 + 60% 透明度；内实心圆 6px；不新增 token，受控局部值 + 注释 |
| Message | 顶部居中 |

## Execution Plan

### Phase 1 - 主题 token 收敛

Status: planned

- Fix: `Button` 去掉投影、补禁用态（背景 / 文字 / 边框）语义 token。Skill: none
- Fix: `Switch` 默认档尺寸（宽 32 / handle 16）。Skill: none
- Fix: `Input` 字号 12/14、圆角 8px。Skill: none
- Fix: `InputNumber` 小尺寸字号 12。Skill: none
- Fix: `Table.rowHoverBg` 由橙改中性灰（橙色归还核验态）。Skill: none
- Fix: `Pagination` 激活项去灰底。Skill: none
- Fix: `Tooltip` 投影收敛。Skill: none

[ ] Exit Criteria:

- 上述 token 全部引用 `semantic` / `radius` / `shadow` / `typography`，无 hex 字面量
- `yarn lint-type` 与 `yarn lint` 通过

### Phase 2 - 全局样式收敛

Status: planned

- Fix: Checkbox 选中 / 半选 / hover / 禁用统一走品牌绿语义，删除与 preset 冲突的深色覆盖。Skill: none
- Fix: Radio 已选禁用态（60% 透明度 + 6px 内圆，局部值加注释）。Skill: none
- Fix: Tag 无描边、关闭图标色、置灰态。Skill: none
- Fix: Pagination 省略号色、激活项不加粗、条数选择器下拉圆角。Skill: none
- Fix: Switch 小尺寸（宽 24 / handle 10）class 覆盖。Skill: none
- Fix: `.ant-5-btn-sm` 硬编码字号改引用 typography。Skill: none
- Fix: 删除 `reset.css` 中 Message 右上角定位与右滑动画，恢复顶部居中。Skill: none

[ ] Exit Criteria:

- 全局覆盖不再与 `cnap2` preset 互相打架
- Message 在 playground 顶部居中弹出

### Phase 3 - 增强组件

Status: planned

- Add: `src/design/Drawer` 增加 size（s/m/l）→ width 映射，默认 m。Skill: none
- Add: `src/design/Modal` 由透传改为增强组件，增加 size → width + body 最小/最大高度映射，默认 m。Skill: none
- Fix: `src/design/Select` 多选聚焦保留箭头、无边框态文字与图标间距 8px。Skill: none
- Fix: `src/components/LogSearchInput` 换用 `@/assets/icons` 图标，匹配数字字体走 PingFang SC。Skill: none
- Fix: 根 `ConfigProvider` 关闭按钮两字自动插空格。Skill: none

[ ] Exit Criteria:

- Drawer / Modal 的 size 档位可在 playground 验证
- 业务侧不需要各自处理 Select 聚焦图标问题

### Phase 4 - 验证与文档

Status: planned

- Proof: `yarn lint-type`、`yarn lint`、`yarn test` 全绿
- Fix: `docs/design/design-tokens.md` 同步被改动的关键决策（Input 圆角、Table hover、Tag 描边、Drawer/Modal 尺寸档）
- Fix: 追加 `docs/logs/2026/08-12.md`

[ ] Exit Criteria:

- 验证命令全部通过并记录
- owner doc 与代码基线一致

## Closure Gates

- [ ] in-scope behavior is complete
- [ ] relevant docs are aligned
- [ ] verification has run
- [ ] closure audit was independent
