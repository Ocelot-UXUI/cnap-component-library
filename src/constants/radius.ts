/**
 * CNAP 2.0 圆角 Token
 *
 * 命名映射 Figma：sm/md/lg/xl/xl2/xl3/xl4 → 4/6/8/12/16/20/24 px
 * antd 的 borderRadiusSM / borderRadius / borderRadiusLG 对应 sm / lg / xl。
 */

export const radius = {
    /** 4px — 标签(Tag)、进度条、小容器 */
    sm: 4,
    /** 6px — 输入框、下拉菜单 */
    md: 6,
    /** 8px — 卡片、面板、导航以及页面中其他按钮元素 */
    lg: 8,
    /** 12px — 大卡片 */
    xl: 12,
    /** 16px — 较少使用 */
    xl2: 16,
    /** 20px — 圆形按钮 */
    xl3: 20,
    /** 24px — 头像框 */
    xl4: 24,
} as const;

export type Radius = keyof typeof radius;
