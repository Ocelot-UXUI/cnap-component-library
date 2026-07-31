# Log Writing Guide

## Purpose

每日开发日志的编写规范。

## Format

- 日志文件路径: `docs/logs/{year}/{month}-{day}.md`
- 格式: 反向时间顺序，最新条目在最上面
- 每条日志包含时间戳、简要描述和涉及的文件

## Example Entry

```markdown
## 2026-06-10

### 14:30 - AGE 初始化设置

- 创建 `docs/` 下的 AGE 目录结构
- 填充 `docs/context/` 下的所有 context 文件
- 创建 `AGENTS.md` 和 `docs/index.md`
- 填充 `docs/design/` 和 `docs/architecture/` owner docs
- 创建 `docs/backlog/README.md` 工作项列表
- Files: `AGENTS.md`, `docs/index.md`, `docs/context/*`, `docs/design/*`, `docs/architecture/*`, `docs/backlog/*`, `docs/requirements/*`
```
