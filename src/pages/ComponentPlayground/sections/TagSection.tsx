import {CheckCircleOutlined} from '@ant-design/icons';
import {Tag} from '@/design';
import type {CSSProperties, MouseEvent} from 'react';

import {palette, semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';

import {HintText, StateLabel} from '../ComponentPlayground.style';
import {RichSection, SubGroup} from './SectionShell';

const keepTag = (e: MouseEvent<HTMLElement>) => e.preventDefault();

const brandTag: Record<string, CSSProperties> = {
    green: { background: semantic.state.brand.light, color: palette.brand[8], borderColor: palette.brand[3] },
    grayBlue: { background: palette.navigation[2], color: palette.navigation[7], borderColor: palette.navigation[3] },
    neutral: { background: palette.gray[2], color: semantic.text.secondary, borderColor: palette.gray[4] },
    disabled: { background: palette.gray[1], color: semantic.text.disabled, borderColor: palette.gray[3] },
};

const rounded: CSSProperties = { borderRadius: radius.xl };
const squared: CSSProperties = { borderRadius: radius.sm };

function TagSection() {
    return (
        <RichSection title="Tag 状态标签">
            <SubGroup title="状态标签 — 颜色规格（纯文字）">
                <StateLabel>绿 · 成功</StateLabel>
                <Tag color="success">标签标签</Tag>
                <StateLabel>橙 · 警示</StateLabel>
                <Tag color="warning">标签标签</Tag>
                <StateLabel>红 · 失败</StateLabel>
                <Tag color="error">标签标签</Tag>
                <StateLabel>蓝 · 进行/常规</StateLabel>
                <Tag color="processing">标签标签</Tag>
            </SubGroup>

            <SubGroup title="类型 Variant">
                <StateLabel>纯文字</StateLabel>
                <Tag color="success">标签标签</Tag>
                <StateLabel>后置图标（可关闭）</StateLabel>
                <Tag color="success" closable onClose={keepTag}>标签标签</Tag>
                <StateLabel>前置图标</StateLabel>
                <Tag color="success" icon={<CheckCircleOutlined />}>标签标签</Tag>
                <StateLabel>前后图标</StateLabel>
                <Tag color="success" icon={<CheckCircleOutlined />} closable onClose={keepTag}>标签标签</Tag>
            </SubGroup>

            <SubGroup title="形状 · 圆角 12px">
                <Tag color="success" style={rounded}>标签标签</Tag>
                <Tag color="warning" style={rounded}>标签标签</Tag>
                <Tag color="error" style={rounded}>标签标签</Tag>
                <Tag color="processing" style={rounded}>标签标签</Tag>
            </SubGroup>

            <SubGroup title="形状 · 方角 4px">
                <Tag color="success" style={squared}>标签标签</Tag>
                <Tag color="warning" style={squared}>标签标签</Tag>
                <Tag color="error" style={squared}>标签标签</Tag>
                <Tag color="processing" style={squared}>标签标签</Tag>
            </SubGroup>

            <SubGroup title="其他标签 — 品牌色系">
                <StateLabel>品牌绿</StateLabel>
                <Tag style={brandTag.green}>标签标签</Tag>
                <StateLabel>品牌灰蓝</StateLabel>
                <Tag style={brandTag.grayBlue}>标签标签</Tag>
                <StateLabel>中性灰</StateLabel>
                <Tag style={brandTag.neutral}>标签标签</Tag>
                <StateLabel>置灰</StateLabel>
                <Tag style={brandTag.disabled}>标签标签</Tag>
            </SubGroup>

            <HintText>可关闭标签的 onClose 已阻止默认移除，便于持续检视。</HintText>
        </RichSection>
    );
}

export {TagSection};
