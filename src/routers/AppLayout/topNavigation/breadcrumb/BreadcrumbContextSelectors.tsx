import {HomeOutlined} from '@ant-design/icons';
import {Fragment, useMemo} from 'react';

import {navigationActions, useNavigationOptionGroups, useNavigationSnapshot} from '@/contexts/NavigationContext';

import {AccountDropdown} from './AccountDropdown';
import {ApplicationDropdown} from './ApplicationDropdown';
import {mapBreadcrumbOptionGroups} from './breadcrumbContextData';
import {
    BreadcrumbDivider,
    BreadcrumbHome,
    BreadcrumbRoot,
    DimensionList,
    SegmentSeparator,
} from './BreadcrumbContextSelectors.styles';
import {ClusterBreadcrumbSelector} from './ClusterBreadcrumbSelector';
import {DimensionSelector} from './DimensionSelector';
import {EnvironmentDropdown} from './EnvironmentDropdown';
import {useBreadcrumbSelectorWidth} from './useBreadcrumbSelectorWidth';

import type {ContextRequirements} from '@/navigation';
import type {BreadcrumbDimensionType, BreadcrumbSelectorOption} from './types';

interface BreadcrumbContextSelectorsProps {
    requirements: ContextRequirements;
}

const emptyOptionGroups = {};

function findSelectedName(
    groups: Record<string, BreadcrumbSelectorOption[]>,
    id?: string | number,
): string | undefined {
    return id === undefined ? undefined : groups.all?.find(option => option.id === String(id))?.name;
}

export function BreadcrumbContextSelectors({ requirements }: BreadcrumbContextSelectorsProps) {
    const snapshot = useNavigationSnapshot();
    const optionGroups = useNavigationOptionGroups();

    const accountGroups = useMemo(
        () => mapBreadcrumbOptionGroups(optionGroups?.account.data ?? emptyOptionGroups),
        [optionGroups?.account.data],
    );
    const applicationGroups = useMemo(
        () => mapBreadcrumbOptionGroups(optionGroups?.application.data ?? emptyOptionGroups),
        [optionGroups?.application.data],
    );
    const environmentGroups = useMemo(
        () => mapBreadcrumbOptionGroups(optionGroups?.environment.data ?? emptyOptionGroups),
        [optionGroups?.environment.data],
    );

    const visibleDimensions = useMemo<BreadcrumbDimensionType[]>(() => {
        const result: BreadcrumbDimensionType[] = [];
        if (requirements.accountId) {
            result.push('account');
        }
        if (requirements.applicationId) {
            result.push('application');
        }
        if (requirements.environmentId) {
            result.push('environment');
        }
        if (requirements.clusterId) {
            result.push('cluster');
        }
        return result;
    }, [requirements.accountId, requirements.applicationId, requirements.environmentId, requirements.clusterId]);

    const { containerRef, selectorMaxWidth } = useBreadcrumbSelectorWidth(visibleDimensions.length);

    return (
        <BreadcrumbRoot>
            <BreadcrumbHome>
                <HomeOutlined />
                CNAP
            </BreadcrumbHome>
            <BreadcrumbDivider />
            <DimensionList ref={containerRef}>
                {visibleDimensions.map((dimension, index) => (
                    <Fragment key={dimension}>
                        {index > 0 && <SegmentSeparator>/</SegmentSeparator>}
                        {dimension === 'account' && (
                            <DimensionSelector
                                label={findSelectedName(accountGroups, snapshot.accountId) ?? '--'}
                                maxWidth={selectorMaxWidth}
                                renderPanel={close => (
                                    <AccountDropdown
                                        optionGroups={accountGroups}
                                        value={snapshot.accountId !== undefined
                                            ? String(snapshot.accountId)
                                            : undefined}
                                        onSelect={id => {
                                            navigationActions.setAccountId(id ?? undefined);
                                            close();
                                        }}
                                    />
                                )}
                            />
                        )}
                        {dimension === 'application' && (
                            <DimensionSelector
                                label={findSelectedName(applicationGroups, snapshot.applicationId) ?? '--'}
                                maxWidth={selectorMaxWidth}
                                renderPanel={close => (
                                    <ApplicationDropdown
                                        optionGroups={applicationGroups}
                                        value={snapshot.applicationId !== undefined
                                            ? String(snapshot.applicationId)
                                            : undefined}
                                        onSelect={id => {
                                            navigationActions.setApplicationId(id || undefined);
                                            close();
                                        }}
                                    />
                                )}
                            />
                        )}
                        {dimension === 'environment' && (
                            <DimensionSelector
                                label={findSelectedName(environmentGroups, snapshot.environmentId) ?? '--'}
                                maxWidth={selectorMaxWidth}
                                renderPanel={close => (
                                    <EnvironmentDropdown
                                        optionGroups={environmentGroups}
                                        value={snapshot.environmentId !== undefined
                                            ? String(snapshot.environmentId)
                                            : undefined}
                                        onSelect={id => {
                                            navigationActions.setEnvironmentId(id || undefined);
                                            close();
                                        }}
                                    />
                                )}
                            />
                        )}
                        {dimension === 'cluster' && <ClusterBreadcrumbSelector maxWidth={selectorMaxWidth} />}
                    </Fragment>
                ))}
            </DimensionList>
        </BreadcrumbRoot>
    );
}
