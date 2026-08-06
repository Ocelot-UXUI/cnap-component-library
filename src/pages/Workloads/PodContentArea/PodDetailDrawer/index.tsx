import Icon from '@ant-design/icons';
import {Button, Divider, Flex} from '@/design';

import {Standalone} from '@/assets/icons';
import {APP_BASENAME} from '@/constants/app';
import {Drawer} from '@/design/Drawer';

import {renderOperations} from '../podCells';
import {PodDetailContent} from './PodDetailContent';
import {PodDetailTitle} from './PodDetailTitle';
import {usePodDetail} from './usePodDetail';

import type {Pod, PodOperation} from '@/interface/entities/pod';
import {semantic} from '@/constants/colors';

interface PodDetailDrawerProps {
    appEnvID: string;
    clusterId: string;
    podName: string;
    open: boolean;
    onClose: () => void;
    onPodOperation: (pod: Pod, operation: PodOperation) => void;
}

export const PodDetailDrawer = (
    { appEnvID, clusterId, podName, open, onClose, onPodOperation }: PodDetailDrawerProps,
) => {
    const detail = usePodDetail({ appEnvID, clusterId, podName, enabled: open });
    const { pod } = detail;

    const openStandalone = () => {
        const url = `${APP_BASENAME}/workloads/pods/${appEnvID}/${clusterId}/${encodeURIComponent(podName)}`;
        window.open(url, '_blank');
    };

    return (
        <Drawer
            open={open}
            width={980}
            title={<PodDetailTitle podName={podName} pod={pod} />}
            onClose={onClose}
            extra={
                <Flex gap="medium">
                    {pod && renderOperations(pod, onPodOperation)}
                    <Divider vertical style={{alignSelf: 'center'}} />
                    <Button
                        type="text"
                        aria-label="在新页面打开"
                        icon={<Icon component={Standalone} />}
                        onClick={openStandalone}
                        style={{color:semantic.text.secondary}}
                    />
                </Flex>
            }
            styles={{ body: { paddingTop: 12, display: 'flex', flexDirection: 'column' } }}
        >
            <PodDetailContent appEnvID={appEnvID} clusterId={clusterId} podName={podName} detail={detail} />
        </Drawer>
    );
};
