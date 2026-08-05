import {useState} from 'react';

import styled from '@emotion/styled';
import {LogSearchInput} from '@/components/LogSearchInput';

import {HintText, StateLabel} from '../ComponentPlayground.style';
import {RichSection, SubGroup} from './SectionShell';

const DemoBox = styled.div`
    width: 320px;
`;

function LogSearchInputSection() {
    const [value, setValue] = useState('已输入');
    const [current, setCurrent] = useState(1);
    const [visible, setVisible] = useState(true);

    return (
        <RichSection title="Log Search Input 日志搜索输入">
            <SubGroup title="基础用法">
                <StateLabel>空输入</StateLabel>
                <DemoBox>
                    <LogSearchInput placeholder="请输入关键字" />
                </DemoBox>
                <StateLabel>已输入 · 非受控</StateLabel>
                <DemoBox>
                    <LogSearchInput defaultValue="已输入" total={2} />
                </DemoBox>
            </SubGroup>

            <SubGroup title="匹配计数 · 受控 current">
                <StateLabel>current = {current} / 5</StateLabel>
                <DemoBox>
                    <LogSearchInput
                        value={value}
                        onChange={setValue}
                        total={5}
                        current={current}
                        onCurrentChange={setCurrent}
                        onClear={() => {
                            setValue('');
                            setCurrent(0);
                        }}
                    />
                </DemoBox>
            </SubGroup>

            <SubGroup title="边界情况">
                <StateLabel>无匹配 total=0</StateLabel>
                <DemoBox>
                    <LogSearchInput defaultValue="已输入" total={0} />
                </DemoBox>
                <StateLabel>仅 1 个匹配</StateLabel>
                <DemoBox>
                    <LogSearchInput defaultValue="已输入" total={1} />
                </DemoBox>
            </SubGroup>

            <SubGroup title="眼睛可见状态">
                <StateLabel>传入回调</StateLabel>
                <DemoBox>
                    <LogSearchInput
                        defaultValue="已输入"
                        total={3}
                        visible={visible}
                        onVisibleChange={setVisible}
                    />
                </DemoBox>
                <StateLabel>未传回调</StateLabel>
                <DemoBox>
                    <LogSearchInput defaultValue="已输入" total={3} />
                </DemoBox>
            </SubGroup>

            <HintText>
                后缀仅在输入有值时显示；上/下箭头在边界（current=1 或 current=total）时禁用；眼睛 icon 仅在传入
                onVisibleChange 时显示。
            </HintText>
        </RichSection>
    );
}

export {LogSearchInputSection};
