import {PodDetailDrawer} from './PodDetailDrawer';
import {YamlDrawer} from './YamlDrawer';
import type {YamlTarget} from './yamlTarget';

import type {Pod} from '@/interface/entities/pod';

/** 抽屉视图：详情与 YAML 互斥，同一时间最多打开一个 */
export type DrawerView =
    | { type: 'detail'; pod: Pod; }
    | { type: 'yaml'; target: YamlTarget; };

interface DrawerHostProps {
    appEnvID: string;
    drawer: DrawerView | null;
    onClose: () => void;
}

export const DrawerHost = ({ appEnvID, drawer, onClose }: DrawerHostProps) => {
    if (drawer?.type === 'detail') {
        return (
            <PodDetailDrawer
                appEnvID={appEnvID}
                clusterId={drawer.pod.clusterId}
                podName={drawer.pod.name}
                open
                onClose={onClose}
            />
        );
    }
    if (drawer?.type === 'yaml') {
        return <YamlDrawer {...drawer.target} open onClose={onClose} />;
    }
    return null;
};
