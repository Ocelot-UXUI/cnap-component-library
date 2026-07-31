/**
 * CNAP 2.0 原子色板（Palette）
 *
 * 每个色板 10 阶（gray 11 阶，包含 gray[0] = 纯白），键为 Figma 编号。
 * 命名与用途请参考 docs/design/design-tokens.md。
 *
 * 使用原则：
 * - 组件层禁止直接引用 palette，一律走 semantic / navigation。
 * - palette 仅供 semantic.ts / navigation.ts / themes/presets.ts 内部消费。
 */

export const gray = {
    0: '#FFFFFF',
    1: '#F7F7F7',
    2: '#F2F2F2',
    3: '#E8E8E8',
    4: '#D9D9D9',
    5: '#CCCCCC',
    6: '#BFBFBF',
    7: '#8F8F8F',
    8: '#545454',
    9: '#2E2E2E',
    10: '#181818',
} as const;

export const primary = {
    1: '#E5F2FF',
    2: '#CCE5FF',
    3: '#99CCFF',
    4: '#66B2FF',
    5: '#3399FF',
    6: '#0080FF',
    7: '#0066CC',
    8: '#004D99',
    9: '#003366',
    10: '#001A33',
} as const;

/** 品牌绿：Brand-03 (#A7F3CF) 为薄荷绿，Brand-06 (#41D08D) 为标准品牌色 */
export const brand = {
    1: '#E6FAF1',
    2: '#DCFAEC',
    3: '#A7F3CF',
    4: '#72E8B1',
    5: '#54DA9B',
    6: '#41D08D',
    7: '#2FC27C',
    8: '#20AD6A',
    9: '#109A59',
    10: '#008848',
} as const;

/** 品牌色2（Navigation）：深色导航栏与深色模式，navigation[9] (#1C202B) 为深色主按钮底 */
export const navigation = {
    1: '#F5F7FA',
    2: '#F0F1F5',
    3: '#D3D6E0',
    4: '#B3B8C7',
    5: '#9299AD',
    6: '#6F778F',
    7: '#515970',
    8: '#363940',
    9: '#1C202B',
    10: '#0D0F14',
} as const;

export const success = {
    1: '#E5FFF5',
    2: '#CCFFEB',
    3: '#91F2CA',
    4: '#5CE5AA',
    5: '#2BD98B',
    6: '#00CC6D',
    7: '#00A656',
    8: '#008040',
    9: '#00592B',
    10: '#003318',
} as const;

export const warning = {
    1: '#FFF3E0',
    2: '#FFEBCC',
    3: '#FFD499',
    4: '#FFBD66',
    5: '#FFA333',
    6: '#F58300',
    7: '#CF6B00',
    8: '#A85400',
    9: '#823F00',
    10: '#5C2B00',
} as const;

export const error = {
    1: '#FDECEE',
    2: '#F9D7D9',
    3: '#F8B9BE',
    4: '#F78D94',
    5: '#F36D78',
    6: '#E62C4B',
    7: '#BF1B33',
    8: '#990E25',
    9: '#730519',
    10: '#4D000F',
} as const;

export const palette = {
    gray,
    primary,
    brand,
    navigation,
    success,
    warning,
    error,
} as const;

export type PaletteScale = keyof typeof palette;
