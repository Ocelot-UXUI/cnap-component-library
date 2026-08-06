import {css} from '@emotion/css';
import {ComponentType, LazyExoticComponent, Suspense} from 'react';

import {semantic} from '@/constants/colors';
import {typography} from '@/constants/typography';

import type {ReactElement} from 'react';

const pageLoadingCss = css`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100%;
    color: ${semantic.text.secondary};
    font-size: ${typography.body.medium.fontSize}px;
`;

const PageLoading = () => (
    <div className={pageLoadingCss}>
        加载中...
    </div>
);

export const withSuspense = (Component: LazyExoticComponent<ComponentType>): ReactElement => (
    <Suspense fallback={<PageLoading />}>
        <Component />
    </Suspense>
);
