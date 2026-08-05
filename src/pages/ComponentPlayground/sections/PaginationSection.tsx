import {css} from '@emotion/css';
import {Pagination} from '@/design';

import {semantic} from '@/constants/colors';
import {antPrefixCls} from '@/constants/design';

import {HintText, StateLabel} from '../ComponentPlayground.style';
import {RichSection, SubGroup} from './SectionShell';

const underlineCls = css`
    .${antPrefixCls}-pagination-item-active {
        background: transparent;
        border-color: transparent;
    }
    .${antPrefixCls}-pagination-item-active a {
        border-radius: 0;
        border-bottom: 2px solid ${semantic.text.primary};
    }
`;

const PAGE_SIZE_OPTIONS = [10, 20, 30];

function PaginationSection() {
    return (
        <RichSection title="Pagination 分页">
            <SubGroup title="尺寸 / 样式">
                <StateLabel>M 带边框 + 显示条数</StateLabel>
                <Pagination total={100} defaultCurrent={1} showSizeChanger pageSizeOptions={PAGE_SIZE_OPTIONS} />
                <StateLabel>M 带边框</StateLabel>
                <Pagination total={100} defaultCurrent={1} showSizeChanger={false} />
                <StateLabel>S 带边框 + 显示条数</StateLabel>
                <Pagination
                    size="small"
                    total={100}
                    defaultCurrent={1}
                    showSizeChanger
                    pageSizeOptions={PAGE_SIZE_OPTIONS}
                />
                <StateLabel>S 带边框</StateLabel>
                <Pagination size="small" total={100} defaultCurrent={1} showSizeChanger={false} />
                <StateLabel>S 下划线</StateLabel>
                <Pagination
                    size="small"
                    total={100}
                    defaultCurrent={1}
                    showSizeChanger={false}
                    className={underlineCls}
                />
            </SubGroup>

            <SubGroup title="每页条数 PageSizeDropdown">
                <StateLabel>M · 展开可切换</StateLabel>
                <Pagination total={100} defaultCurrent={1} showSizeChanger pageSizeOptions={PAGE_SIZE_OPTIONS} />
                <StateLabel>S · 展开可切换</StateLabel>
                <Pagination
                    size="small"
                    total={100}
                    defaultCurrent={1}
                    showSizeChanger
                    pageSizeOptions={PAGE_SIZE_OPTIONS}
                />
            </SubGroup>

            <HintText>
                PageItem 的 Default / Active 已展示；Hover / Disabled / Ellipsis、ArrowButton（Prev/Next 的 Default /
                Hover / Disabled）及每页条数下拉展开均为交互态，请手动悬停 / 点击检视（首页时上一页箭头为 Disabled）。
            </HintText>
        </RichSection>
    );
}

export {PaginationSection};
