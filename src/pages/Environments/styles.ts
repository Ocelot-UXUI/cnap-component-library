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

export const envSectionTitleClass = css`
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
`;

export const envSectionDescClass = css`
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
    margin-bottom: 16px;
`;

export const envTypeTagClass = (type: string) => {
    const colors: Record<string, string> = {
        prod: '#ff4d4f',
        staging: '#faad14',
        sandbox: '#fa8c16',
        testing: '#52c41a',
        dev: '#1890ff',
    };
    return css`
        border-color: ${colors[type] || '#d9d9d9'};
        color: ${colors[type] || '#595959'};
    `;
};

export const pageHeaderFlexClass = css`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
`;

export const filterContainerClass = css`
    margin-bottom: 24px;
`;

export const emptyStateClass = css`
    text-align: center;
    padding: 48px 0;
    color: rgba(0, 0, 0, 0.45);
`;

export const transparentBgClass = css`
    background: transparent;
`;

export const searchInputWidthClass = css`
    width: 300px;
`;

export const selectWidthClass = css`
    width: 150px;
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
