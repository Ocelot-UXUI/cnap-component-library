import {Switch} from 'antd';

import {HintText, StateLabel} from '../ComponentPlayground.style';
import {RichSection, SubGroup} from './SectionShell';

function SwitchSection() {
    return (
        <RichSection title="Switch 开关">
            <SubGroup title="尺寸规格">
                <StateLabel>小 S 24×14</StateLabel>
                <Switch size="small" defaultChecked />
                <StateLabel>大 L 32×20</StateLabel>
                <Switch defaultChecked />
            </SubGroup>

            <SubGroup title="状态说明">
                <StateLabel>开启 On</StateLabel>
                <Switch defaultChecked />
                <StateLabel>开启禁用 Disabled On</StateLabel>
                <Switch checked disabled />
                <StateLabel>关闭 Off</StateLabel>
                <Switch defaultChecked={false} />
                <StateLabel>关闭禁用 Disabled Off</StateLabel>
                <Switch disabled />
            </SubGroup>

            <SubGroup title="尺寸对比 · 小 S">
                <StateLabel>开启</StateLabel>
                <Switch size="small" defaultChecked />
                <StateLabel>开启禁用</StateLabel>
                <Switch size="small" checked disabled />
                <StateLabel>关闭</StateLabel>
                <Switch size="small" defaultChecked={false} />
                <StateLabel>关闭禁用</StateLabel>
                <Switch size="small" disabled />
            </SubGroup>

            <SubGroup title="尺寸对比 · 大 L">
                <StateLabel>开启</StateLabel>
                <Switch defaultChecked />
                <StateLabel>开启禁用</StateLabel>
                <Switch checked disabled />
                <StateLabel>关闭</StateLabel>
                <Switch defaultChecked={false} />
                <StateLabel>关闭禁用</StateLabel>
                <Switch disabled />
            </SubGroup>

            <HintText>Hover 悬停为交互态，请将鼠标悬停以人工检视。</HintText>
        </RichSection>
    );
}

export {SwitchSection};
