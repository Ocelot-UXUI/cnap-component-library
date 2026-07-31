/**
 * AI 语义化 Switch 组件
 */
import type {AISemanticProps} from '@/types/semantic';
import {Switch as AntSwitch} from 'antd';
import type {SwitchProps} from 'antd';

type AISwitchProps = SwitchProps & AISemanticProps;

export const Switch = ({
    'data-ai-role': role = 'switch',
    'data-ai-action': action,
    'data-ai-entity': entity,
    'data-ai-param': param,
    'data-ai-desc': desc,
    ...props
}: AISwitchProps) => (
    <AntSwitch
        data-ai-role={role}
        data-ai-action={action}
        data-ai-entity={entity}
        data-ai-param={param}
        data-ai-desc={desc}
        {...props}
    />
);
