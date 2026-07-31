/**
 * 消息面板：Bubble.List 渲染对话消息流
 */
import {useEffect, useRef} from 'react';

import {RobotOutlined, UserOutlined} from '@ant-design/icons';
import {Bubble} from '@ant-design/x';
import {Avatar} from 'antd';

import {useAIChat} from '@/contexts/AIChatContext';

import {MessageActions} from './MessageActions';
import {assistantAvatarCss, bubbleListCss, chatAreaCss, userAvatarCss} from './styles';
import {ThoughtChainCard} from './ThoughtChainCard';

import type {DisplayMessage} from '@/api/ai/types';
import type {RoleType} from '@ant-design/x/es/bubble/interface';

const renderMessageContent = (msg: DisplayMessage) => {
    if (msg.type === 'agent_steps' && msg.agentSteps) {
        return <ThoughtChainCard steps={msg.agentSteps} />;
    }
    return msg.content;
};

// role 配置：供 Bubble.List 的 role prop 使用
const ROLE_CONFIG: RoleType = {
    user: {
        placement: 'end',
        avatar: <Avatar className={userAvatarCss} icon={<UserOutlined />} />,
    },
    assistant: {
        placement: 'start',
        avatar: <Avatar className={assistantAvatarCss} icon={<RobotOutlined />} />,
    },
};

export const ChatPanel = () => {
    const { messages, isStreaming, regenerate } = useAIChat();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(
        () => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        },
        [messages],
    );

    const lastAssistantIdx = messages.reduce(
        (acc, m, i) => (m.role === 'assistant' && m.type === 'text' ? i : acc),
        -1,
    );

    const items = messages.map((msg, idx) => {
        const role = msg.role === 'tool' || msg.role === 'system' ? 'assistant' : msg.role;
        const isLastAssistant = idx === lastAssistantIdx;
        // 只对 assistant 文本消息显示操作栏，且流式时不显示
        const showActions = role === 'assistant' && msg.type === 'text' && (!isStreaming || !isLastAssistant);
        return {
            key: msg.id,
            role,
            content: renderMessageContent(msg),
            footer: showActions
                ? <MessageActions msg={msg} onRegenerate={regenerate} />
                : undefined,
        };
    });

    return (
        <div className={chatAreaCss}>
            <Bubble.List
                className={bubbleListCss}
                items={items}
                role={ROLE_CONFIG}
            />
            <div ref={bottomRef} />
        </div>
    );
};
