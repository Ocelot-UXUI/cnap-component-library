import {css} from '@emotion/css';
import styled from '@emotion/styled';

export const DropdownPanel = styled.div`
    width: 480px;
    padding: 8px 8px 4px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    box-sizing: border-box;
`;

export const SearchRow = styled.div`
    height: 32px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 12px;
    color: #bfbfbf;
    box-sizing: border-box;
    margin-bottom: 2px;
`;

export const TabsRow = styled.div`
    height: 36px;
    display: flex;
    align-items: flex-start;
    gap: 32px;
    padding: 0 4px;
    margin-bottom: 6px;
`;

export const TabButton = styled.button<{ active: boolean; }>`
    position: relative;
    height: 36px;
    border: 0;
    padding: 0;
    background: transparent;
    color: ${({ active }) => active ? '#181818' : '#545454'};
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    line-height: 20px;
    font-weight: ${({ active }) => active ? 500 : 400};

    &::after {
        content: '';
        display: ${({ active }) => active ? 'block' : 'none'};
        position: absolute;
        left: 50%;
        bottom: 0;
        width: 40px;
        height: 2px;
        border-radius: 4px;
        background: #181818;
        transform: translateX(-50%);
    }
`;

export const OptionsList = styled.div`
    min-height: 158px;
    max-height: 238px;
    overflow-y: auto;
`;

export const FooterDivider = styled.div`
    height: 1px;
    background: #f2f2f2;
    margin: 2px 4px;
`;

export const FooterRow = styled.div`
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-around;
`;

export const FooterButton = styled.button`
    height: 32px;
    border: 0;
    padding: 0;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    color: #181818;
    font: inherit;
    font-size: 14px;
    line-height: 22px;
    cursor: pointer;
`;

export const searchInputClass = css`
    flex: 1;
    border: 0;
    outline: none;
    color: #181818;
    font-size: 14px;
    line-height: 22px;
    min-width: 0;

    &::placeholder {
        color: #bfbfbf;
    }
`;
