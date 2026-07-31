import styled from '@emotion/styled';

export const OptionRow = styled.div<{ selected: boolean; }>`
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    box-sizing: border-box;
    cursor: pointer;
    background: ${({ selected }) => selected ? 'rgba(167, 243, 207, 0.2)' : '#fff'};

    &:hover {
        background: ${({ selected }) => selected ? 'rgba(167, 243, 207, 0.2)' : '#f7f7f7'};
    }

    &:hover .breadcrumb-row-actions {
        opacity: 1;
        pointer-events: auto;
    }
`;

export const OptionMain = styled.div`
    display: flex;
    align-items: center;
    min-width: 0;
`;

export const AvatarCircle = styled.span<{ color?: string; }>`
    width: 32px;
    height: 32px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    background: ${({ color }) => color ?? '#a1e8ce'};
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    flex: 0 0 auto;
`;

export const EnvIcon = styled.span`
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    color: #1296db;
    flex: 0 0 auto;
`;

export const OptionText = styled.div`
    min-width: 0;
`;

export const OptionName = styled.div`
    color: #181818;
    font-size: 14px;
    line-height: 22px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const OptionIdentifier = styled.div`
    color: #8f8f8f;
    font-size: 12px;
    line-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const EnvTag = styled.span`
    height: 20px;
    border-radius: 4px;
    padding: 0 8px;
    display: inline-flex;
    align-items: center;
    background: #f2f2f2;
    color: #595959;
    font-size: 12px;
    line-height: 20px;
    margin-left: 4px;
`;

export const RowActions = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    color: #181818;
    opacity: 0;
    pointer-events: none;
`;
