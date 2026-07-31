import styled from '@emotion/styled';
import {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';

import {spacing} from '@/constants/spacing';

import type {ReactNode} from 'react';

const POLL_INTERVAL_MS = 100;
const POLL_TIMEOUT_MS = 2000;

const PortalFrame = styled.div`
    width: 100%;
    height: 100%;
    padding: 0 ${spacing.xl2}px;
`;

interface ICloudTopNavPortalLayoutProps {
    children: ReactNode;
    onPortalActive?: (active: boolean) => void;
}

export const ICloudTopNavPortalLayout = ({
    children,
    onPortalActive,
}: ICloudTopNavPortalLayoutProps) => {
    const [headerEl, setHeaderEl] = useState<HTMLElement | null>(
        () => window.__custom__?.headerElement ?? null,
    );

    useEffect(() => {
        if (headerEl) {
            onPortalActive?.(true);
            return;
        }

        let elapsed = 0;
        const timer = setInterval(() => {
            elapsed += POLL_INTERVAL_MS;
            const el = window.__custom__?.headerElement;
            if (el) {
                setHeaderEl(el);
                onPortalActive?.(true);
                clearInterval(timer);
            } else if (elapsed >= POLL_TIMEOUT_MS) {
                clearInterval(timer);
            }
        }, POLL_INTERVAL_MS);

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!headerEl) {
        return null;
    }

    return createPortal(<PortalFrame>{children}</PortalFrame>, headerEl);
};
