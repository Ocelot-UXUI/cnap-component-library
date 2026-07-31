import {navigationActions, useNavigationOptionGroups, useNavigationSnapshot} from '@/contexts/NavigationContext';

import {ClusterDropdown} from './ClusterDropdown';
import {DimensionSelector} from './DimensionSelector';

interface ClusterBreadcrumbSelectorProps {
    maxWidth?: number;
}

export function ClusterBreadcrumbSelector({ maxWidth }: ClusterBreadcrumbSelectorProps) {
    const snapshot = useNavigationSnapshot();
    const optionGroups = useNavigationOptionGroups();
    const clusters = optionGroups?.cluster.data ?? [];
    const selectedCluster = clusters.find(item => item.clusterId === snapshot.clusterId);
    const label = selectedCluster?.clusterName ?? snapshot.clusterId ?? '全部集群';

    return (
        <DimensionSelector
            label={label}
            maxWidth={maxWidth}
            renderPanel={close => (
                <ClusterDropdown
                    clusters={clusters}
                    loading={optionGroups?.cluster.status === 'loading'}
                    error={optionGroups?.cluster.status === 'error'}
                    hasEnvironment={snapshot.environmentId !== undefined}
                    value={snapshot.clusterId}
                    onSelect={clusterId => {
                        navigationActions.setClusterId(clusterId);
                        close();
                    }}
                    onRetry={() => navigationActions.reloadClusters()}
                />
            )}
        />
    );
}
