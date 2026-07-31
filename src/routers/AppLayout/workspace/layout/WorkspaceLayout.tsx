import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {HEADER_HEIGHT, MOBILE_BREAKPOINT} from '@/constants/layout';

import type {ReactNode} from 'react';

interface WorkspaceLayoutProps {
    children: ReactNode;
}

const WorkspaceLayoutRoot = styled.div`
    position: fixed;
    top: ${HEADER_HEIGHT}px;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    width: 100%;
    min-width: 0;
    background: ${semantic.bg.page};
    overflow: hidden;

    @media (max-width: ${MOBILE_BREAKPOINT}px) {
        overflow-x: auto;
    }
`;

export function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
    return <WorkspaceLayoutRoot>{children}</WorkspaceLayoutRoot>;
}
