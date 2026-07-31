import {THEME_KEY} from '@/constants/localStorage';
import {type ThemeKey, themePresets} from '@/constants/themes';
import {type ThemeConfig} from 'antd';
import {useLocalStorage} from 'huse';
import {createContext, ReactNode, useContext, useMemo} from 'react';

const BASE_FONT_FAMILY = "'Inter Variable', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

interface ThemeContextType {
    currentTheme: ThemeKey;
    setTheme: (theme: ThemeKey) => void;
    themeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode; }) => {
    const [currentTheme, setCurrentTheme] = useLocalStorage<ThemeKey>(THEME_KEY, 'cnap2');

    const setTheme = (themeKey: ThemeKey) => {
        setCurrentTheme(themeKey);
    };

    const themeConfig: ThemeConfig = useMemo(
        () => {
            const preset = themePresets[currentTheme];
            return {
                ...preset,
                token: {
                    fontFamily: BASE_FONT_FAMILY,
                    ...preset.token,
                },
            };
        },
        [currentTheme],
    );

    return (
        <ThemeContext.Provider value={{ currentTheme, setTheme, themeConfig }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
