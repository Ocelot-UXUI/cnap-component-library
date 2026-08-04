import {Select} from 'antd';

import {HintText, StateLabel} from '../ComponentPlayground.style';
import {RichSection, SubGroup} from './SectionShell';

const OPTIONS = [
    { value: '1', label: '选项一' },
    { value: '2', label: '选项二' },
    { value: '3', label: '选项三' },
];

function SelectSection() {
    return (
        <RichSection title="Select 选择器">
            <SubGroup title="尺寸规格">
                <StateLabel>Default 32px</StateLabel>
                <Select style={{ width: 180 }} placeholder="请选择内容" options={OPTIONS} />
                <StateLabel>Small 24px</StateLabel>
                <Select size="small" style={{ width: 180 }} placeholder="请选择内容" options={OPTIONS} />
            </SubGroup>

            <SubGroup title="类型 Variant（Mode）">
                <StateLabel>单选 Single</StateLabel>
                <Select style={{ width: 180 }} placeholder="请选择内容" options={OPTIONS} />
                <StateLabel>多选 Multiple</StateLabel>
                <Select mode="multiple" style={{ width: 180 }} placeholder="请选择内容" options={OPTIONS} />
                <StateLabel>无边框 Borderless</StateLabel>
                <Select variant="borderless" style={{ width: 180 }} placeholder="请选择内容" options={OPTIONS} />
            </SubGroup>

            <SubGroup title="状态说明（State）">
                <StateLabel>默认 Default</StateLabel>
                <Select style={{ width: 180 }} placeholder="请选择内容" options={OPTIONS} />
                <StateLabel>单选已选 Selected</StateLabel>
                <Select style={{ width: 180 }} defaultValue="1" options={OPTIONS} />
                <StateLabel>多选已选 Selected</StateLabel>
                <Select mode="multiple" style={{ width: 180 }} defaultValue={['1']} options={OPTIONS} />
                <StateLabel>禁用 Disabled</StateLabel>
                <Select disabled style={{ width: 180 }} placeholder="请选择内容" options={OPTIONS} />
            </SubGroup>

            <HintText>Hover 悬停与 Focused 聚焦（展开下拉）为交互态，请手动悬停 / 点击展开以人工检视。</HintText>
        </RichSection>
    );
}

export {SelectSection};
