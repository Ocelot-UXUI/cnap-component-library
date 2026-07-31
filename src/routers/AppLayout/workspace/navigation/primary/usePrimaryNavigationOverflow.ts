import {useCallback, useEffect, useRef, useState} from 'react';

interface PrimaryNavigationOverflowRefs {
    businessRef: React.RefObject<HTMLDivElement | null>;
    primaryRef: React.RefObject<HTMLDivElement | null>;
    utilityRef: React.RefObject<HTMLDivElement | null>;
}

interface PrimaryNavigationOverflowState extends PrimaryNavigationOverflowRefs {
    hiddenCount: number;
}

export function usePrimaryNavigationOverflow(itemCount: number): PrimaryNavigationOverflowState {
    const primaryRef = useRef<HTMLDivElement>(null);
    const businessRef = useRef<HTMLDivElement>(null);
    const utilityRef = useRef<HTMLDivElement>(null);
    const [hiddenCount, setHiddenCount] = useState(0);

    const updateOverflow = useCallback(() => {
        const business = businessRef.current;
        const utility = utilityRef.current;
        if (!business || !utility) {
            return;
        }
        const businessRect = business.getBoundingClientRect();
        const utilityRect = utility.getBoundingClientRect();
        const gap = utilityRect.top - businessRect.bottom;
        setHiddenCount(current => {
            if (gap < 52 && current < itemCount - 1) {
                return current + 1;
            }
            if (gap > 112 && current > 0) {
                return current - 1;
            }
            return current;
        });
    }, [itemCount]);

    useEffect(() => {
        updateOverflow();
        const observer = new ResizeObserver(updateOverflow);
        const nodes = [primaryRef.current, businessRef.current, utilityRef.current].filter(
            (node): node is HTMLDivElement => Boolean(node),
        );
        nodes.forEach(node => observer.observe(node));
        window.addEventListener('resize', updateOverflow);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateOverflow);
        };
    }, [updateOverflow]);

    return {
        businessRef,
        hiddenCount,
        primaryRef,
        utilityRef,
    };
}
