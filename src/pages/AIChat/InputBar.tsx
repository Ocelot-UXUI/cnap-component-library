/**
 * 输入栏：Sender + 快捷提示词
 */
import {useAIChat} from '@/contexts/AIChatContext';
import {Prompts, Sender} from '@ant-design/x';
import {inputBarCss, promptsWrapCss} from './styles';

const QUICK_PROMPTS = [
    { key: 'list-apps', label: '查看所有应用列表' },
    { key: 'list-envs', label: '查看环境管理' },
    { key: 'list-clusters', label: '查看集群状态' },
    { key: 'create-env', label: '帮我创建一个新环境' },
    { key: 'navigate-settings', label: '跳转到用户设置' },
    { key: 'deploy-app', label: '部署一个应用' },
];

export const InputBar = () => {
    const { send, stop, isStreaming, messages } = useAIChat();
    const showPrompts = messages.length === 0;

    return (
        <div className={inputBarCss}>
            <Sender
                placeholder="输入消息，按 Enter 发送..."
                loading={isStreaming}
                onSubmit={value => {
                    if (value.trim()) {
                        send(value.trim());
                    }
                }}
                onCancel={stop}
                autoSize={{ minRows: 1, maxRows: 4 }}
                submitType="enter"
            />
            {showPrompts && (
                <div className={promptsWrapCss}>
                    <Prompts
                        title="你可以试试这些："
                        items={QUICK_PROMPTS}
                        onItemClick={info => send(info.data.label as string)}
                        wrap
                    />
                </div>
            )}
        </div>
    );
};
