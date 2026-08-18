# 状态管理：XState vs constate

**真源**：`docs/context/conventions.md`（State Management: XState vs constate）。**禁止引入 Redux / Zustand / Jotai / Context-as-store。**

两套工具按「状态是否要在 React 树之外被观测/驱动」二分：

## XState —— 外部可观测 / 持久权威

- 用于必须能在 React 树**之外**读取或驱动的状态：导航上下文、暴露给 AI 能力或 qiankun 宿主的状态；以及持久状态、跨切面级联规则、localStorage 支撑的生命周期。
- 这类状态的**全部数据生命周期（初始化、异步加载、级联、持久化）都放进 machine**。React 组件是瘦消费者：`useSelector` 读、`actorRef.send()` 派发；**不要在组件里 fetch、管 loading、直接写 localStorage**。
- 需要在 React 树外访问时，在模块级 `createActor(machine, {input}).start()`，再通过 React Context 传 ref。参考 `src/contexts/navigationActor.ts` / `navigationContextMachine.ts`。

## constate —— 视图内共享

- 用于**只在 React 内部**消费、不需要外部/AI 观测的共享状态；这类状态可在 constate hook 内就地做临时数据获取与 loading。
- 页面级共享 UI 状态**默认用 constate**；只有当状态需要获得外部/AI 可观测性时才升级为 XState actor（重构成 actor，而不是从 React 里"桥"出去）。

> 注意：仓库里 XState（`src/contexts/navigation*`）已有成熟先例可模仿；constate 目前可能缺少现成范例，无先例可抄时按本节规范新建，别因此退回裸 `useState` 堆状态。

## 选型口诀

外部/AI 要看要驱动、或要持久 → XState；只在页面内几个组件间共享 → constate。
