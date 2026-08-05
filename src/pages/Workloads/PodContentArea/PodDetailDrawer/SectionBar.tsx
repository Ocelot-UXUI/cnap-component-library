import type {ReactNode} from 'react';

import {SectionBarRoot, SectionBarTitle} from './PodDetailDrawer.style';

interface SectionBarProps {
    title: ReactNode;
    children?: ReactNode;
}

export const SectionBar = ({ title, children }: SectionBarProps) => {
    return (
        <SectionBarRoot>
            <SectionBarTitle>{title}</SectionBarTitle>
            {children}
        </SectionBarRoot>
    );
};
