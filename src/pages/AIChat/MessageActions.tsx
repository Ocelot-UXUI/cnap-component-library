/**
 * 消息气泡操作按钮（复制、重新生成、反馈）
 */
import type {DisplayMessage} from '@/api/ai/types';
import {CopyOutlined, DislikeOutlined, LikeOutlined, ReloadOutlined} from '@ant-design/icons';
import {Actions} from '@ant-design/x';
import {message} from 'antd';

interface MessageActionsProps {
    msg: DisplayMessage;
    onRegenerate: () => void;
}

export const MessageActions = ({ msg, onRegenerate }: MessageActionsProps) => {
    const handleCopy = () => {
        if (!msg.content) {
            return;
        }
        navigator.clipboard.writeText(msg.content).then(
            () => message.success('已复制'),
            () => message.error('复制失败'),
        );
    };

    return (
        <Actions
            fadeIn
            items={[
                {
                    key: 'copy',
                    icon: <CopyOutlined />,
                    label: '复制',
                    onItemClick: handleCopy,
                },
                {
                    key: 'regenerate',
                    icon: <ReloadOutlined />,
                    label: '重新生成',
                    onItemClick: onRegenerate,
                },
                {
                    key: 'like',
                    icon: <LikeOutlined />,
                    label: '有帮助',
                },
                {
                    key: 'dislike',
                    icon: <DislikeOutlined />,
                    label: '没帮助',
                },
            ]}
        />
    );
};
