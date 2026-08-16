import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {spacing} from '@/constants/spacing';

/** 占位撑高的外层舞台：PinnedWindow 在此内 sticky，Spacer 追加滚动行程 */
export const Stage = styled.div`
    position: relative;
`;

/** 定高可视窗口：sticky 于 header 下方、overflow:hidden、无内部滚动条。top / height 运行时写入 */
export const PinnedWindow = styled.div`
    position: sticky;
    overflow: hidden;
    // 屏幕高度 - 云上百度header - workload的padding - worklaod header
    max-height: calc(100vh - 56px - 24px - 52px);
    border-radius: ${radius.xl}px;
    padding: ${spacing.xl2}px;
    background-color: ${semantic.bg.default};
`;

/** 承载 PodContentArea 全部真实内容；transform: translateY(-progress) 由 JS 搬运 */
export const Track = styled.div`
    position: relative;
    will-change: transform;
`;

/** 动态占位：height = scrubRange，由 JS 写入，延长外部滚动行程 */
export const Spacer = styled.div`
    width: 100%;
`;

/** 窗口底部分页器插槽：active 分组分页固定时 portal 到此，空时隐藏 */
export const PaginationSlot = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 4;

    &:empty {
        display: none;
    }

    &:not(:empty) {
        display: flex;
        justify-content: flex-end;
        padding: ${spacing.xs}px ${spacing.xl2}px;
        background: ${semantic.bg.default};
        border-top: 1px solid ${semantic.border.divider};
    }
`;
