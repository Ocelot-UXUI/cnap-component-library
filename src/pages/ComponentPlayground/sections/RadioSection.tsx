import {Radio, Space} from 'antd';

import {StateLabel} from '../ComponentPlayground.style';
import {SectionShell} from './SectionShell';

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
            <Space orientation="vertical">
                <Radio disabled>禁用</Radio>
                <Radio checked disabled>选中禁用</Radio>
            </Space>
        </SectionShell>
    );
}

export {RadioSection};
