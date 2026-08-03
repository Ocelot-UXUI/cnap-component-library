import type {Pod} from '@/interface/entities/pod';
import {DeleteModalBase} from '../DeleteModalBase';

interface BatchPodDeleteRebuildModalProps {
    appEnvID: string;
    pods: Pod[];
    environmentName?: string;
    /** 操作名，来自 RuntimeOperation.name */
    operationName: string;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const BatchPodDeleteRebuildModal = (props: BatchPodDeleteRebuildModalProps) => {
    return (
        <DeleteModalBase
            {...props}
            title="删除重建Pod"
            description="删除重建操作将触发集群释放当前 Pod 并重新申请、重新启动的过程"
            alertMessages={[
                '删除重建过程中会销毁当前 Pod 并创建新的 Pod；Pod 名称、IP、所在节点等属性会发生变化',
                '处于已驱逐（Evicted）状态的 Pod 会被彻底删除；其他状态的 Pod 会创建一个新的 Pod',
            ]}
            successText="批量删除重建命令已下发，查看执行详情"
            force={false}
        />
    );
};
