/**
 * CNAP 2.0 语义化 Color Token
 *
 * 分组：bg / border / text / icon / button / state
 * 使用原则：
 * - 组件层的样式一律引用本文件中的 semantic token，不直接引用 palette。
 * - 状态色 (state) 包含品牌 (brand) / 成功 / 警示 / 错误 / 信息，每组 6 阶：
 *   default / hover / active / disabled / focus / light
 * - 通用组件状态 (state.component) 用于收敛边框 / hover / focus / 下拉背景等，
 *   避免品牌绿污染 Input / Select / Menu / Table 等中性交互面。
 */

import {brand, error, gray, navigation, primary, success, warning} from './palette';

export const bg = {
    /** 页面底色、分栏底色 */
    page: navigation[1], // #F5F7FA
    /** 组件 / 卡片背景 */
    default: gray[0], // #FFFFFF
} as const;

export const border = {
    /** 分割线 */
    divider: gray[3], // #E8E8E8
    /** 页面卡片外边框 */
    card: gray[4], // #D9D9D9
    /** 卡片边框 hover */
    cardHover: gray[6], // #BFBFBF
} as const;

export const text = {
    /** 主要正文 / 标题 */
    primary: gray[10], // #181818
    /** 次要 / 说明文字 */
    secondary: gray[8], // #545454
    /** 辅助 / 提示文字 */
    tertiary: gray[7], // #8F8F8F
    /** 输入框占位符 */
    placeholder: gray[6], // #BFBFBF
    /** 禁用文字 */
    disabled: gray[5], // #CCCCCC
    /** 深色背景上的文字 */
    inverse: gray[0], // #FFFFFF
    /** 链接文字 */
    link: primary[6], // #0080FF
} as const;

export const icon = {
    primary: gray[10], // #181818
    secondary: gray[8], // #545454
    tertiary: gray[7], // #8F8F8F
    disabled: gray[6], // #BFBFBF
    inverse: gray[0], // #FFFFFF
    /** 品牌图标色，用于复选框选中图标 */
    brand: brand[3], // #A7F3CF
} as const;

export const button = {
    primary: {
        /** 主要按钮默认背景（深色） */
        bg: navigation[9], // #1C202B
        bgHover: navigation[8], // #363940
        bgFocus: navigation[10], // #0D0F14
        /** 主要按钮文字（薄荷绿） */
        text: brand[3], // #A7F3CF
    },
    secondary: {
        bg: gray[0], // #FFFFFF
        bgHover: gray[1], // #F7F7F7
        bgFocus: gray[2], // #F2F2F2
        border: gray[5], // #CCCCCC
        text: gray[10], // #181818
    },
} as const;

const stateGroup = <T extends { 1: string; 2: string; 3: string; 5: string; 6: string; 7: string; }>(scale: T) => ({
    default: scale[6],
    hover: scale[5],
    active: scale[7],
    disabled: scale[3],
    focus: scale[2],
    light: scale[1],
});

export const state = {
    /**
     * 通用组件交互状态色（关键！）
     * Figma「组件状态色」区规定：边框 / 下拉背景 / focus 等**不走品牌色**，
     * 因此这些 token 全部锁定为中性灰或明确的语义色，避免被 antd primary 派生染绿。
     */
    component: {
        /** 默认边框 */
        borderDefault: gray[4], // #D9D9D9
        /** 边框 hover */
        borderHover: gray[6], // #BFBFBF
        /** 焦点轮廓 / 选中边框（黑色，非品牌绿） */
        borderFocus: gray[10], // #181818
        /** 错误状态边框 */
        borderError: error[6], // #E62C4B
        /** 下拉框边框 */
        selectBorder: gray[4], // #D9D9D9
        /** 下拉背景 hover（灰，非绿） */
        selectHover: gray[2], // #F2F2F2
        /** 下拉选中背景（浅品牌绿） */
        selectActive: brand[1], // #E6FAF1
        /** 禁用背景 */
        disabledBg: gray[1], // #F7F7F7
    },
    /** 品牌状态色（Switch / Radio / Checkbox / Progress / Slider 强调） */
    brand: {
        default: brand[6], // #41D08D
        hover: brand[5], // #54DA9B
        active: brand[7], // #2FC27C
        disabled: brand[3], // #A7F3CF
        focus: brand[2], // #DCFAEC
        light: brand[1], // #E6FAF1
    },
    /** 信息 (Info)：Figma 与 antd colorLink / colorInfo 对齐 */
    info: stateGroup(primary),
    success: stateGroup(success),
    warning: stateGroup(warning),
    error: stateGroup(error),
} as const;

/**
 * 日志控制台（深色）专用语义色。
 * 控制台为深色背景，级别色需比 palette 默认阶更亮，故单列一组，禁止组件内 hex。
 */
export const logConsole = {
    /** 控制台背景（近黑） */
    bg: navigation[10], // #0D0F14
    /** 日志正文 */
    text: gray[2], // #F2F2F2
    /** 时间戳 */
    timestamp: gray[6], // #BFBFBF
    /** 最新日志分隔标记线 */
    marker: brand[5], // #54DA9B
    /** 搜索命中高亮底色 */
    highlightBg: warning[4], // #FFBD66
    /** 搜索命中高亮文字 */
    highlightText: gray[10], // #181818
    /** 级别着色 */
    level: {
        info: success[5], // #2BD98B
        warn: warning[5], // #FFA333
        error: error[5], // #F36D78
        debug: gray[6], // #BFBFBF
    },
} as const;

export const semantic = {
    bg,
    border,
    text,
    icon,
    button,
    state,
    logConsole,
} as const;

export type Semantic = typeof semantic;
