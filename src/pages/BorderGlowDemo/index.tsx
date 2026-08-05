/* eslint-disable max-len */
import BorderGlow from '@/components/BorderGlow/BorderGlow';
import {PageLayoutHeader} from '@/design/Layouts/PageLayout';
import {hexToHslStr} from '@/utils/color';
import {css} from '@emotion/css';
import {theme} from '@/design';

const gridStyle = css`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 48px;
    margin-top: 32px;
`;

const cardInner = css`
    padding: 28px;
`;

const cardTitle = css`
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #1a1a2e;
`;

const cardDesc = css`
    font-size: 13px;
    color: rgba(0, 0, 0, 0.55);
    line-height: 1.6;
`;

const tag = css`
    display: inline-block;
    margin-top: 12px;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: 11px;
    background: rgba(0, 0, 0, 0.06);
    color: #5b5fc7;
`;

interface CardConfig {
    title: string;
    desc: string;
    label: string;
    color: string;
    extra?: Record<string, unknown>;
}

function BorderGlowDemo() {
    const { token } = theme.useToken();

    const cards: CardConfig[] = [
        {
            title: '主色调',
            desc: '跟随当前主题的 colorPrimary，切换主题后光晕颜色实时变化。',
            label: 'colorPrimary',
            color: token.colorPrimary,
        },
        {
            title: '成功色',
            desc: '使用 colorSuccess token，适合状态卡片、成功提示等场景。',
            label: 'colorSuccess',
            color: token.colorSuccess,
        },
        {
            title: '错误色',
            desc: '使用 colorError token，高强度光晕，适合警告或危险操作。',
            label: 'colorError',
            color: token.colorError,
            extra: { glowIntensity: 1.2, coneSpread: 35 },
        },
        {
            title: '警告色',
            desc: '使用 colorWarning token，展示主题中的暖色系光晕效果。',
            label: 'colorWarning',
            color: token.colorWarning,
        },
        {
            title: '入场动画',
            desc: 'animated=true，加载时自动触发扫光，颜色同样跟随主题。',
            label: 'animated: true',
            color: token.colorPrimary,
            extra: { animated: true, glowRadius: 60 },
        },
        {
            title: '信息色',
            desc: '使用 colorInfo token，宽光晕半径，渐变填充更柔和。',
            label: 'colorInfo',
            color: token.colorInfo,
            extra: { fillOpacity: 0.8, glowRadius: 55 },
        },
    ];

    return (
        <>
            <PageLayoutHeader
                title={
                    <h2 style={{ margin: 0, color: '#1a1a2e', fontSize: 22, fontWeight: 600 }}>
                        BorderGlow 组件演示（主题联动）
                    </h2>
                }
            />
            <div className={gridStyle}>
                {cards.map(({ title, desc, label, color, extra }) => (
                    <BorderGlow
                        key={title}
                        backgroundColor="#f8f9fc"
                        glowColor={hexToHslStr(color)}
                        colors={[color, token.colorPrimary, token.colorInfo]}
                        borderRadius={16}
                        lightMode
                        {...extra}
                    >
                        <div className={cardInner}>
                            <div className={cardTitle}>{title}</div>
                            <div className={cardDesc}>{desc}</div>
                            <span className={tag}>{label}: {color}</span>
                        </div>
                    </BorderGlow>
                ))}
            </div>
        </>
    );
}

export default BorderGlowDemo;
