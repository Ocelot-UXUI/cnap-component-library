/**
 * Agentic 执行步骤卡片：Think（折叠面板）+ ThoughtChain（步骤列表）
 */
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    LoadingOutlined,
} from '@ant-design/icons';
import {Think, ThoughtChain} from '@ant-design/x';

import {
    statusErrorIconCss,
    statusPendingIconCss,
    statusRunningIconCss,
    statusSuccessIconCss,
    thoughtChainWrapCss,
} from './styles';

import type {AgentStep} from '@/api/ai/types';

const STATUS_ICON_MAP = {
    pending: <ClockCircleOutlined className={statusPendingIconCss} />,
    running: <LoadingOutlined className={statusRunningIconCss} />,
    success: <CheckCircleOutlined className={statusSuccessIconCss} />,
    error: <CloseCircleOutlined className={statusErrorIconCss} />,
};

const STATUS_CHAIN_MAP = {
    pending: undefined,
    running: 'loading',
    success: 'success',
    error: 'error',
} as const;

interface ThoughtChainCardProps {
    steps: AgentStep[];
}

export const ThoughtChainCard = ({ steps }: ThoughtChainCardProps) => {
    const isRunning = steps.some(s => s.status === 'running');
    const hasError = steps.some(s => s.status === 'error');

    const title = isRunning
        ? '正在执行操作...'
        : hasError
        ? '执行遇到问题'
        : '操作已完成';

    const items = steps.map(step => ({
        key: step.id,
        title: step.title,
        description: step.error ?? step.description,
        icon: STATUS_ICON_MAP[step.status],
        status: STATUS_CHAIN_MAP[step.status],
        blink: step.status === 'running',
    }));

    return (
        <div className={thoughtChainWrapCss}>
            <Think
                title={title}
                loading={isRunning}
                blink={isRunning}
                defaultExpanded
                expanded={isRunning ? true : undefined}
            >
                <ThoughtChain items={items} />
            </Think>
        </div>
    );
};
