# MVP

## Purpose

当前 MVP 里程碑的需求范围定义。

## Current Milestone: CNAP 2.0

### 已完成

- [x] 应用管理 (CRUD) 基础功能
- [x] 环境管理 (列表)
- [x] 集群管理 (列表)
- [x] 账号管理 (列表)
- [x] AI Agent 对话系统 (mock 模式)
- [x] AI 执行器 (四步类型: navigate/input/action/wait)
- [x] Semantic Locator 属性体系 (data-ai-*)
- [x] 7 种预设主题
- [x] i18n 中英文支持
- [x] 边框发光特效 (BorderGlow)
- [x] 光柱特效 (LightPillar)
- [x] AI 调试面板
- [x] qiankun 微前端配置

### 进行中

- [ ] CNAP 2.0 运行配置表单项 (scheme 驱动)
- [ ] CNAP 2.0 启动配置示例

### 计划中

- [ ] Agent 导航上下文能力增强
- [ ] 移除导航 fallback 自动回退
- [ ] 流水线管理功能完善
- [ ] AI 执行器接入真实 API (替换 mock)
- [ ] Capability 层接入真实后端 API
- [ ] 部署管理功能完善

## Acceptance Criteria (当前活跃切片)

### CNAP 2.0 运行配置

- 用户可通过 scheme 配置驱动的表单修改应用运行时参数
- 表单支持多种输入类型 (text, number, select, switch 等)
- 配置保存后可在详情页查看

### CNAP 2.0 启动配置

- 用户可通过 scheme 驱动的配置界面修改应用启动参数
- 提供示例 scheme 以展示配置能力

### Agent 导航上下文能力增强

- Agent 调用导航能力失败时，可获得结构化业务事实，而不是仅获得字符串错误
- 账号、应用、环境上下文关系由统一状态模型约束
- 导航失败不得自动回退到非目标路由
- fallback 移除是该需求的第一优先级
