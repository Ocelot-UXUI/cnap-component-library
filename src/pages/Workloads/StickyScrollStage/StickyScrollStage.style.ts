import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {spacing} from '@/constants/spacing';

/** 占位撑高的外层舞台：PinnedWindow 在此内 sticky，Spacer 追加滚动行程 */
export const Stage = styled.div`
    position: relative;
`;

/** 定高可视窗口：sticky 于 header 下方；内部为真实滚动容器（滚动条隐藏、禁锚点）。自身不得带 padding——scrollport=padding box，padding 会成为内容穿帮带，留白放 Track */
export const PinnedWindow = styled.div`
    position: sticky;
    overflow-y: scroll;
    overflow-x: hidden;
    scrollbar-width: none;
    overflow-anchor: none;
    // 屏幕高度 - 云上百度header - workload的padding - worklaod header
    max-height: calc(100vh - 56px - 24px - 52px);
    border-radius: ${radius.xl}px;
    padding: 0;
    background-color: ${semantic.bg.default};

    &::-webkit-scrollbar {
        display: none;
    }
`;

/** 承载 PodContentArea 全部真实内容；padding 作为内容首尾留白（见 PinnedWindow 注释）；内部 GroupHeader/表头/分页器为原生 sticky */
export const Track = styled.div`
    position: relative;
    padding: ${spacing.xl2}px;
`;

/** 动态占位：height = scrubRange，由 JS 写入，延长外部滚动行程 */
export const Spacer = styled.div`
    width: 100%;
`;
