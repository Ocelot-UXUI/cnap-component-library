import {Input, InputNumber, Select, Space} from 'antd';
import {useState} from 'react';

import {StateLabel} from '../ComponentPlayground.style';
import {SectionShell} from './SectionShell';

function TextInputSection() {
    const [value, setValue] = useState('');
    return (
        <SectionShell title="Text Input 文本输入">
            <StateLabel>默认</StateLabel>
            <Input placeholder="请输入" style={{width: 200}} />
            <StateLabel>受控</StateLabel>
            <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="受控" style={{width: 200}} />
            <StateLabel>disabled</StateLabel>
            <Input disabled placeholder="禁用" style={{width: 200}} />
            <StateLabel>prefix/suffix</StateLabel>
            <Input prefix="¥" suffix="元" style={{width: 200}} />
            <StateLabel>错误态</StateLabel>
            <Input status="error" placeholder="错误" style={{width: 200}} />
            <StateLabel>textarea</StateLabel>
            <Input.TextArea placeholder="多行" style={{width: 300}} />
        </SectionShell>
    );
}

function NumberInputSection() {
    return (
        <SectionShell title="Number Input 数字输入">
            <StateLabel>默认</StateLabel>
            <InputNumber placeholder="数字" style={{width: 160}} />
            <StateLabel>step</StateLabel>
            <InputNumber defaultValue={0} step={0.1} style={{width: 160}} />
            <StateLabel>范围</StateLabel>
            <InputNumber min={0} max={10} defaultValue={5} style={{width: 160}} />
            <StateLabel>禁用</StateLabel>
            <InputNumber disabled defaultValue={5} style={{width: 160}} />
        </SectionShell>
    );
}

function SelectSection() {
    const [single, setSingle] = useState<string>('a');
    const [multi, setMulti] = useState<string[]>(['a']);
    return (
        <SectionShell title="Select 选择器">
            <StateLabel>默认</StateLabel>
            <Select style={{width: 160}} placeholder="请选择" options={[{value: 'a', label: '选项A'}, {value: 'b', label: '选项B'}]} />
            <StateLabel>选中项</StateLabel>
            <Select style={{width: 160}} value={single} onChange={setSingle} options={[{value: 'a', label: '选项A'}, {value: 'b', label: '选项B'}]} />
            <StateLabel>多选</StateLabel>
            <Select mode="multiple" style={{width: 200}} value={multi} onChange={setMulti} options={[{value: 'a', label: 'A'}, {value: 'b', label: 'B'}]} />
            <StateLabel>禁用</StateLabel>
            <Select disabled style={{width: 160}} defaultValue="a" options={[{value: 'a', label: 'A'}]} />
            <StateLabel>可搜索</StateLabel>
            <Space>
                <Select showSearch style={{width: 160}} placeholder="搜索" options={[{value: 'a', label: 'Apple'}, {value: 'b', label: 'Banana'}]} />
            </Space>
        </SectionShell>
    );
}

export {TextInputSection, NumberInputSection, SelectSection};
