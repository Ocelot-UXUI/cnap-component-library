import {ReactNode} from 'react';

import {SectionTitle, StateGroup} from '../ComponentPlayground.style';

interface SectionShellProps {
    title: string;
    children: ReactNode;
}

export const SectionShell = ({title, children}: SectionShellProps) => (
    <>
        <SectionTitle>{title}</SectionTitle>
        <StateGroup>{children}</StateGroup>
    </>
);
