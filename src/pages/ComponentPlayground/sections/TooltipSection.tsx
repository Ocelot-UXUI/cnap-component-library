import {Button, Tooltip} from 'antd';
import type {TooltipProps} from 'antd';
import {Fragment, type ReactNode} from 'react';

import {HintText, StateLabel} from '../ComponentPlayground.style';
import {RichSection, SubGroup} from './SectionShell';

const PLACEMENTS: { placement: TooltipProps['placement']; label: string; }[] = [
    { placement: 'top', label: '上 Top' },
    { placement: 'bottom', label: '下 Bottom' },
    { placement: 'left', label: '左 Left' },
    { placement: 'right', label: '右 Right' },
];

const MULTI_LINE = (
    <>
        文字提示仅展示文本内容
        <br />
        文字提示仅展示文本内容
    </>
);

function placementRow(title: ReactNode, arrow: boolean) {
    return PLACEMENTS.map(({ placement, label }) => (
        <Fragment key={label}>
            <StateLabel>{label}</StateLabel>
            <Tooltip title={title} placement={placement} arrow={arrow}>
                <Button>悬停查看</Button>
            </Tooltip>
        </Fragment>
    ));
}

function TooltipSection() {
    return (
        <RichSection title="Tooltip 文字提示">
            <SubGroup title="类型 Variant">
                <StateLabel>单行</StateLabel>
                <Tooltip title="退出全屏">
                    <Button>悬停查看</Button>
                </Tooltip>
                <StateLabel>多行</StateLabel>
                <Tooltip title={MULTI_LINE}>
                    <Button>悬停查看</Button>
                </Tooltip>
                <StateLabel>仅展示（无箭头）</StateLabel>
                <Tooltip title="无指向提示" arrow={false}>
                    <Button>悬停查看</Button>
                </Tooltip>
            </SubGroup>

            <SubGroup title="方向 / 位置（单行）">
                {placementRow('退出全屏', true)}
            </SubGroup>

            <SubGroup title="所有组合 · 多行 × 方向">
                {placementRow(MULTI_LINE, true)}
            </SubGroup>

            <SubGroup title="所有组合 · 仅展示（无箭头）× 方向">
                {placementRow('无指向提示', false)}
            </SubGroup>

            <HintText>
                悬停“悬停查看”按钮即可查看 Tooltip 气泡；已覆盖 单行 / 多行 / 仅展示（无箭头）× 上下左右 组合。
            </HintText>
        </RichSection>
    );
}

export {TooltipSection};
