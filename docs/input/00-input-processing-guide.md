# Input Processing Guide

## Purpose

本指南说明在原始源材料成为需求之前如何处理它们。

## Rule

当源材料仍然混合了业务目标、UI 示例、实现猜测、缺失假设和半确定范围时，不要直接从大型原始输入转储要求 AI 编码。

## Recommended Flow

1. 将原始材料存储在 `docs/input/` 中。
2. 标记源类型：PM 笔记、卡片文档、原型、文章或混合源。
3. 将未解决的问题写入 `docs/discussions/`。
4. 将合成结果写入 `docs/requirements/`。

## Source Classification

- `source-pm-*.md` — 产品经理笔记
- `source-prototype-*.md` — 原型解读
- `source-cardset-*.md` — 卡片或结构化需求文档
- `source-article-*.md` — 外部文章或参考资料

## Caution

强结构化源材料有用，但仍可能无法回答：

- 当前迭代的实际范围边界
- 业务决策所需的领域判断
- 哪些交互是核心的还是可选的
- 原型是否完整到可以直接构建

## File Header Convention

每个放置在此目录中的输入文件应以标头开始：

```
status: new | supplement | supersedes <filename>
processed: pending | partial | done
```

- `status` 描述文件与其他输入的关系
- `processed` 跟踪此输入是否已被消费

如果人类放置没有此标头的文件，AI 应该：

1. 阅读文件内容
2. 从内容和上下文推断状态
3. 添加推断的标头并注明是 AI 推断的
4. 继续处理
