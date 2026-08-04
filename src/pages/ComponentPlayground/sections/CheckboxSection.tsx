import {Checkbox} from 'antd';

import {HintText, StateLabel} from '../ComponentPlayground.style';
import {RichSection, SubGroup} from './SectionShell';

function CheckboxSection() {
    return (
        <RichSection title="Checkbox 复选框">
            <SubGroup title="选中状态（独立样式）">
                <StateLabel>未选中 Unchecked</StateLabel>
                <Checkbox />
                <StateLabel>半选 Indeterminate</StateLabel>
                <Checkbox indeterminate />
                <StateLabel>已选中 Checked</StateLabel>
                <Checkbox defaultChecked />
            </SubGroup>

            <SubGroup title="状态说明 · 默认 Default">
                <StateLabel>未选中</StateLabel>
                <Checkbox />
                <StateLabel>半选</StateLabel>
                <Checkbox indeterminate />
                <StateLabel>已选中</StateLabel>
                <Checkbox defaultChecked />
            </SubGroup>

            <SubGroup title="状态说明 · 禁用 Disabled">
                <StateLabel>未选中</StateLabel>
                <Checkbox disabled />
                <StateLabel>半选</StateLabel>
                <Checkbox indeterminate disabled />
                <StateLabel>已选中</StateLabel>
                <Checkbox checked disabled />
            </SubGroup>

            <SubGroup title="样式类型 · 独立样式 16×16">
                <StateLabel>未选中</StateLabel>
                <Checkbox />
                <StateLabel>半选</StateLabel>
                <Checkbox indeterminate />
                <StateLabel>已选中</StateLabel>
                <Checkbox defaultChecked />
            </SubGroup>

            <SubGroup title="样式类型 · 组合样式（+ 文字标签）">
                <StateLabel>未选中</StateLabel>
                <Checkbox>多选项</Checkbox>
                <StateLabel>半选</StateLabel>
                <Checkbox indeterminate>多选项</Checkbox>
                <StateLabel>已选中</StateLabel>
                <Checkbox defaultChecked>多选项</Checkbox>
            </SubGroup>

            <HintText>Hover 悬停为交互态，请将鼠标悬停以人工检视。</HintText>
        </RichSection>
    );
}

export {CheckboxSection};
