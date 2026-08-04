import arrowIcon from '@/assets/images/workloads-overview-arrow-right.png';
import configArtwork from '@/assets/images/workloads-overview-config-artwork.png';

import {overviewData} from '../mockData';
import {
    CardArrow,
    CardArtwork,
    CardLabel,
    CardValue,
    SmallCard,
    SmallCardContent,
} from './WorkloadsOverview.style';

export const ConfigCard = () => {
    return (
        <SmallCard>
            <CardArtwork src={configArtwork} alt="" aria-hidden="true" />
            <SmallCardContent>
                <CardLabel>运行配置</CardLabel>
                <CardValue>
                    {overviewData.config.version}
                    <CardArrow src={arrowIcon} alt="" aria-hidden="true" />
                </CardValue>
            </SmallCardContent>
        </SmallCard>
    );
};
