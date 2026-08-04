import {Block, Switch} from '@/assets/icons';

import type {PodOperation} from '@/interface/entities/pod';
import type {ReactNode} from 'react';
import Icon, {DeleteOutlined} from '@ant-design/icons';

export function getPodOperationIcon(operation: PodOperation, fallback: ReactNode): ReactNode {
    switch (operation.capability) {
        case 'PodRestart':
            return (
                <Icon className='pod-operation-icon' component={Switch} style={{fill: 'none'}} />
            );
        case 'PodDelete':
        case 'PodDeleteForce':
            return <DeleteOutlined />;
        case 'PodBlock':
            return (
                <Icon component={Block} />
            );
        default:
            return fallback;
    }
}
