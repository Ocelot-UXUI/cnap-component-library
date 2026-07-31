// 颜色常量导出
//
// 首选（CNAP 2.0 语义化 token）：semantic / palette / sidebar
// 兼容旧代码：colors / myColors（base.ts 已标记 @deprecated）
import {colors, myColors} from './base';
import type {Color} from './base';
import {sidebar} from './navigation';
import {brand, error, gray, navigation, palette, primary, success, warning} from './palette';
import {bg, border, button, icon, semantic, state, text} from './semantic';
import {configProviderProps, token} from './token';

export {
    bg,
    border,
    brand,
    button,
    colors,
    configProviderProps,
    error,
    gray,
    icon,
    myColors,
    navigation,
    palette,
    primary,
    semantic,
    sidebar,
    state,
    success,
    text,
    token,
    warning,
};

export type {Color};
