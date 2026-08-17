# 2026-08-16-workloads-linked-scroll Workloads 隐藏内部滚动 + 外部同步（linked scroller）

> Plan Status: planned
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-08-16（独立 draft review 完成：needs revision 的 1 blocking + 2 major + 7 minor 已全部修订并入，blocking 以「实际完成记账」方式解决，见 Draft Review Record。实现未开始，Phase 1 spike 为门控）
> Source: 用户确认方案切换（2026-08-16）——保留「单一可见滚动条」硬约束，改用「内部真实滚动容器 + 滚动条隐藏 + 外部不可见占位撑行程 + 内外 scrollTop 双向同步」，替代假滚动（transform 搬运）机制

## Current Baseline

- `2026-08-15-workloads-sticky-scroll-plan.md`（in progress）：假滚动代码已落地（`StickyScrollStage/`、`stickyScroll.ts` 纯函数、PodGroupTable 自绘吸顶/分页 portal），`yarn lint-type`/`yarn lint`/`yarn test` 通过，但 **`yarn start` 视觉 proof 与 closure audit 未做**——其最高风险项（Phase 3 自绘表头吸顶）尚未经目视验证。
- `2026-08-16-workloads-sticky-scroll-perf-plan.md`（planned）：针对假滚动热路径的性能计划，本方案使其大部分条目结构性失效。
- **旧计划处置（用户指示）**：两份原计划文档**不再修改**；取代关系记录于本计划与 `docs/context/project-context.md`。08-15 计划未完成的视觉 proof / closure 出口由本计划 Phase 6 承接（验收点清单相同）。
- 可复用资产（沿用不重写）：`resolveScrollParent`（外层滚动容器解析；现为 `applyTransforms` 内每帧调用，本计划 Phase 5 收敛为建立时解析一次）、`computeWindowHeight` / `computePinStart`（批量栏让高、rect 实测 pin 起点）、`clamp` / `computeProgress` / `computeScrubRange`（Phase 3 同步映射直接复用，不重写）、`attachStickyListeners`（存续，扩展为内外双容器监听）、Stage/PinnedWindow/Spacer 结构与 sticky 置顶、keep-alive effect+cleanup 监听模式、`stickyScroll.test.ts` 中窗口高/pinStart/clamp/progress 相关用例（10 例）。
- 将被删除的资产：`computeGroupSticky` / `computeGroupStickies` / `activeGroupIndex` / `paginationPinned`（JS 吸顶数学，对应 10 个用例）、`measureGroups` / `resetTransforms` / `applyGroupTransforms`（逐组量测与 transform）、分页 portal 全套（`paginationPinnedId` / `paginationSlot` / `setPaginationSlot` / `PaginationSlot` styled 组件 / `createPortal`）、`will-change: transform`（Track/thead/GroupHeaderPin）、z-index:16 盖 fixed 列 hack。另：原性能计划（planned，未落地代码）的节点缓存/context 拆分条目属**计划条目作废**而非代码删除。

## Goals

- **行为等价切换机制**：单一可见滚动条（外层）、容器 pin 于 header 下方定高窗口、内容头/筛选条先滚走、单组吸顶交接、分页固定/回流、批量栏置底——全部验收点与 08-15 计划相同，实现改为「内部真实滚动容器（滚动条隐藏）+ 外部占位 + 双向 scrollTop 同步」。
- 原生 sticky 回归：GroupHeader `sticky top:0`、antd Table `sticky`（`getContainer` 指向内部容器，表头停在 GroupHeader 下方，固定列/横向滚动为 antd 原生能力）、分页行 `sticky bottom:0`。
- 原生滚动语义恢复：Ctrl+F 定位、focus/scrollIntoView 滚入视口、窗口内键盘翻页、文本选中自动滚动（优于假滚动方案的「接受丢失」决策）。
- 热路径收敛：每帧一次 `inner.scrollTop` 写入；无 per-group querySelector / transform / getComputedStyle 父链遍历（08-16 性能计划高/中收益项被结构性消除，仅吸收其两项仍成立条目）。

## Non-Goals

- 不改 Pod 数据/接口契约、筛选/排序/批量操作业务逻辑、WorkloadsHeader/Overview 视觉。
- 不修改 `2026-08-15` / `2026-08-16` 两份原计划文档（用户指示）。
- 不做 CSS scroll-driven animations（外部驱动路径的 1 帧延迟仍存在，见 Decision C）。
- 不做表格虚拟化（每组 ≤50 行，非瓶颈）。

## Task Route

- Type: app-layer design change（滚动机制替换，需求验收面不变）
- Owner Docs: `docs/requirements/pod-list-content-area.md`（滚动模型已于 2026-08-16 修订为「隐藏内部滚动 + 外部同步」）；`docs/architecture/workspace-keep-alive.md`（同步控制器 effect+cleanup 契约继续约束）
- Skill: draft review 使用 `docs/skills/plan-audit-prompt.md`；实现各阶段 Skill: none

## Key Mechanics（影响范围/关闭判断）

- 结构：`Stage(relative) > PinnedWindow(position:sticky; top=实测 headerH; 定高; overflow-y:scroll + 滚动条隐藏) + Spacer(高 = inner.scrollHeight − inner.clientHeight)`。窗口高度沿用 `computeWindowHeight`（含批量栏让高）；pinStart 沿用 rect 实测。
- 同步（双向）：外层 scroll → `inner.scrollTop = clamp(scrollTop − pinStart, 0, inner.scrollHeight − inner.clientHeight)`（rAF 合帧）；内部 scroll（滚轮悬停/focus/find 原生驱动）→ 回写外层 `scrollTop = pinStart + inner.scrollTop`。回环防护：同步标志 + 写前值比较（epsilon 容差），并须容忍程序化双祖先滚动（`scrollIntoView`/focus 可能同时滚动内外两层，靠值比较吸收到单帧收敛）；`scroll-behavior` 保持默认 `auto`（同步即时生效）。
- **scroll anchoring 处置**：内层容器 `overflow-anchor: none`（禁用锚点调整，避免折叠/数据到达时浏览器自行改写内层 scrollTop 触发同步链）；外层 PaneScroll 保持默认（其锚点行为与现状一致，不新增变量）。
- `overscroll-behavior` 保持默认（允许链式）：内部滚到底继续滚轮 → 链式传导外层 → 窗口自然解除 pin 滚走；顶部同理。**不可设 `contain`**（会把用户困在窗口内）。
- 量测收缩：内容高 = `inner.scrollHeight`（读内部容器即可，无需逐组 rect 量测）；ResizeObserver 须观察**内部内容元素**而非窗口本身（RO 不监听 scrollHeight 变化，只监听盒尺寸变化）；pinStart/windowHeight 重算触发条件沿用（折叠/数据/换页/视图切换/批量栏显隐/resize）。
- keep-alive：监听全部 effect 内 + cleanup；Activity 恢复时按保留的外层 scrollTop 重同步内部，并重测 pinStart/内容高。

## Risks（实现或关闭前须处理）

- **antd Table `sticky` 在自定义容器内的表现（spike 前置）**：`getContainer` 指向内部滚动容器 + `offsetHeader`（表头停在 GroupHeader 下方）需验证表头吸顶、fixed-left/right 固定列、横向滚动三者的实际表现；这是 Phase 1 spike 的核心。
- **双向同步正确性**：回环（标志/值比较防抖）、小数像素与缩放（epsilon）、布局变化后失步（remeasure 后 clamp 重同步）、keep-alive 恢复。同步映射纯函数化 + 单测。
- **scroll anchoring 干扰**：折叠/数据到达/换页时浏览器锚点调整会不经用户滚动地改写某侧 scrollTop 并经同步放大为跳变——内层 `overflow-anchor: none` 处置（见 Key Mechanics）；Phase 3/5 目视项须含「动态变化下无锚点漂移跳变」。
- **程序化双祖先滚动**：`scrollIntoView`/focus 可能同时滚动内外两层，随后外→内同步再写内层，存在一次操作双重位移/瞬时振荡——守卫的值比较须能将其吸收为单帧收敛（Phase 6 验收「focus 滚入视口」覆盖）。
- **隐藏滚动条基线**：`scrollbar-width: none` / `::-webkit-scrollbar{display:none}` 需在内部 Chromium 基线验证（无 gutter、无布局残留）。
- **sticky 层叠调优**：上一组吸顶 thead 与下一组 GroupHeader 的覆盖顺序、antd sticky header 与 GroupHeader 的 z-index 协调、固定态 PagerRow 背景遮挡（见 Phase 4 前提 ii）——静态 CSS 调优，目视验收。
- **组尾退出的层叠与「一同滚走」**：sticky 包含块约束决定释放顺序为 分页器（组底入窗底）→ thead（表格底边到达吸顶位）→ GroupHeader（分组底边=分页器底部到达其吸顶下沿，最后释放）——header+thead+分页器自此同速随内容退出，无需额外逻辑（旧假滚动 computeGroupSticky 的 clamp/zIndex 199 即手动模拟此约束）。**连续性机理**：sticky 位置是 scrollTop 的分段线性连续函数，钉住/松开切换点上两分支取值相等（松开条件即 `块底−元素高=吸顶线`），无瞬间回位——松开后元素贴包含块底边（渲染位 = `cbBottom − height`）随滚动上移；GroupHeader 贴分组尾、thead 贴表格尾、分页器位移归零，三者同速成团退出（尾部少量重叠靠 z-index 分层），与旧 clamp 轨迹逐像素同族且无 1 帧延迟。须显式保证：组尾穿越阶段 thead/分页器从**本组** pinned GroupHeader 下方穿过，GroupHeader 的 z-index 须盖住它们（与「下一组 GroupHeader 覆盖上一组 thead」是两个独立层叠点）；GroupHeader / thead / PagerRow 三者均需不透明背景。
- **1 帧延迟（外部驱动路径）**：拖外层滚动条路径仍为 scroll 事件 → 主线程写 scrollTop，与假滚动持平；滚轮悬停窗口路径为原生滚动（合成器），更顺。

## Execution Plan

### Phase 0 - 需求对齐（滚动模型修订）

Status: completed

- Add：requirement `pod-list-content-area.md` 滚动模型改为「隐藏内部滚动 + 外部同步」（:7 模型段、:280 表头吸顶、:427 边界场景），核心目标与验收面不变。Skill: none
- Proof：requirement / 本计划 / project-context 三者一致。

[x] Exit Criteria:

- [x] requirement 反映新模型且验收点清单不变
- [x] 本计划已注册 project-context Active Work
- [x] `docs/logs/` updated（见 2026-08-16 日志）

### Phase 1 - Spike：技术前提验证（门控）

Status: planned

- Proof(spike)：在 Workloads 页**真实多组数据**上最小改造验证——(a) antd Table `sticky + getContainer(内部容器) + offsetHeader`：表头吸顶、固定列、横向滚动同步，且**多张表共享同一 getContainer**（N 个 sticky 表头监听/量测叠加）表现正常；(b) 隐藏滚动条 CSS 在内部浏览器基线无 gutter/无布局残留，并确认窗口 `overflow-y: scroll` 下 `overflow-x` 的计算值（会被计算为 auto）是否在窗口层引入第二个横向滚动容器，如是则显式设 `overflow-x: hidden/clip` 并纳入隐藏滚动条处置；(c) 双向 scrollTop 同步最小回路（外→内、内→外、回环守卫）。任一点不成立即回到计划层重估（备选：修回假滚动或滚动条可见方案），不得带病铺开。Skill: none

[ ] Exit Criteria:

- [ ] 三点 spike 结论记录（当日日志），通过后方进入 Phase 2
- [ ] spike 分支代码不直接作为实现基线（结论记录后按 Phase 2 重做或重构）

### Phase 2 - 结构改造：窗口变隐藏滚动容器

Status: planned

- Fix：PinnedWindow 改 `overflow-y: scroll` + 滚动条隐藏（保留 sticky 置顶、定高、批量栏让高）；移除 Track `transform` 搬运与 `will-change`；Spacer 高度公式改为 `inner.scrollHeight − inner.clientHeight`，量测触发沿用。Skill: none
- Add：重写 `StickyScrollStage.style.ts` / `PodContentArea.style.ts` 时顺带收敛既有 token 违例（`#fff` 字面量、`calc(100vh - 56px - 24px - 52px)` 魔数——后者如保留须注明量测来源），后续 Phase 4/5 同样约束。Skill: none
- Proof：`yarn lint-type` / `yarn test`；`yarn start` 目视——两阶段滚动（Overview 滚走、窗口 pin）无跳变。Skill: none

[ ] Exit Criteria:

- [ ] 窗口内可经 scrollTop 程序化滚动且无可见滚动条；外部行程与内部可滚动量一致
- [ ] 两阶段滚动（Overview 滚走、窗口 pin）目视无跳变
- [ ] `docs/logs/` updated

### Phase 3 - 同步控制器（双向）

Status: planned

- Add：同步纯函数（clamp 映射 / 守卫判定 / epsilon 比较）+ 单测；外→内（rAF 合帧）与内→外（滚轮/focus/find 原生驱动后回写）双向同步；`overscroll-behavior` 保持链式；keep-alive effect+cleanup 与恢复重同步。Skill: none
- Proof：单测覆盖映射与守卫；`yarn start` 目视——滚轮悬停窗口原生滚动且外层滚动条跟随、拖外层滚动条内容跟随、滚到底继续滚轮可解除 pin 滚走、无回环抖动。Skill: none

[ ] Exit Criteria:

- [ ] 双向同步无回环/无失步（目视 + 单测）；链式解除 pin 正常
- [ ] `docs/logs/` updated

### Phase 4 - 原生 sticky 回归，删除自绘吸顶

Status: planned

- Fix：GroupHeader `sticky top:0`、antd Table `sticky`（getContainer + offsetHeader）、分页行 `sticky bottom:0`（窗口内原生两态：组底在窗口下方时固定、入窗后回流）；删除 `applyGroupTransforms` / `measureGroups` / `resetTransforms` / `computeGroupSticky` 系列及对应用例；删除分页 portal 与 `paginationPinnedId` / `paginationSlot`。Skill: none
- Add：分页固定态正确性的显式前提——(i) 结构不变量：PagerRow 位于表格横向滚动容器之外、GroupBlock 内无其他 overflow 容器，其最近滚动祖先 = 内部窗口（sticky 参照即窗口滚动口，实现走查项）；(ii) PagerRow sticky 需不透明背景 + 上边框（固定态下方是表格行，不遮会透底）；(iii) sticky 不脱离文档流，删除旧 `PagerRow` min-height 占位 hack（其存在理由「钉住时移出文档流」已消失）；(iv) 交接时点如实披露：原生 sticky 于「下一组顶部进入窗口底约一页行高度」时接管，旧 JS 版于「下一组成为 active 组」时切换，均满足「组底不可见时固定」，以目视验收为准。Skill: none
- Proof：`yarn lint-type` / `yarn test`（删除函数的用例同步移除，保留窗口高/pinStart 等仍用函数的用例）；`yarn start` 目视——单组吸顶、交接、表头列与固定列/横向滚动正确、短组不吸顶、分页两态（固定态遮挡不透底、回流/固定切换与组底入窗同步）、**组尾整体滚走**（header+表头+分页器同速退出、穿越本组 pinned header 不穿帮）。Skill: none

[ ] Exit Criteria:

- [ ] 吸顶/交接/分页两态行为与 requirement :280 及 08-15 计划验收点一致
- [ ] 自绘吸顶代码与门户机制删除干净（走查无残留引用）
- [ ] `docs/logs/` updated

### Phase 5 - 清理与吸收（原性能计划仍成立项）

Status: planned

- Fix：删除 `will-change`（thead/GroupHeaderPin）与自绘层叠 hack（如 z-index:16 盖 fixed 列）；context 收缩——`registerGroup`/`activeGroupId` 等按实际消费裁剪（目标：PodGroupTable 不再消费滚动控制器 context）。Skill: none
- Fix：吸收 08-16 性能计划两项仍成立条目——remeasure 的共享 rAF 去重（一帧至多一次量测）、`buildPodColumns` useMemo。Skill: none
- Proof：`yarn start` 目视各动态变化（折叠/换页/批量栏显隐）无跳变；代码走查无死代码残留。Skill: none

[ ] Exit Criteria:

- [ ] 热路径仅剩每帧一次 scrollTop 写入（代码走查确认）
- [ ] `docs/logs/` updated

### Phase 6 - 验证与文档

Status: planned

- Proof：`yarn lint-type` / `yarn lint` / `yarn test` 全绿（仅既有无关失败注明归因）。Skill: none
- Proof：`yarn start` 视觉 proof 覆盖 08-15 计划 Phase 2–5 全部验收点 + 本计划新增（双向同步、链式解除 pin、Ctrl+F/focus/键盘/选中滚动恢复、浮层不裁剪、keep-alive 恢复）。结果简记入 `docs/testing/` 留 closure audit artifact。Skill: none
- Add：更新 `docs/architecture/workspace-keep-alive.md`（:47 以假滚动 transform 重算为契约示例并交叉引用旧 requirement 模型——改为双向 scrollTop 同步控制器措辞，与本计划实现一致）。Skill: none
- Add：更新当日 `docs/logs/{year}/{month}-{day}.md`；计划关闭时更新 project-context Active Work（含 08-15/08-16 的取代关系了结）。Skill: none

[ ] Exit Criteria:

- [ ] 三命令如实记录
- [ ] 视觉 proof artifact 落 `docs/testing/`
- [ ] `docs/logs/` updated
- [ ] 独立 closure audit 完成

## Decisions

- Decision A（滚轮交互口味）：双向同步——悬停窗口时滚轮原生滚动内部并回写外层滚动条；`overscroll-behavior` 保持链式。**理由**：悬停路径为原生合成器滚动（最顺滑）；链式使「滚到底继续滚」自然解除 pin。**备选**：拦截内部滚轮统一驱动外层（行为更均一但引入事件拦截复杂度，且失去原生顺滑）。**剩余风险**：外层滚动条视觉滞后 1 帧；守卫缺陷会导致回环抖动（单测 + 目视覆盖）。
- Decision B（旧计划处置）：按用户指示不修改 08-15 / 08-16 两份计划文档；取代关系记录于本计划、`docs/context/project-context.md`（Active Work）与当日日志。08-15 未完成的视觉 proof / closure audit 出口由本计划 Phase 6 承接。**备选（被否决）**：最小幅度把两份旧计划的 Plan Status 行改为 superseded——被用户「不再修改原计划文档」指示否决，故以 project-context 指认 + 本计划 Decision 记录取代。**剩余风险**：直接打开旧计划文件看不到取代标记，须以 project-context 为入口；08-15 文档状态停留在 in progress 不再演进。
- Decision C（1 帧延迟）：外部驱动路径（拖外层滚动条）仍存在 scroll 事件→主线程写 scrollTop 的固有 1 帧延迟，与假滚动持平、不更差；悬停窗口路径无此延迟。彻底消除需 CSS scroll-driven animations，不在本切片（沿用 08-16 性能计划 Decision B 的重估条件：若落地后仍报告抖动再评估）。
- Decision D（原性能计划吸收，记账性决策）：08-16 性能计划 7 条中，节点缓存/每帧 querySelector/context 拆分/will-change 处置被本方案结构性消除；仅 remeasure rAF 去重与 columns memo 两项并入 Phase 5。无技术备选（结构性结论），剩余风险为「若本方案 spike 失败回退假滚动，须重启该性能计划」。

## Draft Review Record

- Reviewer: 独立 subagent（fresh context），2026-08-16，按 `docs/skills/plan-audit-prompt.md` 执行；代码资产清单与活代码逐条核对基本准确（含测试用例的删除/保留映射）。
- Verdict: 初审 **needs revision**（1 blocking + 2 major + 7 minor）；全部修订并入后本记录落盘，状态 → planned。
- 已并入修订：**B1**（Phase 0 记账声称失实）——以「实际完成记账」解决：project-context Active Work 注册本计划并记录取代关系、Active requirement 描述同步为新模型、当日日志追加条目，此后 Phase 0 的 `[x]` 方为真；**M1** scroll anchoring 风险 + `overflow-anchor: none` 处置 + Phase 3/5 目视项；**M2** Phase 6 增加 `workspace-keep-alive.md` 示例更新项；m1/m2 资产清单口径（每帧调用现状、复用/删除/条目作废三分、attachStickyListeners 存续、PaginationSlot 点名）；m3 spike 增补多表共享 getContainer 与 overflow-x 计算值两疑点；m4 程序化双祖先滚动风险与守卫容忍方式；m5 Phase 2 Exit Criteria 补目视项；m6 Decision B 补被否备选、Decision D 标注记账性；m7 样式重写收敛 token 违例约束。
- 残余风险：旧计划文件无取代标记（靠 project-context 入口指认）；spike 若失败需回退假滚动并重启性能计划（Decision D）；1 帧延迟（外部驱动路径）仍在（Decision C）。

## Closure Gates

- [ ] Phase 1 spike 三点结论通过并记录
- [ ] 行为等价：08-15 计划 Phase 2–5 验收点全部满足（单一可见滚动条、容器 pin、吸顶交接、分页两态、批量栏置底）
- [ ] 原生语义恢复可验收（Ctrl+F / focus / 键盘 / 选中滚动，至少目视两项）
- [ ] 双向同步无回环/失步；keep-alive 恢复正常
- [ ] 自绘吸顶/分页 portal/transform 搬运代码删除干净
- [ ] 验证命令已运行且失败项归因清晰；requirement / logs / project-context 一致
- [ ] closure audit 独立完成（非实现方）
