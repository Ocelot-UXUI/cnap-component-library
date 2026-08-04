import {InputNumber} from 'antd';

import {HintText, StateLabel} from '../ComponentPlayground.style';
import {RichSection, SubGroup} from './SectionShell';

function NumberInputSection() {
    return (
        <RichSection title="Number Input 数字选择器">
            <SubGroup title="尺寸规格">
                <StateLabel>Default 32px</StateLabel>
                <InputNumber defaultValue={3} style={{ width: 136 }} />
                <StateLabel>Small 24px</StateLabel>
                <InputNumber size="small" defaultValue={3} style={{ width: 112 }} />
            </SubGroup>

            <SubGroup title="状态说明（State）">
                <StateLabel>默认 Default</StateLabel>
                <InputNumber defaultValue={3} style={{ width: 136 }} />
                <StateLabel>错误 Error</StateLabel>
                <InputNumber defaultValue={3} status="error" style={{ width: 136 }} />
                <StateLabel>按钮禁用 BtnDisabled</StateLabel>
                <InputNumber defaultValue={3} min={3} max={3} style={{ width: 136 }} />
                <StateLabel>完全禁用 Disabled</StateLabel>
                <InputNumber defaultValue={3} disabled style={{ width: 136 }} />
            </SubGroup>

            <SubGroup title="Small 尺寸状态总览">
                <StateLabel>默认 Default</StateLabel>
                <InputNumber size="small" defaultValue={3} style={{ width: 112 }} />
                <StateLabel>错误 Error</StateLabel>
                <InputNumber size="small" defaultValue={3} status="error" style={{ width: 112 }} />
                <StateLabel>按钮禁用 BtnDisabled</StateLabel>
                <InputNumber size="small" defaultValue={3} min={3} max={3} style={{ width: 112 }} />
                <StateLabel>完全禁用 Disabled</StateLabel>
                <InputNumber size="small" defaultValue={3} disabled style={{ width: 112 }} />
            </SubGroup>

            <HintText>Hover 悬停与 Focus 键盘聚焦为交互态，请手动悬停 / 聚焦以人工检视。</HintText>
        </RichSection>
    );
}

export {NumberInputSection};
