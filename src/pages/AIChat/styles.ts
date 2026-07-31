/**
 * AIChat 页面样式
 */
import {css} from '@emotion/css';

import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {spacing} from '@/constants/spacing';

// 页面容器：撑满 full-bleed 内容区，外层 padding 由 WorkspaceContentLayout 控制
export const pageContainerCss = css`
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    position: relative;
`;

// 消息列表区：flex 撑满剩余空间，内部滚动
export const chatAreaCss = css`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: ${spacing.xl2}px ${spacing.xl2}px ${spacing.s}px;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
`;

// 欢迎屏：仅控制内边距，居中由外层 centeredPanelCss 负责
export const welcomeWrapCss = css`
    padding: 0 ${spacing.xl2}px ${spacing.l}px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

// 无消息时的居中面板：欢迎语 + 输入框整体垂直居中
export const centeredPanelCss = css`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 720px;
    width: 100%;
    margin: 0 auto;
    padding: 0 0 ${spacing.xl4}px;
    position: relative;
    z-index: 1;
`;

// 输入区：透明背景，融入内容区，底部留安全距离
export const inputBarCss = css`
    padding: ${spacing.s}px ${spacing.xl2}px ${spacing.xl4 + spacing.l}px;
    background: transparent;
    position: relative;
    z-index: 1;
`;

// 气泡列表
export const bubbleListCss = css`
    flex: 1;

    .ant-5-bubble-content {
        max-width: 80%;
    }
`;

// ThoughtChain 步骤卡片容器
export const thoughtChainWrapCss = css`
    margin: ${spacing.xs}px 0;
    padding: ${spacing.m}px ${spacing.l}px;
    background: ${semantic.bg.default};
    border-radius: ${radius.lg}px;
    border: 1px solid ${semantic.border.divider};
`;

export const userAvatarCss = css`
    background: ${semantic.state.info.default};
`;

export const assistantAvatarCss = css`
    background: ${semantic.state.success.default};
`;

export const statusPendingIconCss = css`
    color: ${semantic.icon.tertiary};
`;

export const statusRunningIconCss = css`
    color: ${semantic.state.info.default};
`;

export const statusSuccessIconCss = css`
    color: ${semantic.state.success.default};
`;

export const statusErrorIconCss = css`
    color: ${semantic.state.error.default};
`;

export const welcomeIconCss = css`
    font-size: ${spacing.xl6}px;
`;

// 快捷提示词容器
export const promptsWrapCss = css`
    margin-top: ${spacing.m}px;
    width: 100%;
`;
