import {navigationActions, useNavigationSnapshot} from '@/contexts/NavigationContext';
import {css} from '@emotion/css';
import {Select} from '@/design';

import type {ContextRequirements} from '@/navigation';
import {isNil} from 'lodash';

interface NavigationContextSelectorsProps {
    requirements?: ContextRequirements;
}

const selectorsClass = css`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const selectClass = css`
    min-width: 132px;
`;

export function NavigationContextSelectors({ requirements = {} }: NavigationContextSelectorsProps) {
    const {
        accountId,
        applicationId,
        environmentId,
        accounts,
        availableApplications,
        availableEnvironments,
    } = useNavigationSnapshot();
    const { setAccountId, setApplicationId, setEnvironmentId } = navigationActions;

    const shouldShow = requirements.accountId || requirements.applicationId || requirements.environmentId;
    if (!shouldShow) {
        return null;
    }

    return (
        <div className={selectorsClass}>
            {requirements.accountId && (
                <Select
                    allowClear
                    className={selectClass}
                    placeholder="账号"
                    value={!isNil(accountId) ? String(accountId) : undefined}
                    options={accounts.map(item => ({ value: String(item.id), label: item.name }))}
                    onChange={value => setAccountId(value ?? undefined)}
                />
            )}
            {requirements.applicationId && (
                <Select
                    allowClear
                    className={selectClass}
                    disabled={!accountId}
                    placeholder="应用"
                    value={!isNil(applicationId) ? String(applicationId) : undefined}
                    options={availableApplications.map(item => ({ value: String(item.id), label: item.name }))}
                    onChange={value => setApplicationId(value || undefined)}
                />
            )}
            {requirements.environmentId && (
                <Select
                    allowClear
                    className={selectClass}
                    disabled={!applicationId}
                    placeholder="环境"
                    value={!isNil(environmentId) ? String(environmentId) : undefined}
                    options={availableEnvironments.map(item => ({
                        value: String(item.id),
                        label: item.environmentName,
                    }))}
                    onChange={value => setEnvironmentId(value || undefined)}
                />
            )}
        </div>
    );
}
