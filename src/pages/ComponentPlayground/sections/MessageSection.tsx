import {Button, message} from '@/design';

import {HintText, StateLabel} from '../ComponentPlayground.style';
import {RichSection, SubGroup} from './SectionShell';

function MessageSection() {
    const [api, contextHolder] = message.useMessage();
    return (
        <RichSection title="Message 全局提示">
            {contextHolder}
            <SubGroup title="状态说明（Type Variant · 内置语义图标）">
                <StateLabel>成功 Success</StateLabel>
                <Button onClick={() => api.success('操作成功')}>触发成功</Button>
                <StateLabel>错误 Error</StateLabel>
                <Button onClick={() => api.error('操作失败')}>触发错误</Button>
                <StateLabel>警示 Warning</StateLabel>
                <Button onClick={() => api.warning('警示提示')}>触发警示</Button>
            </SubGroup>

            <HintText>
                全局提示为页面顶部轻量反馈，短暂展示后自动消失；图标与类型绑定、不可替换，无独立 Hover / Pressed /
                Disabled 态。点击按钮触发查看。
            </HintText>
        </RichSection>
    );
}

export {MessageSection};
