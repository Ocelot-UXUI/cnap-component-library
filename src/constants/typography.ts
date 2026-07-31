/**
 * CNAP 2.0 字体 Token
 *
 * 分组：heading / body / caption / code
 * 字体族：正文 PingFang SC，代码 Menlo。
 * 使用时展开 spread 到 emotion 样式：`css({ ...typography.body.regular })`。
 */

const FONT_FAMILY_TEXT =
    'PingFang SC, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const FONT_FAMILY_CODE = 'Menlo, Monaco, Consolas, "Courier New", monospace';

const text = (fontSize: number, lineHeight: number, fontWeight: 400 | 500) => ({
    fontFamily: FONT_FAMILY_TEXT,
    fontSize,
    lineHeight: `${lineHeight}px`,
    fontWeight,
});

const code = (fontSize: number, lineHeight: number, fontWeight: 400 | 500) => ({
    fontFamily: FONT_FAMILY_CODE,
    fontSize,
    lineHeight: `${lineHeight}px`,
    fontWeight,
});

export const typography = {
    fontFamily: {
        text: FONT_FAMILY_TEXT,
        code: FONT_FAMILY_CODE,
    },
    heading: {
        /** H0 超大标题 32/48 Medium */
        h0: text(32, 48, 500),
        /** H1 一级大标题 28/42 Medium */
        h1: text(28, 42, 500),
        /** H2 二级大标题 24/36 Medium — 页面标题 */
        h2: text(24, 36, 500),
        /** H3 三级大标题 20/30 Medium — 指标数值、统计数字 */
        h3: text(20, 30, 500),
        /** H4 内容主标题 16/24 Medium — Tab 标签、分区标题 */
        h4: text(16, 24, 500),
    },
    body: {
        /** 正文 14/22 Regular — 正文内容、表格数据（最常用） */
        regular: text(14, 22, 400),
        /** 内容小标题 14/22 Medium — 表头、标签名称 */
        medium: text(14, 22, 500),
        /** 辅助文字 12/20 Regular */
        small: text(12, 20, 400),
        /** 辅助强调 12/20 Medium */
        smallMedium: text(12, 20, 500),
    },
    caption: {
        /** 常规注释 12/18 Regular — 分页、小型标签 */
        regular: text(12, 18, 400),
        /** 强调注释 12/18 Medium — 标签、徽章 */
        medium: text(12, 18, 500),
        /** 最小字号 10/18 Regular — 极少数场景 */
        tiny: text(10, 18, 400),
    },
    code: {
        /** 正文代码 14/22 Menlo Regular — IP 地址、代码文本 */
        regular: code(14, 22, 400),
        /** 小号代码 12/22 Menlo Regular */
        small: code(12, 22, 400),
    },
} as const;

export type Typography = typeof typography;
