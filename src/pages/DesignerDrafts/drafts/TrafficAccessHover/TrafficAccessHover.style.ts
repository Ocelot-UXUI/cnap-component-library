import {semantic, sidebar} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {shadow} from '@/constants/shadow';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {Button, Flex, Tag} from '@/design';
import styled from '@emotion/styled';

export const DraftShell = styled.div`
    display: grid;
    min-height: 100vh;
    grid-template-columns: 60px 60px 1fr;
    background: ${semantic.bg.page};
    color: ${semantic.text.primary};
`;

export const PrimaryNav = styled.aside`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${spacing.s}px;
    padding-top: ${spacing.xl}px;
    background: ${sidebar.level1.bg};
`;

export const SecondaryNav = styled.aside`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${spacing.s}px;
    padding-top: ${spacing.xl}px;
    background: ${sidebar.level2.bg};
    box-shadow: ${shadow.m};
`;

export const NavIcon = styled.div<{ selected?: boolean; primary?: boolean; }>`
    display: grid;
    width: 48px;
    height: 48px;
    place-items: center;
    border-radius: ${radius.lg}px;
    color: ${({primary}) => (primary ? sidebar.level1.icon : sidebar.text.secondary)};
    background: ${({selected, primary}) => {
        if (!selected) {
            return 'transparent';
        }

        return primary ? sidebar.level1.selectedBg : sidebar.level2.selectedBg;
    }};
`;

export const DraftContent = styled.main`
    min-width: 0;
    padding: ${spacing.xl4}px ${spacing.xl4}px ${spacing.xl8}px;
`;

export const PageHeader = styled(Flex)`
    margin-bottom: ${spacing.xl2}px;
`;

export const PageTitle = styled.h1`
    margin: 0;
    ${typography.heading.h2};
`;

export const HeaderTabs = styled(Flex)`
    height: 36px;
    border-left: 1px solid ${semantic.border.divider};
    padding-left: ${spacing.xl2}px;
`;

export const HeaderTab = styled.button<{ active?: boolean; }>`
    position: relative;
    height: 36px;
    border: 0;
    padding: 0 ${spacing.s}px;
    background: transparent;
    color: ${({active}) => (active ? semantic.text.primary : semantic.text.tertiary)};
    ${typography.body.medium};
    cursor: pointer;

    &::after {
        position: absolute;
        right: ${spacing.s}px;
        bottom: 0;
        left: ${spacing.s}px;
        height: 2px;
        border-radius: ${radius.sm}px;
        background: ${semantic.text.primary};
        content: '';
        opacity: ${({active}) => (active ? 1 : 0)};
    }
`;

export const FilterBar = styled(Flex)`
    margin-bottom: ${spacing.xl}px;
`;

export const FilterButton = styled(Button)`
    min-width: 120px;
    justify-content: space-between;
`;

export const Grid = styled.section`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${spacing.l}px;

    @media (max-width: 960px) {
        grid-template-columns: 1fr;
    }
`;

export const AccessCard = styled.article`
    position: relative;
    display: flex;
    min-height: 112px;
    align-items: center;
    gap: ${spacing.m}px;
    overflow: hidden;
    border: 1px solid ${semantic.border.card};
    border-radius: ${radius.lg}px;
    padding: ${spacing.l}px;
    background: ${semantic.bg.default};
    transition: border-color 160ms ease, box-shadow 160ms ease;

    &:hover,
    &:focus-within {
        border-color: ${semantic.border.cardHover};
        box-shadow: ${shadow.s};
    }

    &:hover [data-access-actions],
    &:focus-within [data-access-actions] {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
    }
`;

export const TypeAvatar = styled.div<{ type: string; }>`
    display: grid;
    width: 42px;
    height: 42px;
    flex: 0 0 auto;
    place-items: center;
    border-radius: ${radius.lg}px;
    color: ${semantic.icon.primary};
    background: ${({type}) => {
        if (type === 'ALB') {
            return semantic.state.info.light;
        }

        if (type === 'ClusterIP') {
            return semantic.state.success.light;
        }

        return semantic.state.component.selectActive;
    }};
`;

export const AccessInfo = styled.div`
    min-width: 0;
    flex: 1;
`;

export const AccessName = styled.div`
    display: flex;
    min-width: 0;
    align-items: center;
    gap: ${spacing.s}px;
    margin-bottom: ${spacing.xs}px;
    ${typography.heading.h4};
`;

export const NameText = styled.span`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const AccessTag = styled(Tag)<{ type: string; }>`
    margin-inline-end: 0;
    border: 0;
    border-radius: ${radius.xl3}px;
    color: ${({type}) => {
        if (type === 'ALB') {
            return semantic.text.secondary;
        }

        if (type === 'ClusterIP') {
            return semantic.state.success.default;
        }

        return semantic.state.info.default;
    }};
    background: ${({type}) => {
        if (type === 'ALB') {
            return semantic.state.info.light;
        }

        if (type === 'ClusterIP') {
            return semantic.state.success.light;
        }

        return semantic.state.component.selectActive;
    }};
    ${typography.caption.regular};
`;

export const MetaLine = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${spacing.s}px;
    color: ${semantic.text.tertiary};
    ${typography.body.regular};
`;

export const MetaLabel = styled.span`
    color: ${semantic.text.placeholder};
`;

export const MetaDivider = styled.span`
    width: 1px;
    height: ${spacing.m}px;
    background: ${semantic.border.divider};
`;

export const Actions = styled(Flex)`
    position: absolute;
    top: ${spacing.l}px;
    right: ${spacing.l}px;
    opacity: 0;
    transform: translateY(-${spacing.xs}px);
    pointer-events: none;
    transition: opacity 160ms ease, transform 160ms ease;
`;

export const ActionButton = styled(Button)`
    display: grid;
    width: 24px;
    min-width: 24px;
    height: 24px;
    place-items: center;
    padding: 0;
    border-radius: ${radius.md}px;
    color: ${semantic.icon.secondary};

    &:hover,
    &:focus-visible {
        color: ${semantic.icon.primary};
        background: ${semantic.state.component.selectHover};
    }
`;
