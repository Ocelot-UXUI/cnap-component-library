import {Breadcrumb, Empty, Pagination, Tag, Tooltip} from 'antd';
import {useState} from 'react';

import {StateLabel} from '../ComponentPlayground.style';
import {SectionShell} from './SectionShell';

function TagSection() {
    return (
        <SectionShell title="Tag 标签">
            <StateLabel>default</StateLabel>
            <Tag>默认</Tag>
            <StateLabel>success</StateLabel>
            <Tag color="success">成功</Tag>
            <StateLabel>warning</StateLabel>
            <Tag color="warning">警告</Tag>
            <StateLabel>error</StateLabel>
            <Tag color="error">错误</Tag>
            <StateLabel>info</StateLabel>
            <Tag color="processing">进行中</Tag>
        </SectionShell>
    );
}

function PaginationSection() {
    const [page, setPage] = useState(1);
    return (
        <SectionShell title="Pagination 分页">
            <StateLabel>默认</StateLabel>
            <Pagination current={page} total={50} onChange={setPage} />
            <StateLabel>简洁</StateLabel>
            <Pagination simple current={page} total={50} onChange={setPage} />
            <StateLabel>带总数</StateLabel>
            <Pagination showTotal={(t) => `共 ${t} 条`} current={page} total={50} onChange={setPage} />
        </SectionShell>
    );
}

function EmptySection() {
    return (
        <SectionShell title="Empty 空状态">
            <StateLabel>默认</StateLabel>
            <Empty />
            <StateLabel>自定义</StateLabel>
            <Empty description="暂无数据" />
        </SectionShell>
    );
}

function TooltipSection() {
    return (
        <SectionShell title="Tooltip 文字提示">
            <StateLabel>hover</StateLabel>
            <Tooltip title="深色背景白字提示">
                <span>鼠标悬停查看</span>
            </Tooltip>
        </SectionShell>
    );
}

function BreadcrumbSection() {
    return (
        <SectionShell title="Breadcrumb 面包屑">
            <Breadcrumb
                items={[
                    {title: '首页'},
                    {title: '应用管理'},
                    {title: '当前页'},
                ]}
            />
        </SectionShell>
    );
}

export {TagSection, PaginationSection, EmptySection, TooltipSection, BreadcrumbSection};
