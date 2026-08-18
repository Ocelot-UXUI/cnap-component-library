# 工具函数 / 纯逻辑

**真源**：`src/utils/`、`docs/context/conventions.md`。

- 工具函数保持**纯函数**（无 React、无副作用）；先 grep `src/utils/` 是否已有再新增。
- **剪贴板**：所有"复制到剪贴板"必须走 `@/utils/clipboard` 的 `copyText(text, options?)`，**禁止**直接 `navigator.clipboard.writeText` 或 `document.execCommand('copy')`。`copyText` 返回 `Promise<boolean>`，**必须 `await` 结果**再决定成功/失败反馈（`if (copyText(...))` 恒真，错）；`copyText` 只做复制不含 UI，反馈由调用方用 `message` 给。复制富文本传 `{format: 'text/html'}`。
- **AI 语义**：生成 `data-ai-*` 属性走 `@/utils/semantic` 的 `aiProps({...})`，别手拼属性——见 `ai-semantics.md`。
