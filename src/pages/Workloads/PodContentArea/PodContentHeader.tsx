import {Button, Tooltip} from '@/design';

import {Expand, Refresh, Unexpand} from '@/assets/icons';
import moreLines from '@/assets/icons/view-detailed.svg';
import lessLines from '@/assets/icons/view-simple.svg';

import {HeaderActions, HeaderRow, HeaderTitle} from './PodContentArea.style';
import {
    ActionIcon,
    HeaderDivider,
    ModeSwitch,
    ViewIcon,
} from './PodContentHeader.style';

import type {ViewMode} from './types';

interface PodContentHeaderProps {
    mode: ViewMode;
    onModeChange: (mode: ViewMode) => void;
    onExpandAll: () => void;
    onCollapseAll: () => void;
    onRefresh: () => void;
}

export const PodContentHeader = ({
    mode,
    onModeChange,
    onExpandAll,
    onCollapseAll,
    onRefresh,
}: PodContentHeaderProps) => {
    return (
        <HeaderRow>
            <HeaderTitle>Pod列表</HeaderTitle>
            <HeaderActions>
                <Tooltip title="收起全部">
                    <Button
                        shape="circle"
                        size="medium"
                        type="text"
                        aria-label="收起全部"
                        icon={
                            <ActionIcon>
                                <Unexpand />
                            </ActionIcon>
                        }
                        onClick={onCollapseAll}
                    />
                </Tooltip>
                <Tooltip title="展开全部">
                    <Button
                        shape="circle"
                        size="medium"
                        type="text"
                        aria-label="展开全部"
                        icon={
                            <ActionIcon>
                                <Expand />
                            </ActionIcon>
                        }
                        onClick={onExpandAll}
                    />
                </Tooltip>
                <Tooltip title="刷新">
                    <Button
                        shape="circle"
                        size="medium"
                        type="text"
                        aria-label="刷新"
                        icon={
                            <ActionIcon>
                                <Refresh width={14} height={14} />
                            </ActionIcon>
                        }
                        onClick={onRefresh}
                    />
                </Tooltip>
                <HeaderDivider />
                <ModeSwitch
                    value={mode}
                    onChange={onModeChange}
                    options={[
                        {
                            label: (
                                <Tooltip title="详细">
                                    <ViewIcon aria-label="详细">
                                        <img src={moreLines} alt="" aria-hidden="true" />
                                    </ViewIcon>
                                </Tooltip>
                            ),
                            value: 'detailed',
                        },
                        {
                            label: (
                                <Tooltip title="精简">
                                    <ViewIcon aria-label="精简">
                                        <img src={lessLines} alt="" aria-hidden="true" />
                                    </ViewIcon>
                                </Tooltip>
                            ),
                            value: 'simple',
                        },
                    ]}
                />
            </HeaderActions>
        </HeaderRow>
    );
};
