import Block from '@/assets/block.svg?react';
import moreDot from '@/assets/pod-row-actions-more-dot.png';
import Switch from '@/assets/switch.svg?react';
import deleteIconRaw from '@/assets/workloads-header-menu-delete.png';
import {IconFrame, IconPart, MoreDots, SvgIcon} from './PodOperationIcons.style';

import type {PodOperation} from '@/interface/entities/pod';
import type {ReactNode} from 'react';

const deleteIcon = (
    <IconFrame>
        <IconPart src={deleteIconRaw} alt="" aria-hidden="true" top={2} left={1} width={12} />
    </IconFrame>
);

export function getPodOperationIcon(operation: PodOperation, fallback: ReactNode): ReactNode {
    switch (operation.capability) {
        case 'PodRestart':
            return (
                <SvgIcon>
                    <Switch />
                </SvgIcon>
            );
        case 'PodDelete':
        case 'PodDeleteForce':
            return deleteIcon;
        case 'PodBlock':
            return (
                <SvgIcon>
                    <Block />
                </SvgIcon>
            );
        default:
            return fallback;
    }
}

export const moreIcon = (
    <MoreDots>
        <img src={moreDot} alt="" aria-hidden="true" />
        <img src={moreDot} alt="" aria-hidden="true" />
        <img src={moreDot} alt="" aria-hidden="true" />
    </MoreDots>
);
