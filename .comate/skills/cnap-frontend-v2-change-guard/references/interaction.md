# 交互（表单 / 弹窗 / 空态 / 加载 / 图标 / 文案 / 截断 / 时间）

**真源**：`docs/design/interaction-guidelines.md`（跨功能交互标准）、`docs/context/conventions.md`。

## 明文规范（必须遵守）

- **文字截断**：任何可能被截断的文本，hover 必须用 `Tooltip` 展示全文。
- **相对时间**：显示"3 分钟前"这类相对时间时，hover 必须用 `Tooltip` 展示绝对时间（`dayjs` 格式 `YYYY-MM-DD HH:mm:ss`）。

## 既有 pattern（模仿，别自造）

- **表单**：antd `Form`（`@/design` 引入）+ `Form.useForm()` + `rules` 校验，不要自己搓表单状态。
- **弹窗 / 抽屉**：`Modal`（`@/design` 透传）；抽屉用增强 `Drawer`（标题左/关闭右/`extra`，见 `component.md`）。
- **空态**：`Empty`（`@/design`）；需要动效用 `src/components/Motion/MotionEmpty`。
- **加载**：`Spin`（`@/design`）。
- **错误兜底**：`src/components/Error/`（`ErrorBoundary` + `PageFallback`），基于 `react-error-boundary`。
- **图标**：见 `assets.md`（`@/assets/icons`，单色 `currentColor`）。
- **文案**：同一动作全站用同一措辞，跟随现有页面用词；不要臆造新说法。

## 交互元素别忘了 AI 语义

可被 AI 驱动的交互元素（按钮/tab/表单等）需要 `data-ai-*` 标注，见 `ai-semantics.md`。
