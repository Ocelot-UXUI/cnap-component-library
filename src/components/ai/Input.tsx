/**
 * AI 语义化 Input 组件
 */
import type {AISemanticProps} from '@/types/semantic';
import {Input as AntInput} from '@/design';
import type {InputProps, PasswordProps} from '@/design';

type AIInputProps = InputProps & AISemanticProps;
type AIPasswordProps = PasswordProps & AISemanticProps;

const AIInput = ({
    'data-ai-role': role = 'input',
    'data-ai-action': action,
    'data-ai-entity': entity,
    'data-ai-param': param,
    'data-ai-desc': desc,
    ...props
}: AIInputProps) => (
    <AntInput
        data-ai-role={role}
        data-ai-action={action}
        data-ai-entity={entity}
        data-ai-param={param}
        data-ai-desc={desc}
        {...props}
    />
);

const Password = ({
    'data-ai-role': role = 'input',
    'data-ai-action': action,
    'data-ai-entity': entity,
    'data-ai-param': param,
    'data-ai-desc': desc,
    ...props
}: AIPasswordProps) => (
    <AntInput.Password
        data-ai-role={role}
        data-ai-action={action}
        data-ai-entity={entity}
        data-ai-param={param}
        data-ai-desc={desc}
        {...props}
    />
);

export const Input = Object.assign(AIInput, {
    Password,
});
