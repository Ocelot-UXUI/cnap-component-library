/* eslint-disable max-lines */
/**
 * Clusters 页面样式
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

export const providerIconClass = (color: string) =>
    css`
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${color};
    color: white;
    font-size: 20px;
`;

export const clusterCardClass = css`
    cursor: pointer;
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
    
    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-color: #1890ff;
    }
`;

export const providerSectionClass = css`
    margin-bottom: 32px;
`;

export const providerTitleClass = css`
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
`;

export const statsCardContentClass = css`
    display: flex;
    align-items: center;
    gap: 16px;
`;

export const statsIconClass = css`
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(0, 0, 0, 0.45);
    font-size: 20px;
`;

export const statsValueClass = css`
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 4px;
`;

export const statsLabelClass = css`
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
`;

export const clusterHeaderClass = css`
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
`;

export const clusterInfoClass = css`
    display: flex;
    gap: 12px;
    align-items: center;
`;

export const clusterNameClass = css`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
`;

export const clusterNameTextClass = css`
    font-weight: 600;
    font-size: 16px;
`;

export const clusterRegionClass = css`
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
`;

export const clusterActionsIconClass = css`
    font-size: 20px;
    cursor: pointer;
`;

export const resourceLabelClass = css`
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
`;

export const resourceTextClass = css`
    font-size: 12px;
`;

export const resourceValueClass = css`
    font-size: 12px;
    font-weight: 500;
`;

export const gpuSectionClass = css`
    font-size: 12px;
    margin-bottom: 4px;
`;

export const gpuItemClass = css`
    font-size: 12px;
`;

export const appCountClass = css`
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
`;

export const filterContainerClass = css`
    margin-bottom: 24px;
    display: flex;
    gap: 16px;
`;

export const pageHeaderFlexClass = css`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
`;

export const fullWidthClass = css`
    width: 100%;
`;

export const marginBottom24Class = css`
    margin-bottom: 24px;
`;

export const searchInputClass = css`
    max-width: 400px;
`;

export const selectWidthClass = css`
    width: 200px;
`;

export const emptyStateClass = css`
    text-align: center;
    padding: 48px 0;
    color: rgba(0, 0, 0, 0.45);
`;

export const statusHealthyClass = css`
    color: #52c41a;
`;

export const statusWarningClass = css`
    color: #faad14;
`;
