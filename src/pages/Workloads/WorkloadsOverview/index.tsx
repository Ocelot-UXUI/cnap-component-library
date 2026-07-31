import {ConfigCard} from './ConfigCard';
import {DeploymentCard} from './DeploymentCard';
import {ResourceCard} from './ResourceCard';
import {OverviewContainer} from './WorkloadsOverview.style';

export const WorkloadsOverview = () => {
    return (
        <OverviewContainer>
            <DeploymentCard />
            <ConfigCard />
            <ResourceCard />
        </OverviewContainer>
    );
};
