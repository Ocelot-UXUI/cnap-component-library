import styled from '@emotion/styled';
import {AnimatePresence, motion} from 'framer-motion';
import {useState} from 'react';

import {useAppEnvID, useNavigationSnapshot} from '@/contexts/NavigationContext';
import type {Pod, PodOperation} from '@/interface/entities/pod';
import type {OperationCapability} from '@/interface/entities/runtimeOperation';
import {BatchActionBar} from './BatchActionBar';
import {BatchPodDeleteRebuildModal} from './operations/batchDelete/BatchPodDeleteRebuildModal';
import {BatchPodForceDeleteModal} from './operations/batchDelete/BatchPodForceDeleteModal';
import {BatchRestartPodModal} from './operations/batchRestart/BatchRestartPodModal';
import {PodContentArea} from './PodContentArea';
import {reconcileGroup, selectedList} from './PodContentArea/selection';
import type {SelectedPods} from './PodContentArea/selection';
import {WorkloadsRuntimeProvider} from './useWorkloadsRuntime';
import {WorkloadsHeader} from './WorkloadsHeader';
import {WorkloadsOverview} from './WorkloadsOverview';

type ModalKey = 'restart' | 'delete' | 'force-delete';

/** Pod 行内操作能力 → 弹窗；未列出的能力（如屏蔽/解除屏蔽占位）不触发弹窗 */
const CAPABILITY_TO_MODAL: Partial<Record<OperationCapability, ModalKey>> = {
    PodRestart: 'restart',
    PodDelete: 'delete',
    PodDeleteForce: 'force-delete',
};

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const BatchBarSlot = styled(motion.div)`
    overflow: hidden;
    width: 900px;
    align-self: center;
`;

const WorkloadsPage = () => {
    const appEnvID = useAppEnvID();
    const snapshot = useNavigationSnapshot();
    const environmentName = snapshot.environments.find(item => item.id === snapshot.environmentId)?.environmentName;

    const [selection, setSelection] = useState<SelectedPods>({});
    const [modal, setModal] = useState<{ key: ModalKey; pods: Pod[]; } | null>(null);
    const selectedPods = selectedList(selection);

    const clearSelection = () => setSelection({});
    const handleSuccess = () => {
        clearSelection();
        setModal(null);
    };

    const handleGroupSelection = (groupId: string, keys: string[], rows: Pod[]) =>
        setSelection(prev => reconcileGroup(prev, groupId, keys, rows));

    /** Pod 行内操作：映射到对应弹窗，仅以该 Pod 为目标 */
    const handlePodOperation = (pod: Pod, operation: PodOperation) => {
        const key = CAPABILITY_TO_MODAL[operation.capability];
        if (!key || operation.disabled) {
            return;
        }
        setModal({ key, pods: [pod] });
    };

    const modalProps = {
        appEnvID: appEnvID ?? '',
        pods: modal?.pods ?? [],
        environmentName,
        onClose: () => setModal(null),
        onSuccess: handleSuccess,
    };

    return (
        <WorkloadsRuntimeProvider>
            <PageContainer>
                <WorkloadsHeader />
                <WorkloadsOverview />
                <PodContentArea
                    selection={selection}
                    onGroupSelectionChange={handleGroupSelection}
                    onPodOperation={handlePodOperation}
                />
                <AnimatePresence>
                    {selectedPods.length > 0 && (
                        <BatchBarSlot
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                        >
                            <BatchActionBar
                                pods={selectedPods}
                                onAction={key => setModal({ key: key as ModalKey, pods: selectedPods })}
                                onClose={clearSelection}
                            />
                        </BatchBarSlot>
                    )}
                </AnimatePresence>
                {appEnvID !== undefined && modal?.key === 'restart' && <BatchRestartPodModal {...modalProps} open />}
                {appEnvID !== undefined && modal?.key === 'delete' && (
                    <BatchPodDeleteRebuildModal {...modalProps} open />
                )}
                {appEnvID !== undefined && modal?.key === 'force-delete' && (
                    <BatchPodForceDeleteModal {...modalProps} open />
                )}
            </PageContainer>
        </WorkloadsRuntimeProvider>
    );
};

export default WorkloadsPage;
