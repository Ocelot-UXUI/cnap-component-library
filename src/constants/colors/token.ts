import {theme, ThemeConfig} from 'antd';
import {antPrefixCls} from '../design';
import {colors} from './base';

// Ant Design 主题配置
export const themeConfig: ThemeConfig = {
    token: {
        colorPrimary: colors.primary,
        colorInfo: colors.info,
        colorLink: colors.link,
    },
};

// ConfigProvider 配置
export const configProviderProps = {
    theme: themeConfig,
    prefixCls: antPrefixCls,
};

export const token = theme.getDesignToken(themeConfig);
