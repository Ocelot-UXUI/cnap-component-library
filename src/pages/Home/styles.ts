import {css} from '@emotion/css';

export const dashboardCardClass = css`
    border: 1px solid #e8ebf0;
    border-radius: 8px;
    background: #fff;
    box-shadow: none;

    .ant-5-card-head {
        min-height: 48px;
        padding: 0 16px;
        border-bottom: 1px solid #eef0f3;
    }

    .ant-5-card-head-title {
        font-size: 14px;
        font-weight: 500;
    }

    .ant-5-card-body {
        padding: 16px;
    }
`;

export const dashboardStatsCardClass = css`
    height: 100%;

    .ant-5-card-body {
        min-height: 96px;
        display: flex;
        align-items: center;
    }
`;

export const dashboardSectionClass = css`
    width: 100%;
`;

export const quickActionButtonClass = css`
    height: 40px;
    border-radius: 6px;
`;
