/**
 * AI 语义化 Form 组件
 */
import type {AISemanticProps} from '@/types/semantic';
import {Form as AntForm} from '@/design';
import type {FormProps} from '@/design';
import type {ReactNode} from 'react';

type AIFormProps = FormProps & AISemanticProps & { children?: ReactNode; };

const AIForm = ({
    'data-ai-role': role = 'form',
    'data-ai-action': action,
    'data-ai-entity': entity,
    'data-ai-param': param,
    'data-ai-desc': desc,
    children,
    ...props
}: AIFormProps) => (
    <AntForm
        data-ai-role={role}
        data-ai-action={action}
        data-ai-entity={entity}
        data-ai-param={param}
        data-ai-desc={desc}
        {...props}
    >
        {children}
    </AntForm>
);

// 导出 Form.Item 和 useForm
export const Form = Object.assign(AIForm, {
    Item: AntForm.Item,
    useForm: AntForm.useForm,
    List: AntForm.List,
    Provider: AntForm.Provider,
});
