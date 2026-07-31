import {useCallback, useEffect, useRef, useState} from 'react';

import {getBreadcrumbSelectorMaxWidth} from './breadcrumbContextWidth';

export function useBreadcrumbSelectorWidth(itemCount: number) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    const updateWidth = useCallback(() => {
        const width = containerRef.current?.getBoundingClientRect().width ?? 0;
        setContainerWidth(width);
    }, []);

    useEffect(() => {
        updateWidth();
        const observer = new ResizeObserver(updateWidth);
        const node = containerRef.current;
        if (node) {
            observer.observe(node);
        }
        window.addEventListener('resize', updateWidth);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateWidth);
        };
    }, [updateWidth]);

    return {
        containerRef,
        selectorMaxWidth: getBreadcrumbSelectorMaxWidth(containerWidth, itemCount),
    };
}
