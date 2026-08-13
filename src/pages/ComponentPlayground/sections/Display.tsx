import {useState} from 'react';

import {Breadcrumb, Empty, Flex, Select} from '@/design';

import {StateLabel} from '../ComponentPlayground.style';
import {emptyConfiguratorClass, emptySelectClass} from './Display.style';
import {RichSection, SectionShell, SubGroup} from './SectionShell';

import type {EmptyImageType, EmptySize} from '@/design';

const imageTypeOptions: { label: string; value: EmptyImageType; }[] = [
    { label: 'empty-table', value: 'empty-table' },
    { label: 'empty', value: 'empty' },
    { label: 'no-auth', value: 'no-auth' },
    { label: 'no-data', value: 'no-data' },
    { label: 'no-target', value: 'no-target' },
];

const sizeOptions: { label: string; value: EmptySize; }[] = [
    { label: 'S（125 × 110）', value: 's' },
    { label: 'M（175 × 154）', value: 'm' },
    { label: 'L（248 × 218）', value: 'l' },
];

function EmptySection() {
    const [imageType, setImageType] = useState<EmptyImageType>('empty');
    const [size, setSize] = useState<EmptySize>('m');

    return (
        <RichSection title="Empty 空状态">
            <SubGroup title="antd 原生">
                <StateLabel>默认</StateLabel>
                <Empty />
                <StateLabel>自定义文案</StateLabel>
                <Empty description="暂无数据" />
            </SubGroup>
            <SubGroup title="CNAP 插图">
                <Flex vertical gap="large" className={emptyConfiguratorClass}>
                    <Flex gap="middle" align="center" wrap>
                        <StateLabel>imageType</StateLabel>
                        <Select<EmptyImageType>
                            className={emptySelectClass}
                            value={imageType}
                            options={imageTypeOptions}
                            onChange={setImageType}
                        />
                        <StateLabel>size</StateLabel>
                        <Select<EmptySize>
                            className={emptySelectClass}
                            value={size}
                            options={sizeOptions}
                            onChange={setSize}
                        />
                    </Flex>
                    <Empty
                        imageType={imageType}
                        size={size}
                        description={`${imageType} / ${size.toUpperCase()}`}
                    />
                </Flex>
            </SubGroup>
        </RichSection>
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
