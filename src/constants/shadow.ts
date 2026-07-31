/**
 * CNAP 2.0 阴影 Token
 *
 * 使用场景请参考 docs/design/design-tokens.md。
 * antd token 映射：boxShadowTertiary=xs, boxShadow=s, boxShadowSecondary=m, Drawer/Modal 显式覆盖为 l。
 */

export const shadow = {
    /** 浮动元素微投影 */
    xs: '0 1px 4px 0 rgba(0, 0, 0, 0.10)',
    /** 卡片、统计模块轻投影（最常用） */
    s: '0 4px 10px 0 rgba(0, 0, 0, 0.02)',
    /** 导航栏侧向投影 */
    m: '0 2px 12px 0 rgba(0, 0, 0, 0.10)',
    /** 抽屉面板、浮层投影 */
    l: '0 2px 20px 0 rgba(0, 0, 0, 0.20)',
} as const;

export type Shadow = keyof typeof shadow;
