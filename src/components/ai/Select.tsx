/**
 * AI 语义化 Select 组件
 */
import type {AISemanticProps} from '@/types/semantic';
import {Select as AntSelect} from '@/design';
import type {SelectProps} from '@/design';

type AISelectProps = SelectProps & AISemanticProps;

const AISelect = ({
    'data-ai-role': role = 'select',
    'data-ai-action': action,
    'data-ai-entity': entity,
    'data-ai-param': param,
    'data-ai-desc': desc,
    ...props
}: AISelectProps) => (
    <AntSelect
        data-ai-role={role}
        data-ai-action={action}
        data-ai-entity={entity}
        data-ai-param={param}
        data-ai-desc={desc}
        {...props}
    />
);

export const Select = Object.assign(AISelect, {
    Option: AntSelect.Option,
});
