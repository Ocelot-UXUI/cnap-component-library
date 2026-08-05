/**
 * 消息气泡操作按钮（复制、重新生成、反馈）
 */
import {copyText} from '@/utils/clipboard';
import {CopyOutlined, DislikeOutlined, LikeOutlined, ReloadOutlined} from '@ant-design/icons';
import {Actions} from '@ant-design/x';
import {message} from '@/design';
import type {DisplayMessage} from '@/api/ai/types';

interface MessageActionsProps {
    msg: DisplayMessage;
    onRegenerate: () => void;
}

export const MessageActions = ({ msg, onRegenerate }: MessageActionsProps) => {
    const handleCopy = async () => {
        if (!msg.content) {
            return;
        }
        if (await copyText(msg.content)) {
            message.success('已复制');
        } else {
            message.error('复制失败');
        }
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
