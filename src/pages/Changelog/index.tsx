/* eslint-disable max-len */
import {PageLayoutHeader} from '@/design/Layouts/PageLayout';
import {css} from '@emotion/css';
import {Tag, theme, Timeline} from '@/design';

const items = [
    {
        label: '2026-04-20',
        version: 'v2.6.0',
        tag: 'latest',
        color: 'blue',
        desc:
            '引入 @ant-design/x，新增 AI 助手页面，支持流式对话、Agentic 执行链路可视化（ThoughtChain + Think）、消息操作栏（复制、重新生成、反馈）',
    },
    {
        label: '2026-04-17',
        version: 'v2.5.0',
        tag: '',
        color: '',
        desc: '接入云上百度 UUAP 登录体系，集成顶部导航栏，支持用户身份认证与 UserContext 全局用户信息管理',
    },
    {
        label: '2026-04-14',
        version: 'v2.4.0',
        tag: '',
        color: '',
        desc: '新增毛玻璃主题、侧边栏 LiquidGlass 高亮效果、页面滚动视差标题动效',
    },
    {
        label: '2026-03-28',
        version: 'v2.3.0',
        tag: '',
        color: '',
        desc: '集成 Framer Motion，优化页面切换过渡动画和卡片进场效果',
    },
    {
        label: '2026-03-10',
        version: 'v2.2.0',
        tag: '',
        color: '',
        desc: '新增集群管理、环境管理、用户设置页面，完善多主题切换',
    },
    { label: '2026-02-18', version: 'v2.1.0', tag: '', color: '', desc: '引入 Ant Design 6，适配新版设计 Token 体系' },
];

const cardClass = css`
    background: rgba(255,255,255,0.6);
    border-radius: 8px;
    padding: 20px 24px;
    backdrop-filter: blur(12px);
`;

export default function ChangelogPage() {
    const { token } = theme.useToken();
    return (
        <div>
            <PageLayoutHeader title="更新日志" />
            <div className={cardClass}>
                <Timeline
                    items={items.map(item => ({
                        color: item.color || token.colorPrimary,
                        label: <span style={{ color: token.colorTextTertiary, fontSize: 12 }}>{item.label}</span>,
                        children: (
                            <div>
                                <span style={{ fontWeight: 600, marginRight: 8 }}>{item.version}</span>
                                {item.tag && <Tag color="blue">{item.tag}</Tag>}
                                <p style={{ color: token.colorTextSecondary, marginTop: 4, fontSize: 13 }}>
                                    {item.desc}
                                </p>
                            </div>
                        ),
                    }))}
                    mode="left"
                />
            </div>
        </div>
    );
}
