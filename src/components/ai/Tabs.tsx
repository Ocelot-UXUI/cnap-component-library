/**
 * AI 语义化 Tabs 组件
 * 自动为每个 tab 内容添加切换动画，无需手动包裹 MotionTab
 */
import type {AISemanticProps} from '@/types/semantic';
import {Tabs as AntTabs} from 'antd';
import type {TabsProps} from 'antd';
import {motion} from 'framer-motion';

type AITabsProps = TabsProps & AISemanticProps;

const wrapItemsWithMotion = (items: TabsProps['items']): TabsProps['items'] =>
    items?.map(item => ({
        ...item,
        children: item.children
            ? (
                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                >
                    {item.children}
                </motion.div>
            )
            : item.children,
    }));

export const Tabs = ({
    'data-ai-role': role = 'tab',
    'data-ai-action': action,
    'data-ai-entity': entity,
    'data-ai-param': param,
    'data-ai-desc': desc,
    destroyOnHidden = true,
    items,
    ...props
}: AITabsProps) => (
    <AntTabs
        data-ai-role={role}
        data-ai-action={action}
        data-ai-entity={entity}
        data-ai-param={param}
        data-ai-desc={desc}
        destroyOnHidden={destroyOnHidden}
        items={wrapItemsWithMotion(items)}
        {...props}
    />
);
