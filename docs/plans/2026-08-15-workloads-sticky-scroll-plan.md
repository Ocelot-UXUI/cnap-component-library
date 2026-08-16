# 2026-08-15-workloads-sticky-scroll Workloads 页面多级吸顶滚动（假滚动方案）

> Plan Status: in progress
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-08-15（独立 draft review 已完成，必改项已并入；用户确认进入实现。实现进行中：Phase 0 文档对齐完成；Phase 1–5 代码落地，自动化验证 lint-type/lint/test 通过；视觉 proof（yarn start 目视）与 independent closure audit 待人工完成，故未 completed）
> Source: 用户请求（多级吸顶滚动需求 1–6 + 澄清）+ 用户明确要求采用「假滚动」（外部占位撑行程 + 定高窗口 + transform 搬运内容）

## Background / 设计动机

- 核心目标：让 **PodContentArea 容器本身**在页面滚动到位后固定于 WorkloadsHeader 下方，形成一个定高可视窗口（req2）。
- 为何用假滚动：自然滚动 + CSS `position:sticky` 无法让一个高度可变的容器在其内部内容继续滚动时持续钉在 header 下方（sticky 元素的底边一旦滚过约束区即释放）。因此采用假滚动——外部动态占位区延长外部滚动行程；PodContentArea 作为定高窗口（`overflow:hidden`、无内部滚动条）；外部滚动时由 `scrollTop` 计算进度，对窗口内内容施加 `transform: translateY` 搬运。

## Current Baseline

- 单一外部滚动容器 `PaneScroll`（`src/routers/AppLayout/workspace/content/WorkspacePane.style.ts`，overflow-y:auto、height:100%、padding），父 `#pageContent` overflow:hidden。
- `Workloads/index.tsx`：`PageContainer(height:100%)` → `Sticky(top:0)` WorkloadsHeader → WorkloadsOverview → PodContentArea → BatchActionBar（流内 `align-self:center`）。
- `PodContentArea/index.tsx`：PodContentHeader、PodFilterBar、GroupSection（多个 `PodGroupTable`）。`PodGroupTable.tsx`：GroupHeader 包 `Sticky top=56px`（原生 sticky）、Table 无 sticky、Pagination 包 `Sticky bottom=0`。折叠经 `collapsed:Set` + `expanded` 透传；刷新 `key={group.id}-${refreshNonce}` 重挂载。
- **keep-alive 强制基线（`docs/architecture/workspace-keep-alive.md`）**：多达 7 个常驻 Pane；`<Activity hidden>` cleanup effects、恢复重跑；轮询/订阅/监听「必须」在 useEffect 内并返回清理函数。
- requirement owner `docs/requirements/pod-list-content-area.md`：:279 已有「滚动时表头随滚动吸顶」验收项；:426「各组独立滚动」为旧表述，待订正为单一外部滚动条 + 假滚动模型。

## Goals

- 用假滚动实现需求 1–6：
  - WorkloadsHeader 常驻（原生 sticky，保留）。
  - Overview 在窗口 pin 前自然滚走；PodContentArea 到达 WorkloadsHeader 下方后 pin 为定高窗口。
  - 定高窗口 `overflow:hidden`、无内部滚动条；外部动态占位撑出第二阶段行程。
  - 依外部 `scrollTop` 计算进度，`transform` 搬运窗口内内容（PodContentHeader/FilterBar 先滚走）。
  - 每个 PodGroupTable 的 GroupHeader + 表头按序「单个」吸顶（由进度在 JS 中驱动，非原生 sticky）；body 随进度移动；切到下一分组时交接。
  - 分页器：active 分组底部不可见时固定于窗口底部，可见时随内容回流。
  - 批量操作栏固定于屏幕底部、PodContentArea 下方。
- 适配动态高度（折叠、数据、分页、视图模式）与工作区 keep-alive 显隐。

## Non-Goals

- 不改 Pod 数据/接口契约、不改批量操作业务逻辑。
- 不改 WorkloadsHeader/Overview 视觉。
- 不在本切片引入通用滚动动画框架；仅实现本页所需的进度驱动。

## Task Route

- Type: app-layer design change + architecture-adjacent（引入进度驱动的假滚动 / pin-scrub 机制，改变 PodContentArea 渲染模型）
- Owner Docs：requirement `docs/requirements/pod-list-content-area.md`（更新为假滚动模型 + 落地表头吸顶 AC）；architecture `docs/architecture/workspace-keep-alive.md`（effect 契约约束进度控制器，交叉引用）。

## Key Mechanics（影响范围/关闭判断，非逐行实现）

- 结构（`PaneScroll` 内）：`Sticky(top:0)` WorkloadsHeader（原生）→ WorkloadsOverview（stage1 自然滚走）→ Stage(relative, 动态高度)：内含 PinnedWindow（`position:sticky; top=headerH; overflow:hidden`），**Track 为 PinnedWindow 的子元素**（`transform: translateY(−progress)`，承载 PodContentArea 全部真实内容），Spacer（动态高度）撑高 Stage → BatchActionBar（屏幕底部）。
- 窗口高：`windowHeight = V − headerH − (batchBarVisible ? batchBarH : 0)`（批量栏占屏幕底部一条，窗口须为其让出高度，否则「PodContentArea 下方」无处安放）；`windowHeight` 喂给 scrubRange/Spacer/progress，故 `batchBarVisible` 变化必须触发重算（见 Phase 5）。
- `headerH` 非常量（WorkloadsHeader 容器 36px + Sticky paddingBottom `spacing.l`=16 ≈ 52，旧代码 `top="56px"` 已与之不符）：运行时 ResizeObserver 实测吸顶头高度，窗口 `top` 与子级吸顶偏移复用同一实测值。
- `pinStart` 用 rect 实测而非 `offsetTop`（`PageContainer`/`PaneScroll` 均 `position:static`，`offsetParent` 会越过滚动容器且不含 PaneScroll 的 padding）：`pinStart = Stage.getBoundingClientRect().top − scrollEl.getBoundingClientRect().top + scrollEl.scrollTop − headerH`。
- 进度：`scrubRange = max(0, 内容高 − windowHeight)`；`progress = clamp(scrollTop − pinStart, 0, scrubRange)`；Spacer 高度 = scrubRange。
- 滚动容器解析：取「就近满足 `overflow-y:auto|scroll` 且 `scrollHeight > clientHeight`」的祖先（=PaneScroll）；**不可**用「首个 overflow≠visible」，否则会命中新引入的 PinnedWindow / `#pageContent`（均 overflow:hidden）。非全局 id（keep-alive 多 Pane 会冲突）。
- 子级吸顶（GroupHeader + 表头）：窗口内无真实滚动 → **原生 sticky 与 antd Table `sticky` 均失效**（现有 `PodGroupTable` 的 `<Sticky top="56px">` GroupHeader 与 `<Sticky bottom="0px">` 分页器包裹须移除/替换，避免与 JS 吸顶冲突）；须由 progress 在 JS 中重算：计算 active 分组，对其 GroupHeader/表头反向 translate 停留在窗口顶，body 位移，分组间交接。
- antd Table 的 `sticky`/`getContainer` 不再使用；表头吸顶改为自绘/克隆/反向 translate，须同步 **列宽 + fixed-left/right 固定列 + 横向滚动**（表格用 `scroll={{x:'max-content'}}`、首列 fixed-left、操作列 fixed-right）。
- 分页器：按 progress 判断 active 分组底部是否在窗口内，未入则固定窗口底、入则回流。
- keep-alive：scroll/rAF/ResizeObserver 均在 effect 内 + cleanup；Activity 恢复时重测 headerH/内容高/windowHeight/pinStart，并按保留的 `scrollTop` 重算 transform。

## Risks（实现或关闭前须处理）

- **子级吸顶需自绘（高风险）**：原生 sticky / antd thead 失效，GroupHeader + 表头吸顶与「一次一个」交接须 JS 重算；难点是列宽同步 + fixed-left/right 固定列复现 + 横向滚动同步（表格 `scroll={{x:'max-content'}}`、首列/操作列 fixed）。
- **滚动-变换延迟**：scroll 事件驱动 transform 相对合成器约有 1 帧延迟，易抖动；需评估 `will-change`/rAF 或 scroll-driven animations。
- **原生滚动语义丢失**：键盘翻页、Page Up/Down、页面内查找定位、焦点滚动进视口、文本选中自动滚动在定高窗口 + transform 下会异常，需评估可接受度或补偿。
- **浮层裁剪（已核实：antd popup 默认安全）**：项目未设置 `getPopupContainer`，antd 6 默认将 Select/Dropdown/Tooltip/Popover 门户到 body 追加容器，不受窗口 `overflow:hidden` 影响。真实风险：(a) Track 内任何非 antd 的内联绝对定位浮层会被裁剪；(b) Track 被 transform 滚动时 popup 重定位有延迟。**切勿**把 `getPopupContainer` 指向窗口内节点（那才会导致裁剪）。
- **动态高度重算**：折叠/数据到达/换页/视图切换/**批量栏显隐**都要重算内容高与 windowHeight → Spacer 与 progress 映射，避免内容跳变与竞态。
- **末尾/短分组**：占位按内容高−窗口高计算；无法滚到吸顶线的分组不强制吸顶、不补足一屏（用户澄清）。

## Execution Plan

### Phase 0 - 需求/文档对齐（假滚动模型）

Status: completed

- Add：更新 `pod-list-content-area.md` 为假滚动模型（外部占位 + 定高窗口 + transform）、写明核心目标「PodContentArea 容器本身固定于 header 下方」、落地 :279 表头吸顶 AC、订正 :426「各组独立滚动」与 :284「createPortal 批量操作」旧表述（改为单一外部滚动条 + 批量栏屏幕底部固定，任何满足视觉的实现均可）。Skill: none
- Add：在 `docs/context/project-context.md` 的 Active Work 注册本计划与 requirement，避免孤立。Skill: none
- Proof：requirement / project-context 与本计划一致。

[x] Exit Criteria:

- [x] requirement 反映假滚动模型、核心目标（容器固定于 header 下方）及计划（:279/:426/:284 均已订正）
- [x] 计划已在 project-context Active Work 注册
- [x] `docs/logs/` updated（见 2026-08-15 日志）

### Phase 1 - 滚动进度控制器 + 结构骨架

Status: code complete（纯逻辑单测 + `yarn lint-type`/`yarn lint` 通过；行为/视觉 proof 待 `yarn start`）

- Add：滚动容器解析——取「就近 `overflow-y:auto|scroll` 且 `scrollHeight>clientHeight`」的祖先（=PaneScroll），不可用「首个 overflow≠visible」（会命中 PinnedWindow/#pageContent）；非全局 id。Skill: none
- Add：进度控制器 hook（scroll/rAF 读 scrollTop，ResizeObserver 实测 headerH/内容高/windowHeight，用 rect 算 pinStart，算 scrubRange/progress）；全在 effect 内 + cleanup（keep-alive 合规）。Skill: none
- Add：PinnedWindow（sticky top=实测 headerH + 定高 + overflow hidden）内含 Track（transform）+ Spacer（动态高）结构；WorkloadsHeader 保留原生 sticky；Overview 置于窗口外自然滚走。Skill: none
- Add：进度/占位/pinStart/headerH 等纯函数 + 单测（参照 `PodContentArea/__tests__/*`）。Skill: none
- Proof：`yarn lint-type`；纯函数单测；隐藏/恢复无监听泄漏。Skill: none

[ ] Exit Criteria:

- WorkloadsHeader 始终吸顶（req1）；外部滚动驱动 Track transform、窗口 pin/scrub 行程正确
- 滚动容器解析命中 PaneScroll 而非 overflow:hidden 窗口
- 纯逻辑单测通过；`yarn lint-type` 通过
- [ ] `docs/logs/` updated

### Phase 2 - 阶段一自然滚动 + 内容头/筛选条滚走

Status: code complete（视觉 proof 待 `yarn start`）

- Add：stage1 自然滚动至窗口 pin；进入 scrub 后 PodContentHeader、PodFilterBar 随 Track 位移滚走。Skill: none
- Proof：`yarn start` 目视——Overview 滚走、窗口在 header 下 pin、内容头/筛选条随进度滚走、切换点无跳变。Skill: none

[ ] Exit Criteria:

- 两阶段切换点无跳变；内容头/筛选条正确滚走
- [ ] `docs/logs/` updated

### Phase 3 - GroupHeader + 表头 JS 吸顶与交接（核心难点）

Status: code complete（反向 translate 方案已落地；表头 thead 列宽/fixed 列/横向滚动同步与「一次一个」交接的视觉 spike 与调优待 `yarn start`——本阶段为计划标注的高风险项）

- Proof(spike)：先验证表头吸顶方案（自绘 header 行 / 克隆 thead / 反向 translate 原 thead），须覆盖 **列宽同步 + fixed-left/right 固定列复现 + 横向滚动同步**（表格 `scroll={{x:'max-content'}}`、首列 fixed-left、操作列 fixed-right），选定可行方案再铺开；同时移除现有 `<Sticky top="56px">`/`<Sticky bottom="0px">` 包裹。Skill: none
- Add：按 progress 计算 active 分组，对其 GroupHeader + 表头反向 translate 停留在窗口顶，body 位移；分组间交接（前一个松开、当前吸顶）；短/末尾分组无法到达吸顶线时不强制吸顶（用户澄清）。Skill: none
- Proof：`yarn start` 目视——单个分组吸顶、切换交接、表头列与 body 对齐、固定列/横向滚动正确、短分组不吸顶。Skill: none

[ ] Exit Criteria:

- 一次一个吸顶、交接正确、表头列宽与 body 对齐、固定列与横向滚动正常
- 短/末尾分组无法到达吸顶线时不吸顶且无跳变
- [ ] `docs/logs/` updated

### Phase 4 - 分页器 + 批量操作栏

Status: code complete（视觉 proof 待 `yarn start`）

- Add：批量栏固定屏幕底部、PodContentArea 下方；批量栏可见时 `windowHeight = V − headerH − batchBarH`（窗口为其让出高度并触发进度重算，见 Phase 5），分页器再为批量栏让位。Skill: none
- Add：分页器按 active 分组底部是否入窗口决定固定窗口底 / 回流。Skill: none
- Proof：`yarn start` 目视——5c 两态、批量栏置底不遮挡、显隐批量栏时窗口/进度无跳变。Skill: none

[ ] Exit Criteria:

- 5c 两态正确、仅 active 组固定；批量栏置底不遮挡；显隐批量栏窗口高与进度正确重算
- [ ] `docs/logs/` updated

### Phase 5 - 动态高度 / 折叠 / keep-alive 适配 + 语义补偿

Status: code complete（动态高度由 track 上的 ResizeObserver + 每组 remeasure 覆盖；keep-alive 走 effect+cleanup；antd popup 未设 getPopupContainer 仍门户 body。原生滚动语义取舍见下方 Decision；视觉 proof 待 `yarn start`）

- Add：折叠/数据/换页/视图切换/批量栏显隐重算内容高与 windowHeight → Spacer 与 progress；Activity 恢复重测 headerH/内容高/windowHeight/pinStart 并按保留 scrollTop 重算 transform；核对 antd popup 仍门户到 body（勿把 `getPopupContainer` 指向窗口内）。Skill: none
- Decision：键盘/查找/焦点滚动等原生语义的取舍与补偿范围。**选择**：本切片接受在定高窗口 + transform 假滚动下丢失部分原生滚动语义（Page Up/Down、`Ctrl+F` 浏览器查找定位、focus 滚入视口、文本选中自动滚动），不做补偿。**理由**：外层 PaneScroll 仍是真实滚动条，键盘翻页/查找仍作用于整页外层滚动（用户可用外层滚动到达内容），窗口内不再有独立滚动；补偿需拦截键盘/焦点事件并反算 progress，成本高且与假滚动模型耦合深。**备选**：(a) 监听 focusin 将目标元素 progress 对齐窗口；(b) 用 CSS scroll-driven animations 替代 scroll 事件以贴近原生。**剩余风险**：窗口内深层内容的键盘可达性下降、查找命中窗口内元素时不自动滚动到位——列入回归验证与后续跟进。Skill: none
- Proof：`yarn start` 目视——各动态变化下窗口/进度稳定无跳变；工作区切回正常；浮层不被裁剪。Skill: none

[ ] Exit Criteria:

- 动态变化（含批量栏显隐）与 keep-alive 恢复稳定；浮层不被裁剪；语义取舍已记录
- [ ] `docs/logs/` updated

### Phase 6 - 验证与文档

Status: in progress（自动化验证已跑并如实记录；日志已更新；视觉 proof 与 independent closure audit 待人工）

- Proof：`yarn lint-type` / `yarn lint` / `yarn test` 全绿（或仅既有无关失败，注明归因）。Skill: none
- Add：更新当日 `docs/logs/{year}/{month}-{day}.md`；交叉引用 architecture keep-alive 与 requirement。Skill: none

[ ] Exit Criteria:

- [x] 三命令如实记录：`yarn lint-type` 通过、`yarn test` 247/247 通过、`yarn lint` 无新增错误（仅既有无关 i18n `no-explicit-any` + `max-lines` 警告）；owner docs 与实现一致
- [x] `docs/logs/` updated（`docs/logs/2026/08-15.md`）
- [ ] `yarn start` 视觉 proof（Phase 2–5 行为验收）待人工
- [ ] independent closure audit 待人工

## Closure Gates

- [ ] 需求 1–6 live behavior 全部满足（假滚动两阶段、5c、批量栏置底）
- [ ] PodContentArea 容器本身固定于 header 下方（req2 核心目标）已实现并可验收
- [ ] 滚动语义取舍（键盘/查找/焦点）已记录且可接受
- [ ] 进度控制器 keep-alive 合规（无泄漏、恢复重算）
- [ ] owner docs（requirement/architecture）+ logs 与实现一致
- [ ] 验证已运行且失败项归因清晰
- [ ] closure audit 独立完成（非实现方）



