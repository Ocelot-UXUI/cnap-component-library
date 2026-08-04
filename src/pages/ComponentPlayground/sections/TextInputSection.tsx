import {Input} from 'antd';

import {HintText, StateLabel} from '../ComponentPlayground.style';
import {RichSection, SubGroup} from './SectionShell';

const { TextArea } = Input;

function TextInputSection() {
    return (
        <RichSection title="Text Input 文本输入">
            <SubGroup title="尺寸 / 规格">
                <StateLabel>Small XS 高24</StateLabel>
                <Input size="small" placeholder="请输入内容" style={{ width: 200 }} />
                <StateLabel>Medium M 高32</StateLabel>
                <Input placeholder="请输入内容" style={{ width: 200 }} />
                <StateLabel>多行文本</StateLabel>
                <TextArea placeholder="请输入内容" style={{ width: 462, height: 100 }} />
            </SubGroup>

            <SubGroup title="状态 · 中尺寸 Medium">
                <StateLabel>默认 Default</StateLabel>
                <Input placeholder="请输入内容" style={{ width: 200 }} />
                <StateLabel>已输入 Filled</StateLabel>
                <Input defaultValue="已输入" style={{ width: 200 }} />
                <StateLabel>只读 Read-only</StateLabel>
                <Input readOnly value="已输入" style={{ width: 200 }} />
                <StateLabel>禁用 Disabled</StateLabel>
                <Input disabled placeholder="占位占位占位占位" style={{ width: 200 }} />
                <StateLabel>错误 Error</StateLabel>
                <Input status="error" defaultValue="占位占位占位占位" style={{ width: 200 }} />
            </SubGroup>

            <SubGroup title="状态 · 小尺寸 Small">
                <StateLabel>默认 Default</StateLabel>
                <Input size="small" placeholder="请输入内容" style={{ width: 200 }} />
                <StateLabel>已输入 Filled</StateLabel>
                <Input size="small" defaultValue="已输入" style={{ width: 200 }} />
                <StateLabel>禁用 Disabled</StateLabel>
                <Input size="small" disabled placeholder="占位占位占位占位" style={{ width: 200 }} />
                <StateLabel>错误 Error</StateLabel>
                <Input size="small" status="error" defaultValue="占位占位占位占位" style={{ width: 200 }} />
            </SubGroup>

            <SubGroup title="状态 · 多行文本">
                <StateLabel>默认 Default</StateLabel>
                <TextArea placeholder="请输入内容" style={{ width: 300, height: 88 }} />
                <StateLabel>已填写 Filled</StateLabel>
                <TextArea defaultValue="已输入" style={{ width: 300, height: 88 }} />
                <StateLabel>禁用 Disabled</StateLabel>
                <TextArea disabled placeholder="占位占位占位占位" style={{ width: 300, height: 88 }} />
                <StateLabel>错误 Error</StateLabel>
                <TextArea status="error" defaultValue="已输入" style={{ width: 300, height: 88 }} />
            </SubGroup>

            <HintText>Hover / Focused / Error-hover 为交互态，请将鼠标悬停或键盘聚焦以人工检视。</HintText>
        </RichSection>
    );
}

export {TextInputSection};
