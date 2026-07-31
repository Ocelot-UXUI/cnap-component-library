/**
 * CNAP 2.0 间距 Token
 *
 * 命名映射 Figma：2xs/xs/s/m/l/xl/2xl…9xl → xs2/xs/s/m/l/xl/xl2…xl9
 * 值单位为 px。
 */

export const spacing = {
    /** 0px — 最小间距 */
    xs2: 0,
    /** 4px — 图标与文字间距、紧凑列表行内间距 */
    xs: 4,
    /** 8px — 卡片内元素间距、标签间距 */
    s: 8,
    /** 12px — 按钮、文字间距 */
    m: 12,
    /** 16px — 模块、组件、模块间距 */
    l: 16,
    /** 20px — 表单间距、较少使用 */
    xl: 20,
    /** 24px — 区块间距 */
    xl2: 24,
    /** 28px — 区块间距 */
    xl3: 28,
    /** 32px — 区块、页面留白、全屏/容器留白间距 */
    xl4: 32,
    /** 36px — 大区块间距 */
    xl5: 36,
    /** 40px — 大区块间距 */
    xl6: 40,
    /** 44px — 大区块间距 */
    xl7: 44,
    /** 48px — 大区块间距 */
    xl8: 48,
    /** 64px — 侧边栏内边距、大间距 */
    xl9: 64,
} as const;

export type Spacing = keyof typeof spacing;
