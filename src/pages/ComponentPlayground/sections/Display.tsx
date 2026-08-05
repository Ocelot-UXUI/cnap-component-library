import {Breadcrumb, Empty} from '@/design';

import {StateLabel} from '../ComponentPlayground.style';
import {SectionShell} from './SectionShell';

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

function BreadcrumbSection() {
    return (
        <SectionShell title="Breadcrumb 面包屑">
            <Breadcrumb
                items={[
                    { title: '首页' },
                    { title: '应用管理' },
                    { title: '当前页' },
                ]}
            />
        </SectionShell>
    );
}

export {BreadcrumbSection, EmptySection};
