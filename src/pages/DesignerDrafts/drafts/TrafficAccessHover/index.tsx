/**
 * [视觉初版 · DesignerDrafts]
 * 作者/日期：guoyucheng / 2026-08-17
 * 参照页面：Figma「流量接入/接入配置/hover展示操作区域【🌟头像形式】」
 * 数据：mock（本地 mock.ts）；对应类型：待研发确认
 * 待研发接手：接入真实流量接入数据、权限校验和新增/编辑/更多操作。
 */
import {
    AppstoreOutlined,
    ClusterOutlined,
    DownOutlined,
    GlobalOutlined,
    MoreOutlined,
    PlusOutlined,
    SettingOutlined,
    ShareAltOutlined,
} from '@ant-design/icons';
import {message, Dropdown, Flex, Tooltip} from '@/design';
import {useMemo, useState} from 'react';

import type {AccessType, TrafficAccess} from './mock';
import {trafficAccessList} from './mock';
import {
    AccessCard,
    AccessInfo,
    AccessName,
    AccessTag,
    ActionButton,
    Actions,
    DraftContent,
    DraftShell,
    FilterBar,
    FilterButton,
    Grid,
    HeaderTab,
    HeaderTabs,
    MetaDivider,
    MetaLabel,
    MetaLine,
    NameText,
    NavIcon,
    PageHeader,
    PageTitle,
    PrimaryNav,
    SecondaryNav,
    TypeAvatar,
} from './TrafficAccessHover.style';

const typeIconMap: Record<AccessType, React.ReactNode> = {
    ALB: <GlobalOutlined />,
    NodePort: <ShareAltOutlined />,
    ClusterIP: <ClusterOutlined />,
};

const notice = (label: string, access: TrafficAccess) => {
    message.info(`${label}：${access.name}（视觉初版占位）`);
};

function AccessActions({access}: { access: TrafficAccess; }) {
    return (
        <Actions data-access-actions gap={4}>
            <Tooltip title="新增上游接入" placement="top">
                <ActionButton
                    aria-label={`为 ${access.name} 新增上游接入`}
                    icon={<PlusOutlined />}
                    type="text"
                    onClick={() => notice('新增上游接入', access)}
                />
            </Tooltip>
            <Tooltip title="编辑接入配置" placement="top">
                <ActionButton
                    aria-label={`编辑 ${access.name} 的接入配置`}
                    icon={<SettingOutlined />}
                    type="text"
                    onClick={() => notice('编辑接入配置', access)}
                />
            </Tooltip>
            <Dropdown
                menu={{
                    items: [
                        {key: 'detail', label: '查看详情'},
                        {key: 'delete', danger: true, label: '删除接入'},
                    ],
                    onClick: ({key}) => notice(key === 'detail' ? '查看详情' : '删除接入', access),
                }}
                trigger={['click']}
            >
                <ActionButton
                    aria-label={`打开 ${access.name} 的更多操作`}
                    icon={<MoreOutlined />}
                    type="text"
                />
            </Dropdown>
        </Actions>
    );
}

function AccessCardItem({access}: { access: TrafficAccess; }) {
    return (
        <AccessCard tabIndex={0}>
            <TypeAvatar type={access.type}>
                {typeIconMap[access.type]}
            </TypeAvatar>
            <AccessInfo>
                <AccessName>
                    <NameText title={access.name}>{access.name}</NameText>
                    <AccessTag type={access.type}>{access.type}</AccessTag>
                </AccessName>
                <MetaLine>
                    <MetaLabel>接入方式</MetaLabel>
                    <span>{access.accessName}</span>
                    <MetaDivider />
                    <MetaLabel>工作负载</MetaLabel>
                    <span>{access.workloads.join('、')}</span>
                </MetaLine>
            </AccessInfo>
            <AccessActions access={access} />
        </AccessCard>
    );
}

export default function TrafficAccessHoverDraft() {
    const [selectedType, setSelectedType] = useState<AccessType | '全部方式'>('全部方式');

    const visibleAccesses = useMemo(
        () => trafficAccessList.filter(access => selectedType === '全部方式' || access.type === selectedType),
        [selectedType],
    );

    return (
        <DraftShell>
            <PrimaryNav aria-label="一级导航草稿">
                <NavIcon primary><AppstoreOutlined /></NavIcon>
                <NavIcon primary selected><ClusterOutlined /></NavIcon>
                <NavIcon primary><GlobalOutlined /></NavIcon>
            </PrimaryNav>
            <SecondaryNav aria-label="二级导航草稿">
                <NavIcon><ClusterOutlined /></NavIcon>
                <NavIcon selected><ShareAltOutlined /></NavIcon>
                <NavIcon><SettingOutlined /></NavIcon>
            </SecondaryNav>
            <DraftContent>
                <PageHeader align="center" gap={24} justify="space-between">
                    <Flex align="center" gap={24}>
                        <PageTitle>流量接入</PageTitle>
                        <HeaderTabs align="center" gap={24}>
                            <HeaderTab>流量拓扑</HeaderTab>
                            <HeaderTab active>接入配置</HeaderTab>
                        </HeaderTabs>
                    </Flex>
                    <button type="button" onClick={() => message.info('新增流量接入（视觉初版占位）')}>
                        新增流量接入
                    </button>
                </PageHeader>
                <FilterBar align="center" justify="space-between">
                    <PageTitle as="h2">Pod 列表</PageTitle>
                    <Flex gap={16}>
                        <Dropdown
                            menu={{
                                items: ['全部方式', 'ALB', 'NodePort', 'ClusterIP'].map(type => ({
                                    key: type,
                                    label: type,
                                    onClick: () => setSelectedType(type as AccessType | '全部方式'),
                                })),
                            }}
                        >
                            <FilterButton icon={<DownOutlined />} iconPosition="end">
                                {selectedType}
                            </FilterButton>
                        </Dropdown>
                        <FilterButton icon={<DownOutlined />} iconPosition="end">全部集群</FilterButton>
                    </Flex>
                </FilterBar>
                <Grid aria-label="接入配置列表">
                    {visibleAccesses.map(access => <AccessCardItem access={access} key={access.id} />)}
                </Grid>
            </DraftContent>
        </DraftShell>
    );
}
