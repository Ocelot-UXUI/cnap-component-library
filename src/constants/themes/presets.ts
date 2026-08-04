/* eslint-disable max-lines */
/* eslint-disable max-len */
import {theme as antdTheme} from 'antd';
import type {ThemeConfig} from 'antd';

import {palette, semantic, sidebar} from '../colors';
import {radius} from '../radius';
import {shadow} from '../shadow';
import {typography} from '../typography';

// Focus 环 / 遮罩层的 alpha 派生值，只在本 preset 使用，就地组合以避免污染 palette / semantic
const FOCUS_OUTLINE = 'rgba(24, 24, 24, 0.06)';
const ERROR_FOCUS_OUTLINE = 'rgba(230, 44, 75, 0.10)';
const BG_MASK = 'rgba(28, 32, 43, 0.45)';

export type ThemeKey =
    | 'cnap2'
    | 'blue'
    | 'linear'
    | 'liquidGlass'
    | 'pixelRetro'
    | 'pinkCute'
    | 'minimalist'
    | 'luxuryGold';

// 自定义样式配置（不属于 ThemeConfig）
export interface CustomThemeStyles {
    card?: {
        root?: string;
    };
    modal?: {
        section?: string;
    };
    button?: {
        root?: string;
    };
    input?: {
        root?: string;
    };
}

export const themePresets: Record<ThemeKey, ThemeConfig> = {
    // CNAP 2.0 视觉规范基线主题（source: docs/design/design-tokens.md）
    // 关键决策：品牌绿 (colorPrimary=#41D08D) 仅出现在 Switch/Radio/Progress 等强调组件；
    // Input/Select/Menu 等中性交互面通过 controlItemBgHover/controlOutline 等 alias token
    // 收敛为灰/黑，避免品牌色污染。详见 design-tokens.md 的"污染防护"章节。
    cnap2: {
        algorithm: antdTheme.defaultAlgorithm,
        token: {
            colorPrimary: palette.brand[6],
            colorInfo: palette.primary[6],
            colorSuccess: palette.success[6],
            colorWarning: palette.warning[6],
            colorError: palette.error[6],
            colorLink: palette.primary[6],
            colorLinkHover: palette.primary[5],
            colorLinkActive: palette.primary[7],
            colorText: semantic.text.primary,
            colorTextSecondary: semantic.text.secondary,
            colorTextTertiary: semantic.text.tertiary,
            colorTextQuaternary: palette.gray[6],
            colorTextPlaceholder: semantic.text.placeholder,
            colorTextDisabled: semantic.text.disabled,
            colorTextLightSolid: semantic.text.inverse,
            colorBgBase: semantic.bg.default,
            colorBgContainer: semantic.bg.default,
            colorBgElevated: semantic.bg.default,
            colorBgLayout: semantic.bg.page,
            colorBgSpotlight: palette.navigation[9],
            colorBgMask: BG_MASK,
            colorBorder: semantic.border.card,
            colorBorderSecondary: semantic.border.divider,
            colorSplit: semantic.border.divider,
            colorFill: palette.gray[2],
            colorFillSecondary: palette.gray[1],
            colorFillTertiary: palette.gray[1],
            colorFillQuaternary: palette.gray[1],
            // 关键：这四个 alias token 阻断 colorPrimary 派生链路的绿色污染
            controlItemBgActive: palette.brand[1],
            controlItemBgActiveHover: palette.brand[2],
            controlItemBgHover: palette.gray[2],
            controlOutline: FOCUS_OUTLINE,
            controlTmpOutline: FOCUS_OUTLINE,
            borderRadius: radius.lg,
            borderRadiusSM: radius.sm,
            borderRadiusLG: radius.xl,
            borderRadiusXS: radius.sm,
            fontFamily: typography.fontFamily.text,
            fontFamilyCode: typography.fontFamily.code,
            fontSize: 14,
            fontSizeLG: 16,
            controlHeight: 32,
            controlHeightSM: 24,
            controlHeightLG: 40,
            boxShadow: shadow.s,
            boxShadowSecondary: shadow.m,
            boxShadowTertiary: shadow.xs,
            wireframe: false,
            motion: true,
        },
        components: {
            Button: {
                colorPrimary: palette.navigation[9],
                colorPrimaryHover: palette.navigation[8],
                colorPrimaryActive: palette.navigation[10],
                colorPrimaryBorder: palette.navigation[9],
                primaryColor: palette.brand[3],
                colorTextLightSolid: palette.brand[3],
                defaultBg: semantic.bg.default,
                defaultColor: semantic.text.primary,
                defaultBorderColor: palette.gray[5],
                defaultHoverBg: palette.gray[1],
                defaultHoverColor: semantic.text.primary,
                defaultHoverBorderColor: palette.gray[6],
                defaultActiveBg: palette.gray[2],
                defaultActiveBorderColor: palette.gray[7],
                borderRadius: radius.lg,
                onlyIconSize: '16px'
            },
            Input: {
                colorBorder: semantic.state.component.borderDefault,
                hoverBorderColor: semantic.state.component.borderHover,
                activeBorderColor: semantic.state.component.borderFocus,
                activeShadow: `0 0 0 2px ${FOCUS_OUTLINE}`,
                errorActiveShadow: `0 0 0 2px ${ERROR_FOCUS_OUTLINE}`,
                colorTextPlaceholder: semantic.text.placeholder,
                borderRadius: radius.md,
            },
            InputNumber: {
                colorBorder: semantic.state.component.borderDefault,
                hoverBorderColor: semantic.state.component.borderHover,
                activeBorderColor: semantic.state.component.borderFocus,
                activeShadow: `0 0 0 2px ${FOCUS_OUTLINE}`,
                borderRadius: radius.md,
            },
            Select: {
                colorBorder: semantic.state.component.borderDefault,
                // 切断 Select 内部 primary 派生（否则 hover/focus 会变绿）
                colorPrimary: semantic.state.component.borderFocus,
                colorPrimaryHover: semantic.state.component.borderHover,
                controlOutline: FOCUS_OUTLINE,
                optionSelectedBg: semantic.state.component.selectActive,
                optionSelectedColor: semantic.text.primary,
                optionActiveBg: semantic.state.component.selectHover,
                borderRadius: radius.md,
            },
            TreeSelect: {
                nodeSelectedBg: semantic.state.component.selectActive,
                nodeHoverBg: semantic.state.component.selectHover,
            },
            Tree: {
                nodeSelectedBg: semantic.state.component.selectActive,
                nodeHoverBg: semantic.state.component.selectHover,
                directoryNodeSelectedBg: semantic.state.component.selectActive,
                directoryNodeSelectedColor: semantic.text.primary,
            },
            Cascader: {
                controlItemBgActive: semantic.state.component.selectActive,
                controlItemBgHover: semantic.state.component.selectHover,
            },
            DatePicker: {
                colorBorder: semantic.state.component.borderDefault,
                hoverBorderColor: semantic.state.component.borderHover,
                activeBorderColor: semantic.state.component.borderFocus,
                activeShadow: `0 0 0 2px ${FOCUS_OUTLINE}`,
                cellHoverBg: semantic.state.component.selectHover,
                cellActiveWithRangeBg: semantic.state.component.selectActive,
                borderRadius: radius.md,
            },
            Mentions: {
                colorBorder: semantic.state.component.borderDefault,
                hoverBorderColor: semantic.state.component.borderHover,
                activeBorderColor: semantic.state.component.borderFocus,
            },
            Checkbox: {
                colorPrimary: palette.brand[6],
                colorPrimaryHover: palette.brand[5],
                colorPrimaryBorder: palette.brand[6],
                colorWhite: semantic.icon.brand,
            },
            Radio: {
                colorPrimary: palette.brand[6],
                colorPrimaryHover: palette.brand[5],
                dotColorDisabled: semantic.text.disabled,
            },
            Switch: {
                colorPrimary: palette.brand[6],
                colorPrimaryHover: palette.brand[5],
                colorTextQuaternary: palette.gray[4],
            },
            Slider: {
                colorPrimary: palette.brand[6],
                colorPrimaryBorder: palette.brand[3],
                colorPrimaryBorderHover: palette.brand[5],
                handleColor: palette.brand[6],
                handleActiveColor: palette.brand[7],
                trackBg: palette.brand[6],
                trackHoverBg: palette.brand[5],
                railBg: palette.gray[3],
                railHoverBg: palette.gray[4],
                dotActiveBorderColor: palette.brand[6],
            },
            Progress: {
                colorSuccess: palette.success[6],
                defaultColor: palette.brand[6],
            },
            Segmented: {
                itemSelectedBg: semantic.bg.default,
                itemSelectedColor: semantic.text.primary,
                itemHoverBg: semantic.state.component.selectHover,
                itemHoverColor: semantic.text.primary,
                itemActiveBg: semantic.state.component.selectHover,
                trackBg: semantic.bg.page,
            },
            Tabs: {
                inkBarColor: semantic.state.component.borderFocus,
                itemActiveColor: semantic.text.primary,
                itemHoverColor: semantic.text.primary,
                itemSelectedColor: semantic.text.primary,
                itemColor: semantic.text.secondary,
            },
            Anchor: {
                colorPrimary: semantic.text.primary,
            },
            Menu: {
                itemBg: 'transparent',
                itemColor: semantic.text.secondary,
                itemHoverColor: semantic.text.primary,
                itemHoverBg: semantic.state.component.selectHover,
                itemSelectedColor: semantic.text.primary,
                itemSelectedBg: semantic.border.divider,
                itemActiveBg: semantic.state.component.selectHover,
                itemBorderRadius: radius.lg,
                horizontalItemHoverColor: semantic.text.primary,
                horizontalItemSelectedColor: semantic.text.primary,
            },
            Layout: {
                bodyBg: semantic.bg.page,
                headerBg: semantic.bg.default,
                siderBg: sidebar.level1.bg,
                triggerBg: palette.navigation[8],
            },
            Card: {
                borderRadiusLG: radius.xl,
                colorBorderSecondary: semantic.border.divider,
                boxShadowTertiary: shadow.s,
            },
            Table: {
                headerBg: semantic.bg.page,
                headerColor: semantic.text.primary,
                rowHoverBg: palette.warning[1],
                rowSelectedBg: palette.brand[1],
                rowSelectedHoverBg: palette.brand[2],
                borderColor: semantic.border.divider,
                borderRadius: radius.lg,
            },
            Pagination: {
                colorPrimary: semantic.text.primary,
                colorPrimaryHover: semantic.text.secondary,
                itemActiveBg: semantic.state.component.selectHover,
            },
            Modal: {
                borderRadiusLG: radius.xl,
                boxShadow: shadow.l,
            },
            Drawer: {
                boxShadow: shadow.l,
            },
            Tag: {
                borderRadiusSM: radius.sm,
                defaultBg: semantic.state.component.selectHover,
                defaultColor: semantic.text.primary,
            },
            Tooltip: {
                colorBgSpotlight: palette.navigation[9],
                colorTextLightSolid: semantic.text.inverse,
                borderRadius: radius.md,
            },
            Message: {
                borderRadiusLG: radius.lg,
            },
            Notification: {
                borderRadiusLG: radius.xl,
            },
            Form: {
                labelColor: semantic.text.primary,
            },
        },
    },
    blue: {
        token: {
            colorPrimary: '#1677ff',
        },
    },
    // Linear.app 风格：Inter 字体 + 紫蓝主色 + 极细边框 + 多层微阴影
    linear: {
        algorithm: antdTheme.defaultAlgorithm,
        token: {
            colorPrimary: '#5E6AD2',
            colorSuccess: '#4CAF50',
            colorWarning: '#F59E0B',
            colorError: '#EF4444',
            colorInfo: '#5E6AD2',
            colorTextBase: '#111111',
            colorBgBase: '#ffffff',
            colorBgContainer: '#ffffff',
            colorBgElevated: '#ffffff',
            colorBgLayout: '#F7F7F8',
            colorBgSpotlight: '#1a1a1a',
            colorText: '#111111',
            colorTextSecondary: '#6B6F7A',
            colorTextTertiary: '#9CA3AF',
            colorTextQuaternary: '#C4C8D0',
            colorBorder: '#E5E7EB',
            colorBorderSecondary: '#F3F4F6',
            borderRadius: 6,
            borderRadiusXS: 3,
            borderRadiusSM: 4,
            borderRadiusLG: 10,
            boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
            boxShadowSecondary: '0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08)',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: 14,
            fontSizeSM: 12,
            fontSizeLG: 15,
            lineHeight: 1.5,
        },
        components: {
            Card: {
                boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
                borderRadiusLG: 8,
            },
            Modal: {
                boxShadow: '0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
                borderRadiusLG: 10,
            },
            Button: {
                borderRadius: 6,
                fontWeight: 500,
            },
            Input: {
                borderRadius: 6,
            },
            Select: {
                borderRadius: 6,
            },
            Table: {
                headerBg: '#F7F7F8',
                headerColor: '#6B6F7A',
                borderColor: '#E5E7EB',
                rowHoverBg: '#F7F7F8',
            },
            Menu: {
                itemBorderRadius: 6,
                itemHeight: 32,
                subMenuItemBorderRadius: 6,
            },
            Tabs: {
                horizontalItemGutter: 24,
            },
        },
    },
    liquidGlass: {
        algorithm: antdTheme.defaultAlgorithm,
        token: {
            colorPrimary: '#3b82f6',
            colorSuccess: '#22c55e',
            colorWarning: '#f59e0b',
            colorError: '#ef4444',
            colorInfo: '#3b82f6',
            colorTextBase: '#1e293b',
            colorBgBase: '#f8fafc',
            colorText: '#1e293b',
            colorTextSecondary: '#475569',
            colorTextTertiary: '#94a3b8',
            colorTextQuaternary: '#cbd5e1',
            colorBgContainer: 'rgba(255,255,255,0.68)',
            colorBgElevated: 'rgba(255,255,255,0.82)',
            colorBgLayout: '#f0f4ff',
            colorBorder: 'rgba(147, 197, 253, 0.55)',
            colorBorderSecondary: 'rgba(147, 197, 253, 0.3)',
            borderRadius: 16,
            borderRadiusXS: 4,
            borderRadiusSM: 8,
            borderRadiusLG: 24,
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.12)',
            boxShadowSecondary: '0 12px 48px rgba(59, 130, 246, 0.18)',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
        components: {
            Card: {
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.12)',
            },
            Modal: {
                boxShadow: '0 12px 48px rgba(59, 130, 246, 0.18)',
            },
            Button: {
                borderRadius: 12,
            },
            Input: {
                borderRadius: 8,
            },
        },
    },
    pixelRetro: {
        algorithm: antdTheme.defaultAlgorithm,
        token: {
            colorPrimary: '#ff4757',
            colorSuccess: '#2ed573',
            colorWarning: '#ffa502',
            colorError: '#ff4757',
            colorInfo: '#5f27cd',
            colorTextBase: '#2f3542',
            colorBgBase: '#f1f2f6',
            colorPrimaryBg: '#ff475720',
            colorPrimaryBgHover: '#ff475730',
            colorPrimaryBorder: '#ff4757',
            colorPrimaryBorderHover: '#ff4757',
            colorPrimaryHover: '#ff6b81',
            colorPrimaryActive: '#ee5253',
            colorPrimaryText: '#ff4757',
            colorPrimaryTextHover: '#ff6b81',
            colorPrimaryTextActive: '#ee5253',
            colorSuccessBg: '#2ed57320',
            colorSuccessBgHover: '#2ed57330',
            colorSuccessBorder: '#2ed573',
            colorSuccessBorderHover: '#2ed573',
            colorSuccessHover: '#7bed9f',
            colorSuccessActive: '#1e90ff',
            colorSuccessText: '#2ed573',
            colorSuccessTextHover: '#7bed9f',
            colorSuccessTextActive: '#1e90ff',
            colorWarningBg: '#ffa50220',
            colorWarningBgHover: '#ffa50230',
            colorWarningBorder: '#ffa502',
            colorWarningBorderHover: '#ffa502',
            colorWarningHover: '#ffdd59',
            colorWarningActive: '#ff9f43',
            colorWarningText: '#ffa502',
            colorWarningTextHover: '#ffdd59',
            colorWarningTextActive: '#ff9f43',
            colorErrorBg: '#ff475720',
            colorErrorBgHover: '#ff475730',
            colorErrorBorder: '#ff4757',
            colorErrorBorderHover: '#ff4757',
            colorErrorHover: '#ff6b81',
            colorErrorActive: '#ee5253',
            colorErrorText: '#ff4757',
            colorErrorTextHover: '#ff6b81',
            colorErrorTextActive: '#ee5253',
            colorInfoBg: '#5f27cd20',
            colorInfoBgHover: '#5f27cd30',
            colorInfoBorder: '#5f27cd',
            colorInfoBorderHover: '#5f27cd',
            colorInfoHover: '#a55eea',
            colorInfoActive: '#341f97',
            colorInfoText: '#5f27cd',
            colorInfoTextHover: '#a55eea',
            colorInfoTextActive: '#341f97',
            colorText: '#2f3542',
            colorTextSecondary: '#57606f',
            colorTextTertiary: '#747d8c',
            colorTextQuaternary: '#a4b0be',
            colorBgContainer: '#f1f2f6',
            colorBgElevated: '#ffffff',
            colorBgLayout: '#dfe4ea',
            colorBgSpotlight: '#2f3542',
            colorBorder: '#ced6e0',
            colorBorderSecondary: '#dfe4ea',
            borderRadius: 0,
            borderRadiusXS: 0,
            borderRadiusSM: 0,
            borderRadiusLG: 0,
        },
        components: {
            Button: {
                lineWidth: 2,
            },
            Card: {
                lineWidth: 2,
            },
            Input: {
                lineWidth: 2,
            },
        },
    },
    pinkCute: {
        algorithm: antdTheme.defaultAlgorithm,
        'token': {
            'colorPrimary': '#ff85c0',
            'colorSuccess': '#52c41a',
            'colorWarning': '#faad14',
            'colorError': '#ff4d4f',
            'colorInfo': '#ff85c0',
            'colorTextBase': '#4d3b5c',
            'colorBgBase': '#fff0f6',
            'colorPrimaryBg': '#ffe8f4',
            'colorPrimaryBgHover': '#ffd6eb',
            'colorPrimaryBorder': '#ffb8db',
            'colorPrimaryBorderHover': '#ff99c7',
            'colorPrimaryHover': '#ff66b3',
            'colorPrimaryActive': '#e60073',
            'colorPrimaryText': '#ff85c0',
            'colorPrimaryTextHover': '#ff66b3',
            'colorPrimaryTextActive': '#e60073',
            'colorText': 'rgba(77, 59, 92, 0.88)',
            'colorTextSecondary': 'rgba(77, 59, 92, 0.65)',
            'colorTextTertiary': 'rgba(77, 59, 92, 0.45)',
            'colorTextQuaternary': 'rgba(77, 59, 92, 0.25)',
            'colorBgContainer': '#fff0f6',
            'colorBgElevated': '#ffffff',
            'colorBgLayout': '#ffe8f4',
            'colorBorder': '#ffd6eb',
            'colorBorderSecondary': '#ffe8f4',
            'borderRadius': 20,
            'borderRadiusXS': 6,
            'borderRadiusSM': 12,
            'borderRadiusLG': 28,
            'boxShadow': '0 4px 12px 0 rgba(255, 133, 192, 0.12)',
            'boxShadowSecondary': '0 8px 20px 0 rgba(255, 133, 192, 0.16)',
            'padding': 20,
            'paddingSM': 16,
            'paddingLG': 28,
            'margin': 20,
            'marginSM': 16,
            'marginLG': 28,
        },
    },
    minimalist: {
        algorithm: antdTheme.defaultAlgorithm,
        token: {
            colorPrimary: '#000000',
            colorSuccess: '#006644',
            colorWarning: '#b8860b',
            colorError: '#8b0000',
            colorInfo: '#333333',
            colorTextBase: '#2a2a2a',
            colorBgBase: '#ffffff',
            colorBgContainer: '#fafafa',
            colorBgElevated: '#ffffff',
            colorBgLayout: '#f5f5f5',
            colorBorder: '#e8e8e8',
            colorBorderSecondary: '#f0f0f0',
            borderRadius: 2,
            borderRadiusXS: 0,
            borderRadiusSM: 1,
            borderRadiusLG: 4,
        },
        components: {
            Card: {
                boxShadow: 'none',
            },
            Modal: {
                boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.04)',
            },
        },
    },
    luxuryGold: {
        algorithm: antdTheme.defaultAlgorithm,
        token: {
            colorPrimary: '#FFD700',
            colorSuccess: '#00D084',
            colorWarning: '#FF8C00',
            colorError: '#FF0040',
            colorInfo: '#FFD700',
            colorTextBase: '#8B4513',
            colorBgBase: '#FFFDF7',
            colorPrimaryBg: '#FFF9E6',
            colorPrimaryBgHover: '#FFF4CC',
            colorPrimaryBorder: '#FFE066',
            colorPrimaryBorderHover: '#FFD633',
            colorPrimaryHover: '#FFC400',
            colorPrimaryActive: '#E6B800',
            colorPrimaryText: '#B8860B',
            colorPrimaryTextHover: '#996D00',
            colorPrimaryTextActive: '#664600',
            colorSuccessBg: '#E6FFF2',
            colorSuccessBgHover: '#B3FFDD',
            colorSuccessBorder: '#00D084',
            colorSuccessBorderHover: '#00A868',
            colorSuccessHover: '#00B36B',
            colorSuccessActive: '#008C52',
            colorSuccessText: '#006B3C',
            colorSuccessTextHover: '#004C2A',
            colorSuccessTextActive: '#00331D',
            colorWarningBg: '#FFF9E6',
            colorWarningBgHover: '#FFF4CC',
            colorWarningBorder: '#FFB84D',
            colorWarningBorderHover: '#FF9933',
            colorWarningHover: '#FF8000',
            colorWarningActive: '#CC6600',
            colorWarningText: '#994C00',
            colorWarningTextHover: '#663300',
            colorWarningTextActive: '#331A00',
            colorErrorBg: '#FFE6E6',
            colorErrorBgHover: '#FFB3B3',
            colorErrorBorder: '#FF6666',
            colorErrorBorderHover: '#FF3333',
            colorErrorHover: '#FF1A1A',
            colorErrorActive: '#CC0000',
            colorErrorText: '#990000',
            colorErrorTextHover: '#660000',
            colorErrorTextActive: '#330000',
            colorInfoBg: '#FFF9E6',
            colorInfoBgHover: '#FFF4CC',
            colorInfoBorder: '#FFE066',
            colorInfoBorderHover: '#FFD633',
            colorInfoHover: '#FFC400',
            colorInfoActive: '#E6B800',
            colorInfoText: '#B8860B',
            colorInfoTextHover: '#996D00',
            colorInfoTextActive: '#664600',
            colorText: '#8B4513',
            colorTextSecondary: '#A0522D',
            colorTextTertiary: '#CD853F',
            colorTextQuaternary: '#DEB887',
            colorBgContainer: '#FFFDF7',
            colorBgElevated: '#FFFDF7',
            colorBgLayout: '#FFFEFB',
            colorBgSpotlight: 'rgba(255, 215, 0, 0.85)',
            colorBorder: '#FFD700',
            colorBorderSecondary: '#F5DEB3',
            borderRadius: 12,
            borderRadiusXS: 4,
            borderRadiusSM: 8,
            borderRadiusLG: 16,
        },
        components: {
            Card: {
                boxShadow: '0 4px 16px 0 rgba(255, 215, 0, 0.3)',
            },
            Modal: {
                boxShadow: '0 8px 24px 0 rgba(255, 215, 0, 0.4)',
            },
        },
    },
};

export const themeOptions = [
    { key: 'cnap2' as ThemeKey, label: 'CNAP 2.0', color: palette.brand[6] },
    { key: 'blue' as ThemeKey, label: '蓝色', color: '#1677ff' },
    { key: 'linear' as ThemeKey, label: 'Linear', color: '#5E6AD2' },
    { key: 'liquidGlass' as ThemeKey, label: '液态玻璃', color: '#3b82f6' },
    { key: 'pixelRetro' as ThemeKey, label: '像素复古', color: '#ff4757' },
    { key: 'pinkCute' as ThemeKey, label: '粉色可爱', color: '#ff66b3' },
    { key: 'minimalist' as ThemeKey, label: '极简主义', color: '#000000' },
    { key: 'luxuryGold' as ThemeKey, label: '土豪金', color: '#FFD700' },
];

// 液态玻璃主题的自定义样式类名（可选配置）
export const liquidGlassStyles: CustomThemeStyles = {
    card: {
        root: 'backdrop-blur-xl bg-white/30 border border-white/40 shadow-xl',
    },
    modal: {
        section: 'backdrop-blur-xl bg-white/35 border border-white/45 shadow-2xl',
    },
    button: {
        root:
            'backdrop-blur-lg bg-white/25 border border-white/40 shadow-lg hover:bg-white/35 active:bg-white/45 transition-all',
    },
    input: {
        root:
            'backdrop-blur-md bg-white/20 border border-white/30 shadow-sm hover:bg-white/25 focus:bg-white/30 transition-all',
    },
};

// 像素复古主题的自定义样式类名（可选配置）
export const pixelRetroStyles: CustomThemeStyles = {
    button: {
        root: 'border-2',
    },
    card: {
        root: 'border-2',
    },
    input: {
        root: 'border-2',
    },
};
