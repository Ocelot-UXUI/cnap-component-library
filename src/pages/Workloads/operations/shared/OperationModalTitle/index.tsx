import type {ReactNode} from 'react';

import {TitleBar, TitleDivider, TitleEnv} from './OperationModalTitle.style';

interface OperationModalTitleProps {
    title: ReactNode;
    environmentName?: string;
}

/** 操作弹窗标题：主标题 + 分隔线 + 次级环境信息（次一级样式） */
export const OperationModalTitle = ({ title, environmentName }: OperationModalTitleProps) => (
    <TitleBar>
        <span>{title}</span>
        {environmentName && (
            <>
                <TitleDivider />
                <TitleEnv>环境 : {environmentName}</TitleEnv>
            </>
        )}
    </TitleBar>
);
