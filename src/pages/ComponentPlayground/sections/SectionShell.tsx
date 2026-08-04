import {ReactNode} from 'react';

import {SectionTitle, StateGroup, SubGroupTitle} from '../ComponentPlayground.style';

interface SectionShellProps {
    title: string;
    children: ReactNode;
}

export const SectionShell = ({ title, children }: SectionShellProps) => (
    <>
        <SectionTitle>{title}</SectionTitle>
        <StateGroup>{children}</StateGroup>
    </>
);

export const RichSection = ({ title, children }: SectionShellProps) => (
    <>
        <SectionTitle>{title}</SectionTitle>
        {children}
    </>
);

export const SubGroup = ({ title, children }: SectionShellProps) => (
    <>
        <SubGroupTitle>{title}</SubGroupTitle>
        <StateGroup>{children}</StateGroup>
    </>
);
