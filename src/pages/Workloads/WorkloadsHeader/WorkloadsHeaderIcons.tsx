import {Restart} from '@/assets/icons';
import horizontalScaleIcon from '@/assets/icons/scale-horizontal.svg';
import verticalScaleIcon from '@/assets/icons/scale-vertical.svg';
import debugIcon from '@/assets/workloads-header-menu-debug.png';
import deleteIcon from '@/assets/workloads-header-menu-delete.png';
import temporaryAuthIcon from '@/assets/workloads-header-menu-temporary-auth.png';

import {FullIcon, SvgIcon} from './WorkloadsHeaderActions.style';

import type {OperationCapability} from '@/interface/entities/runtimeOperation';
import type {ReactNode} from 'react';

const restartIcon = (
    <SvgIcon>
        <Restart />
    </SvgIcon>
);

export function getPrimaryOperationIcon(capability: OperationCapability): ReactNode {
    switch (capability) {
        case 'Restart':
            return restartIcon;
        case 'HorizontalScale':
            return <FullIcon src={horizontalScaleIcon} alt="" aria-hidden="true" />;
        case 'VerticalScale':
            return <FullIcon src={verticalScaleIcon} alt="" aria-hidden="true" />;
        default:
            return undefined;
    }
}

export function getMenuOperationIcon(capability: OperationCapability, displayName: string): ReactNode {
    if (capability === 'ApplicationUninstall') {
        return <FullIcon src={deleteIcon} size={14} alt="" aria-hidden="true" />;
    }
    switch (displayName) {
        case '应用临时授权':
            return <FullIcon src={temporaryAuthIcon} size={14} alt="" aria-hidden="true" />;
        case '开启调试':
            return <FullIcon src={debugIcon} size={14} alt="" aria-hidden="true" />;
        default:
            return undefined;
    }
}
