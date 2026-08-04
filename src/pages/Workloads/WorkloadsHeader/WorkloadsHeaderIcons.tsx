import {Restart, RightUser} from '@/assets/icons';
import {ScaleHorizontal, ScaleVertical} from '@/assets/icons';
import type {OperationCapability} from '@/interface/entities/runtimeOperation';
import type {ReactNode} from 'react';
import Icon, {BugOutlined, DeleteOutlined} from '@ant-design/icons';
import {css} from '@emotion/css';

// TODO 还是得在调整一下svg icon的处理方式
const fillNone = css`
    svg{
        fill: none;
    }
`

export function getPrimaryOperationIcon(capability: OperationCapability): ReactNode {
    switch (capability) {
        case 'Restart':
            return <Icon component={Restart} className={fillNone} />;
        case 'HorizontalScale':
            return <Icon component={ScaleHorizontal} />;
        case 'VerticalScale':
            return <Icon component={ScaleVertical} />;
        default:
            return undefined;
    }
}

export function getMenuOperationIcon(capability: OperationCapability, displayName: string): ReactNode {
    switch (capability) {
        case 'ApplicationUninstall':
            return <DeleteOutlined />;
        case 'HorizontalScale':
            return <Icon component={ScaleHorizontal} />;
        case 'VerticalScale':
            return <Icon component={ScaleVertical} />;
        case 'Restart':
            return <Icon component={Restart} />;
        default:
            break;
    }
    switch (displayName) {
        case '应用临时授权':
            return <Icon component={RightUser} />;
        case '开启调试':
            return <BugOutlined />;
        default:
            return undefined;
    }
}
