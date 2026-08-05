import {PlusOutlined} from '@ant-design/icons';
import {Button} from '@/design';

import {HintText, StateLabel} from '../ComponentPlayground.style';
import {RichSection, SubGroup} from './SectionShell';

function ButtonSection() {
    return (
        <RichSection title="Button 按钮">
            <SubGroup title="尺寸 / 样式">
                <StateLabel>Default 32px</StateLabel>
                <Button type="primary">确定</Button>
                <StateLabel>Small 24px</StateLabel>
                <Button type="primary" size="small">确定</Button>
            </SubGroup>

            <SubGroup title="类型 Variant">
                <StateLabel>Primary 主要</StateLabel>
                <Button type="primary">确定</Button>
                <StateLabel>Secondary 次要</StateLabel>
                <Button>取消</Button>
                <StateLabel>Icon Outlined 图标描边</StateLabel>
                <Button icon={<PlusOutlined />} shape="circle" />
                <StateLabel>Icon 图标</StateLabel>
                <Button type="text" icon={<PlusOutlined />} shape="circle" />
                <StateLabel>Text 文字</StateLabel>
                <Button type="text">复制</Button>
            </SubGroup>

            <SubGroup title="图标组合">
                <StateLabel>Icon Left 前置</StateLabel>
                <Button type="primary" icon={<PlusOutlined />}>确定</Button>
                <Button icon={<PlusOutlined />}>取消</Button>
                <StateLabel>Icon Right 后置</StateLabel>
                <Button type="primary" icon={<PlusOutlined />} iconPlacement="end">确定</Button>
                <Button icon={<PlusOutlined />} iconPlacement="end">取消</Button>
                <StateLabel>Icon Only 纯图标</StateLabel>
                <Button icon={<PlusOutlined />} shape="circle" />
                <Button type="text" icon={<PlusOutlined />} />
            </SubGroup>

            <SubGroup title="状态 · 主要按钮 Primary">
                <StateLabel>Default 默认</StateLabel>
                <Button type="primary">确定</Button>
                <StateLabel>Disabled 禁用</StateLabel>
                <Button type="primary" disabled>确定</Button>
            </SubGroup>

            <SubGroup title="状态 · 次要按钮 Secondary">
                <StateLabel>Default 默认</StateLabel>
                <Button>取消</Button>
                <StateLabel>Disabled 禁用</StateLabel>
                <Button disabled>取消</Button>
            </SubGroup>

            <SubGroup title="状态 · 图标按钮描边 Icon Outlined">
                <StateLabel>Default 默认</StateLabel>
                <Button icon={<PlusOutlined />} />
                <StateLabel>Disabled 禁用</StateLabel>
                <Button icon={<PlusOutlined />} disabled />
            </SubGroup>

            <SubGroup title="状态 · 图标按钮 Icon">
                <StateLabel>Default 默认</StateLabel>
                <Button type="text" icon={<PlusOutlined />} shape="circle" />
                <StateLabel>Disabled 禁用</StateLabel>
                <Button type="text" icon={<PlusOutlined />} disabled shape="circle" />
            </SubGroup>

            <SubGroup title="状态 · 文字按钮 Text">
                <StateLabel>Default 默认</StateLabel>
                <Button type="text">复制</Button>
                <StateLabel>Disabled 禁用</StateLabel>
                <Button type="text" disabled>复制</Button>
            </SubGroup>

            <HintText>Hover / Focused 为交互态，请将鼠标悬停或键盘聚焦以人工检视。</HintText>
        </RichSection>
    );
}

export {ButtonSection};
