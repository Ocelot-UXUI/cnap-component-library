/**
 * 国际化工具
 */
import {useCallback, useEffect, useState} from 'react';
import enUS from './en-US.json';
import zhCN from './zh-CN.json';

export type Locale = 'zh-CN' | 'en-US';

export type TranslationKey = string;

const translations: Record<Locale, Record<string, any>> = {
    'zh-CN': zhCN,
    'en-US': enUS,
};

const LOCALE_STORAGE_KEY = 'cnap_locale';

// 获取默认语言
const getDefaultLocale = (): Locale => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (stored && (stored === 'zh-CN' || stored === 'en-US')) {
        return stored;
    }
    return 'zh-CN';
};

// 全局语言状态
let currentLocale: Locale = getDefaultLocale();
const listeners: Array<(locale: Locale) => void> = [];

// 切换语言
export const setLocale = (locale: Locale): void => {
    currentLocale = locale;
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    listeners.forEach(listener => listener(locale));
};

// 获取当前语言
export const getLocale = (): Locale => currentLocale;

// 获取翻译文本
export const getTranslation = (key: TranslationKey, locale: Locale = currentLocale): string => {
    const keys = key.split('.');
    let value: any = translations[locale];

    for (const k of keys) {
        if (value && typeof value === 'object') {
            value = value[k];
        } else {
            return key;
        }
    }

    return typeof value === 'string' ? value : key;
};

// 国际化 Hook
export const useTranslation = () => {
    const [locale, setLocaleState] = useState<Locale>(currentLocale);

    useEffect(
        () => {
            const listener = (newLocale: Locale) => {
                setLocaleState(newLocale);
            };
            listeners.push(listener);
            return () => {
                const index = listeners.indexOf(listener);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            };
        },
        [],
    );

    const t = useCallback(
        (key: TranslationKey): string => {
            return getTranslation(key, locale);
        },
        [locale],
    );

    const changeLocale = useCallback(
        (newLocale: Locale) => {
            setLocale(newLocale);
        },
        [],
    );

    return {
        t,
        locale,
        setLocale: changeLocale,
    };
};
