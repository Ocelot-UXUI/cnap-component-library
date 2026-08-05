/**
 * AI 语义化 Button 组件
 */
import type {AISemanticProps} from '@/types/semantic';
import {Button as AntButton} from '@/design';
import type {ButtonProps} from '@/design';
import {motion} from 'framer-motion';

type AIButtonProps = ButtonProps & AISemanticProps;

export const Button = ({
    'data-ai-role': role = 'button',
    'data-ai-action': action,
    'data-ai-entity': entity,
    'data-ai-param': param,
    'data-ai-desc': desc,
    ...props
}: AIButtonProps) => (
    <motion.span
        style={{ display: 'inline-flex' }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
        <AntButton
            data-ai-role={role}
            data-ai-action={action}
            data-ai-entity={entity}
            data-ai-param={param}
            data-ai-desc={desc}
            {...props}
        />
    </motion.span>
);
