---
name: 用户在多仓库维护前端治理
description: 用户是前端负责人，跨 CNAP2.0 与 Tiki 两个仓库维护前端规范/治理，Tiki 用 guard skill、CNAP2.0 用 docs
type: user
---

用户负责并亲自维护前端「治理体系」，横跨两个仓库：CNAP2.0（frontend-v2，规范以 `docs/context/`、`docs/design/` 等文档承载）与 Tiki（team-agents，规范额外用 `.comate/skills/frontend-change-guard` 这类 guard skill 承载）。

用户会主动对照 Tiki 的 `frontend-change-guard` skill（路由式、分场景 references、动手前输出「Prompt 质量打分卡」）作为参考模型，目标之一是约束 AI / 后端 RD 写前端时符合既有约定。

**How to apply:** 用户让"看/审查"另一个仓库的规范或 skill 时，通常是在为当前仓库做对照或借鉴，不一定要改那个被看的仓库（跨仓库改动仍需先确认，见 feedback）。讨论前端规范时可假定用户熟悉两套体系的差异，无需从零解释。
