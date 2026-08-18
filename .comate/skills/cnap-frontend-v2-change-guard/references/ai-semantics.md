# AI 语义 / capabilities / executor（CNAP2.0 特有）

CNAP2.0 的页面可被内置 AI agent 驱动。改交互元素、能力或执行器时都要顾及这层。**真源**：`src/utils/semantic.ts`、`src/capabilities/`、`src/executor/`、`public/ai-context.json`。

> ⚠️ **保护区（先看这条）**：`src/executor/`（`agentLoop`/`AIExecutorProvider` 等核心循环）与 capability 执行契约（`src/capabilities/types.ts` / `index.ts`）是 `ai-autonomy-policy.md` 定义的**保护区**——改动是 **plan-first**（先写 plan，需 owner doc + tests），**不要走本 skill 的快速执行**。仅给已有元素补 `data-ai-*` 标注、或按既有契约新增一个不改动执行引擎/公共契约的 capability，才算实现级改动。拿不准就停下交回 AGE。

## 1. AI 语义标注（交互元素）

可被 AI 点击/操作的元素（按钮、tab、表单项等）要带 `data-ai-*` 属性，供 executor 定位。**用 `@/utils/semantic` 的 `aiProps()` 生成，不要手拼**：

```tsx
import {aiProps} from '@/utils/semantic';
<Button {...aiProps({role: 'button', action: 'deployApplication', entity: 'application', param: appId})} />
```

产出 `data-ai-role` / `data-ai-action` / `data-ai-entity` / `data-ai-param` / `data-ai-desc`。executor 的 `navigationTool` 靠 `[data-ai-action="..."][data-ai-entity="..."]` 选 DOM——**action/entity 命名要和 capability、`ai-context.json` 对齐**。已有封装组件（如 `src/components/ai/Tabs.tsx`、`ai/Form.tsx`）已透传这些属性，优先复用。

## 2. 新增 AI 能力（capability）

在 `src/capabilities/<domain>.ts` 里实现 `Capability` 接口（`name`/`description`/`params`/`execute`），导出数组，并在 `src/capabilities/index.ts` 注册进 `allCapabilities`。`name` 与 UI 的 `data-ai-action` 保持一致。

## 3. executor（谨慎）

`src/executor/`（`AIExecutorProvider.tsx`、`agentLoop.ts`、`navigationTool.ts`、`useAIExecutor.ts`）是核心执行引擎，**大文件且与 SSE 流式协议耦合，属脆弱区**：小步改，命中 AGE planning trigger 时先写 plan（见 SKILL.md 前置让位闸）。

## 4. ai-context.json

`public/ai-context.json` 是路由/页面元数据，由 `yarn gen:ai-context` 生成——**不要手改**；页面标识/参数变化时重新生成。
