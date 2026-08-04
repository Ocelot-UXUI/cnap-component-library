import styled from '@emotion/styled';
import {useParams} from 'react-router-dom';

import {PageLayoutHeader} from '@/design/Layouts/PageLayout';

import {renderOperations} from '../PodContentArea/podCells';
import {PodDetailContent} from '../PodContentArea/PodDetailDrawer/PodDetailContent';
import {PodDetailTitle} from '../PodContentArea/PodDetailDrawer/PodDetailTitle';
import {usePodDetail} from '../PodContentArea/PodDetailDrawer/usePodDetail';
import {usePodOperationModal} from '../usePodOperationModal';

const PageRoot = styled.div`
    height: 100%;
`;

type PodDetailParams = {
    appEnvID: string;
    clusterId: string;
    podName: string;
};

/** 独立 Pod 详情页面：标识来自路由参数（支持新标签页深链），与详情 Drawer 共用内容与操作入口 */
export default function PodDetailPage() {
    const { appEnvID = '', clusterId = '', podName = '' } = useParams<PodDetailParams>();
    const detail = usePodDetail({ appEnvID, clusterId, podName });
    const { pod } = detail;
    const { handlePodOperation } = usePodOperationModal({ appEnvID, onSuccess: detail.reload });

    return (
        <PageRoot>
            <PageLayoutHeader
                title={<PodDetailTitle podName={podName} pod={pod} />}
                extra={pod ? renderOperations(pod, handlePodOperation) : null}
            />
            <PodDetailContent appEnvID={appEnvID} clusterId={clusterId} podName={podName} detail={detail} />
        </PageRoot>
    );
}
