import styled from '@emotion/styled';
import {AnimatePresence, motion} from 'framer-motion';
import {useState} from 'react';

import {useAppEnvID, useNavigationSnapshot} from '@/contexts/NavigationContext';
import {useOverlay} from '@/overlay';
import {BatchActionBar} from './BatchActionBar';
import {PodContentArea} from './PodContentArea';
import {reconcileGroup, selectedList} from './PodContentArea/selection';
import {WorkloadsRuntimeProvider} from './useWorkloadsRuntime';
import {WorkloadsHeader} from './WorkloadsHeader';
import {WorkloadsOverview} from './WorkloadsOverview';

import type {Pod, PodOperation} from '@/interface/entities/pod';
import type {OperationCapability} from '@/interface/entities/runtimeOperation';
import type {ModalKey} from '@/overlay';
import type {SelectedPods} from './PodContentArea/selection';

/** Pod 行内操作能力 → 全局弹窗 key；未列出的能力（如屏蔽/解除屏蔽占位）不触发弹窗 */
const CAPABILITY_TO_MODAL: Partial<Record<OperationCapability, ModalKey>> = {
    PodRestart: 'pod-restart',
    PodDelete: 'pod-delete',
    PodDeleteForce: 'pod-force-delete',
};

/** 批量操作栏 action key → 全局弹窗 key */
const BATCH_KEY_TO_MODAL: Record<string, ModalKey> = {
    restart: 'pod-restart',
    delete: 'pod-delete',
    'force-delete': 'pod-force-delete',
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
    const { openModal, closeModal } = useOverlay();

    const [selection, setSelection] = useState<SelectedPods>({});
    const selectedPods = selectedList(selection);

    const clearSelection = () => setSelection({});

    /** 统一经全局机制打开 Pod 操作弹窗；成功后清空选择并关闭 */
    const openPodModal = (key: ModalKey, pods: Pod[], operationName?: string) => {
        if (appEnvID === undefined) {
            return;
        }
        openModal(key, {
            appEnvID,
            pods,
            environmentName,
            operationName: operationName ?? '',
            onSuccess: () => {
                clearSelection();
                closeModal();
            },
        });
    };

    const handleGroupSelection = (groupId: string, keys: string[], rows: Pod[]) =>
        setSelection(prev => reconcileGroup(prev, groupId, keys, rows));

    /** Pod 行内操作：映射到对应弹窗，仅以该 Pod 为目标 */
    const handlePodOperation = (pod: Pod, operation: PodOperation) => {
        const key = CAPABILITY_TO_MODAL[operation.capability];
        if (!key || operation.disabled) {
            return;
        }
        openPodModal(key, [pod], operation.name);
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
                                onAction={(key, operationName) => {
                                    const modalKey = BATCH_KEY_TO_MODAL[key];
                                    if (modalKey) {
                                        openPodModal(modalKey, selectedPods, operationName);
                                    }
                                }}
                                onClose={clearSelection}
                            />
                        </BatchBarSlot>
                    )}
                </AnimatePresence>
            </PageContainer>
        </WorkloadsRuntimeProvider>
    );
};

export default WorkloadsPage;
