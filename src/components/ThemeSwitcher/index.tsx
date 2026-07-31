import {Button, Dropdown, Select} from '@/components/ai';
import {type ThemeKey, themeOptions} from '@/constants/themes';
import {useTheme} from '@/contexts/ThemeContext';
import {BgColorsOutlined} from '@ant-design/icons';
import {css} from '@emotion/css';
import {Space} from 'antd';
import type {MenuProps} from 'antd';
import {useEffect, useState} from 'react';

const mobileClass = css`
    @media (max-width: 768px) {
        display: block !important;
    }
    @media (min-width: 769px) {
        display: none !important;
    }
`;

const desktopClass = css`
    @media (max-width: 768px) {
        display: none !important;
    }
    @media (min-width: 769px) {
        display: block !important;
    }
`;

export const ThemeSwitcher = () => {
    const [isMobile, setIsMobile] = useState(false);
    const { currentTheme, setTheme } = useTheme();

    useEffect(
        () => {
            const handleResize = () => {
                setIsMobile(window.innerWidth <= 768);
            };

            handleResize();
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        },
        [],
    );

    const menuItems: MenuProps['items'] = themeOptions.map(option => ({
        key: option.key,
        label: (
            <Space>
                <div
                    style={{
                        width: 16,
                        height: 16,
                        backgroundColor: option.color,
                        borderRadius: '50%',
                    }}
                />
                {option.label}
            </Space>
        ),
    }));

    const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
        setTheme(key as ThemeKey);
    };

    const handleSelectChange = (value: ThemeKey) => {
        setTheme(value);
    };

    // PC端使用 Dropdown
    if (!isMobile) {
        return (
            <div className={desktopClass}>
                <Dropdown
                    menu={{ items: menuItems, onClick: handleMenuClick }}
                    trigger={['click']}
                    data-ai-action="switchTheme"
                    data-ai-entity="theme"
                    data-ai-desc="切换主题下拉菜单"
                >
                    <Button icon={<BgColorsOutlined />}>
                        切换主题
                    </Button>
                </Dropdown>
            </div>
        );
    }

    // 移动端使用 Select
    return (
        <div className={mobileClass}>
            <Select
                value={currentTheme}
                onChange={handleSelectChange}
                style={{ width: 100 }}
                data-ai-action="switchTheme"
                data-ai-entity="theme"
                data-ai-param="themeKey"
                options={themeOptions.map(option => ({
                    value: option.key,
                    label: (
                        <Space>
                            <div
                                style={{
                                    width: 12,
                                    height: 12,
                                    backgroundColor: option.color,
                                    borderRadius: '50%',
                                }}
                            />
                            {option.label}
                        </Space>
                    ),
                }))}
            />
        </div>
    );
};
