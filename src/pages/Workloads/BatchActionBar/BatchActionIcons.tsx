import {Block, Close, Restart, Unblock} from '@/assets/icons';
import deleteRebuildIcon from '@/assets/images/batch-action-bar-delete-rebuild.png';
import forceDeleteIcon from '@/assets/images/batch-action-bar-force-delete.png';

import {FullIcon, SvgIcon} from './BatchActionBar.style';

import type {ReactNode} from 'react';

export const BATCH_ACTION_ICONS: Record<string, ReactNode> = {
    restart: (
        <SvgIcon>
            <Restart />
        </SvgIcon>
    ),
    delete: <FullIcon src={deleteRebuildIcon} alt="" aria-hidden="true" />,
    block: (
        <SvgIcon>
            <Block />
        </SvgIcon>
    ),
    unblock: (
        <SvgIcon>
            <Unblock />
        </SvgIcon>
    ),
    'force-delete': <FullIcon src={forceDeleteIcon} alt="" aria-hidden="true" />,
};

export const closeIcon = (
    <SvgIcon>
        <Close />
    </SvgIcon>
);
