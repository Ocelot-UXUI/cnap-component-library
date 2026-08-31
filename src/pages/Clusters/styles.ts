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
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, ${color} 14%, #fff);
    color: ${color};
    font-size: 16px;
`;

export const clusterCardClass = css`
    height: 100%;
    display: flex;
    flex-direction: column;
    border: 1px solid #e8ebf0;
    border-radius: 8px;
    background: #fff;
    box-shadow: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;

    &:hover {
        box-shadow: 0 4px 12px rgba(28, 32, 43, 0.08);
        border-color: #c9d0da;
    }
`;

export const providerSectionClass = css`
    margin-bottom: 32px;
`;

export const providerTitleClass = css`
    min-height: 48px;
    padding: 8px 12px;
    margin-bottom: 16px;
    border-radius: 8px;
    background: #f5f7fa;
    color: #181818;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
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
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(0, 0, 0, 0.45);
    font-size: 16px;
`;

export const statsValueClass = css`
    color: #181818;
    font-size: 20px;
    font-weight: 600;
    line-height: 28px;
`;

export const statsLabelClass = css`
    color: #7b818c;
    font-size: 12px;
    line-height: 18px;
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
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
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
    width: 256px;
`;

export const selectWidthClass = css`
    width: 140px;
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
