import arrowIcon from '@/assets/images/workloads-overview-arrow-right.png';
import deploymentArtwork from '@/assets/images/workloads-overview-deployment-artwork.png';

import {overviewData} from '../mockData';
import {
    CardArrow,
    CardArtwork,
    CardLabel,
    SmallCard,
    SmallCardContent,
    SuccessValue,
} from './WorkloadsOverview.style';

export const DeploymentCard = () => {
    return (
        <SmallCard>
            <CardArtwork src={deploymentArtwork} alt="" aria-hidden="true" />
            <SmallCardContent>
                <CardLabel>最近部署</CardLabel>
                <SuccessValue>
                    {overviewData.deployment.status}
                    <CardArrow src={arrowIcon} alt="" aria-hidden="true" />
                </SuccessValue>
            </SmallCardContent>
        </SmallCard>
    );
};
