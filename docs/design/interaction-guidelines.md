# CNAP Interaction Guidelines

## Purpose

收敛 CNAP 2.0 通用 UI 交互约定的 owner doc。此处只承载跨功能通用的交互行为规范；单一功能专属的交互写在对应的 `docs/requirements/` 切片文档中。

## Scope Boundary

- 视觉 / 样式 token 归 `docs/design/design-tokens.md`
- 应用外壳与布局归 `docs/design/application-layout-guidelines.md`
- 导航系统交互归 `docs/design/navigation-system.md`
- 本文只承载上述范围之外的通用交互约定

## Conventions

### 文本截断必须配 Tooltip

如果在设计中，某处文字内容会因为过长而被截断，则该文字容器必须由 Tooltip 组件包裹；用户悬停时，Tooltip 展示完整内容。除非已有其他交互设计提供了类似功能。

### 相对时间必须支持 Hover 显示绝对时间

当某个时间字段的显示要求为"显示该时间相对于当前时间的相对时间"（如"3 分钟前"）时，必须支持鼠标 Hover 时展示该时间的绝对值。

绝对时间显示必须使用 `dayjs` 格式化，默认格式为 `YYYY-MM-DD HH:mm:ss`。
