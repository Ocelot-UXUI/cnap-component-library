/**
 * Environments 页面样式
 */
import {css} from '@emotion/css';

export const pageHeaderClass = css`
    margin-bottom: 24px;
`;

export const pageTitleClass = css`
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
`;

export const pageDescClass = css`
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
`;

export const envSectionClass = css`
    margin-bottom: 32px;
`;

export const envSectionHeaderClass = css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 48px;
    padding: 8px 12px;
    margin-bottom: 16px;
    border-radius: 12px;
    background: #f5f7fa;
`;

export const envSectionTitleClass = css`
    color: #181818;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    margin-bottom: 4px;
`;

export const envSectionDescClass = css`
    color: #7b818c;
    font-size: 12px;
    line-height: 18px;
`;

export const envTypeTagClass = (type: string) => {
    const colors: Record<string, string> = {
        prod: '#f04438',
        staging: '#f79009',
        sandbox: '#f79009',
        testing: '#16a765',
        dev: '#2468f2',
    };
    const backgrounds: Record<string, string> = {
        prod: '#ffe8e6',
        staging: '#fff0d8',
        sandbox: '#fff0d8',
        testing: '#e4f9ed',
        dev: '#e7efff',
    };
    return css`
        border-color: transparent;
        background: ${backgrounds[type] || '#f2f4f7'};
        color: ${colors[type] || '#595959'};
        border-radius: 4px;
    `;
};

export const pageHeaderFlexClass = css`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
`;

export const filterContainerClass = css`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
`;

export const emptyStateClass = css`
    text-align: center;
    padding: 48px 0;
    color: rgba(0, 0, 0, 0.45);
`;

export const searchInputWidthClass = css`
    width: 256px;
`;

export const selectWidthClass = css`
    width: 140px;
`;

export const environmentTableClass = css`
    .ant-5-table {
        background: #fff;
    }

    .ant-5-table-container {
        border-radius: 0;
    }

    .ant-5-table-thead > tr > th {
        height: 36px;
        padding: 0 12px;
        color: #7b818c;
        font-size: 12px;
        font-weight: 400;
        white-space: nowrap;
    }

    .ant-5-table-tbody > tr > td {
        height: 48px;
        padding: 0 12px;
        font-size: 12px;
    }

    .ant-5-table-tbody > tr:hover > td {
        background: #fafcff;
    }
`;

export const envNameClass = css`
    font-weight: 500;
    margin-bottom: 4px;
`;

export const envDescClass = css`
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
`;

export const clusterTagClass = css`
    margin-bottom: 4px;
`;

export const expiresWarningClass = css`
    color: #faad14;
`;

export const expiresIconClass = css`
    margin-right: 4px;
`;

export const permanentTextClass = css`
    color: rgba(0, 0, 0, 0.45);
`;

export const actionIconClass = css`
    font-size: 20px;
    cursor: pointer;
`;

export const statusHealthyClass = css`
    color: #52c41a;
`;

export const statusWarningClass = css`
    color: #faad14;
`;

export const statusErrorClass = css`
    color: #ff4d4f;
`;
