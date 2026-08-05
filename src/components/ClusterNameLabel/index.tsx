import {useNavigationOptionGroups} from '@/contexts/NavigationContext';

import {ClusterNameLabelRoot} from './ClusterNameLabel.styles';
import {getClusterConnectorIcon} from './clusterConnectorIcons';

export {getClusterConnectorIcon} from './clusterConnectorIcons';

interface ClusterNameLabelProps {
    clusterName: string;
    clusterId: string;
}

export function ClusterNameLabel({ clusterName, clusterId }: ClusterNameLabelProps) {
    const optionGroups = useNavigationOptionGroups();
    const clusters = optionGroups?.cluster.data ?? [];
    const connector = clusters.find(item => item.clusterId === clusterId)?.clusterConnector;
    const icon = getClusterConnectorIcon(connector);

    return (
        <ClusterNameLabelRoot>
            {icon && <img className="cluster-connector-icon" style={{position: 'absolute'}} src={icon} alt={connector} />}
            <span style={{marginLeft: icon ? '24px': 0}}>{clusterName}</span>
        </ClusterNameLabelRoot>
    );
}
