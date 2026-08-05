import styled from '@emotion/styled';
import {Layout} from '@/design';

import {semantic} from '@/constants/colors';
import {HEADER_HEIGHT} from '@/constants/layout';
import {spacing} from '@/constants/spacing';

import type {ReactNode} from 'react';

const { Header } = Layout;

const FallbackHeader = styled(Header)`
    background: ${semantic.bg.default};
    padding: 0 ${spacing.l}px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid ${semantic.border.divider};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    height: ${HEADER_HEIGHT}px;
    line-height: ${HEADER_HEIGHT}px;
`;

interface FallbackTopNavLayoutProps {
    children: ReactNode;
}

export function FallbackTopNavLayout({ children }: FallbackTopNavLayoutProps) {
    return <FallbackHeader>{children}</FallbackHeader>;
}
