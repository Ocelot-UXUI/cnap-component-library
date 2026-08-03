import {SearchOutlined} from '@ant-design/icons';
import {Button, Checkbox, Radio, Space, Switch} from 'antd';
import {useState} from 'react';

import {StateLabel} from '../ComponentPlayground.style';
import {SectionShell} from './SectionShell';

function ButtonSection() {
    return (
        <SectionShell title="Button 按钮">
            <StateLabel>primary</StateLabel>
            <Button type="primary">主要按钮</Button>
            <StateLabel>default</StateLabel>
            <Button>默认按钮</Button>
            <StateLabel>dashed</StateLabel>
            <Button type="dashed">虚线</Button>
            <StateLabel>text</StateLabel>
            <Button type="text">文本</Button>
            <StateLabel>link</StateLabel>
            <Button type="link">链接</Button>
            <StateLabel>icon</StateLabel>
            <Button type="primary" icon={<SearchOutlined />} />
            <StateLabel>loading</StateLabel>
            <Button type="primary" loading />
            <StateLabel>disabled</StateLabel>
            <Button type="primary" disabled>禁用</Button>
        </SectionShell>
    );
}

function CheckboxSection() {
    const [checked, setChecked] = useState(true);
    const [indeterminate, setIndeterminate] = useState(true);
    return (
        <SectionShell title="Checkbox 复选框">
            <StateLabel>选中</StateLabel>
            <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />
            <StateLabel>未选中</StateLabel>
            <Checkbox checked={!checked} onChange={() => setChecked(false)} />
            <StateLabel>半选</StateLabel>
            <Checkbox checked={checked} indeterminate={indeterminate} onChange={(e) => { setChecked(e.target.checked); setIndeterminate(false); }} />
            <StateLabel>禁用选中</StateLabel>
            <Checkbox checked disabled />
            <StateLabel>禁用未选</StateLabel>
            <Checkbox disabled />
            <StateLabel>带文字</StateLabel>
            <Checkbox checked>同意条款</Checkbox>
        </SectionShell>
    );
}

function SwitchSection() {
    const [on, setOn] = useState(true);
    return (
        <SectionShell title="Switch 开关">
            <StateLabel>开</StateLabel>
            <Switch checked={on} onChange={setOn} />
            <StateLabel>关</StateLabel>
            <Switch checked={!on} onChange={() => setOn(false)} />
            <StateLabel>禁用开</StateLabel>
            <Switch checked disabled />
            <StateLabel>禁用关</StateLabel>
            <Switch disabled />
            <StateLabel>带文字</StateLabel>
            <Switch checked={on} checkedChildren="开" unCheckedChildren="关" onChange={setOn} />
        </SectionShell>
    );
}

function RadioSection() {
    return (
        <SectionShell title="Radio 单选">
            <StateLabel>单选组</StateLabel>
            <Radio.Group defaultValue="a">
                <Radio value="a">A</Radio>
                <Radio value="b">B</Radio>
                <Radio value="c">C</Radio>
            </Radio.Group>
            <StateLabel>按钮样式</StateLabel>
            <Radio.Group defaultValue="a" optionType="button" buttonStyle="solid">
                <Radio.Button value="a">A</Radio.Button>
                <Radio.Button value="b">B</Radio.Button>
                <Radio.Button value="c">C</Radio.Button>
            </Radio.Group>
            <StateLabel>禁用</StateLabel>
            <Space direction="vertical">
                <Radio disabled>禁用</Radio>
                <Radio checked disabled>选中禁用</Radio>
            </Space>
        </SectionShell>
    );
}

export {ButtonSection, CheckboxSection, SwitchSection, RadioSection};
