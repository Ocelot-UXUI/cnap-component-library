import {css} from '@emotion/css';

/**
 * 视觉规范给定的弹窗尺寸档（px）：S 600 / M 800 / L 1024，默认 m。
 * 这些是设计规范直接给定的容器尺寸，不属于 spacing token 的语义范围。
 */
export const MODAL_SIZE_WIDTH = {
    s: 600,
    m: 800,
    l: 1024,
} as const;

// 内容区高度经 class 注入，避免与调用方自定义的 styles / classNames 结构冲突
const bodyHeight = (minHeight: number, maxHeight: number) => css`
    .ant-5-modal-body {
        min-height: ${minHeight}px;
        max-height: ${maxHeight}px;
        overflow-y: auto;
    }
`;

/** 各档内容区最小 / 最大高度：S 300~600、M 480~600、L 560~800 */
export const MODAL_SIZE_BODY_CLASS = {
    s: bodyHeight(300, 600),
    m: bodyHeight(480, 600),
    l: bodyHeight(560, 800),
} as const;
