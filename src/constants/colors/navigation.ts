/**
 * CNAP 2.0 侧边导航专用 Color Token
 *
 * 独立于 semantic.ts，避免与通用组件语义色混用。
 * 使用原则：
 * - 侧边导航（Sider / Menu）组件一律引用本文件的 token。
 * - 一级导航深色底 + 品牌绿选中背景 + 白色图标。
 * - 二级导航白底 + 灰色选中 / hover。
 */

import {brand, gray, navigation as navPalette} from './palette';

export const sidebar = {
    level1: {
        /** 一级导航深色背景 */
        bg: navPalette[9], // #1C202B
        /** 一级导航选中态背景（品牌薄荷绿） */
        selectedBg: brand[3], // #A7F3CF
        /** 一级导航 hover 态背景（品牌薄荷绿 30% 透明） */
        hoverBg: 'rgba(167, 243, 207, 0.3)',
        /** 深色背景上的图标 */
        icon: gray[0], // #FFFFFF
    },
    level2: {
        /** 二级导航面板背景 */
        bg: gray[0], // #FFFFFF
        /** 二级导航选中态背景（浅灰） */
        selectedBg: gray[3], // #E8E8E8
        /** 二级导航 hover 态背景 */
        hoverBg: gray[2], // #F2F2F2
    },
    text: {
        /** 选中菜单文字 / 主要内容文字 / 选中图标 */
        primary: gray[10], // #181818
        /** 未选中菜单文字 / 未选中图标 */
        secondary: gray[8], // #545454
        /** 辅助图标 */
        tertiary: gray[7], // #8F8F8F
    },
    border: {
        /** 主分割线 */
        default: gray[4], // #D9D9D9
        /** 轻量分割（与二级选中背景同色） */
        subtle: gray[3], // #E8E8E8
    },
} as const;

export type Sidebar = typeof sidebar;
