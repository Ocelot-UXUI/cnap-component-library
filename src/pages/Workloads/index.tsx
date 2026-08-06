import styled from '@emotion/styled';
import {AnimatePresence, motion} from 'framer-motion';
import {useState} from 'react';

import {useAppEnvID, useNavigationSnapshot} from '@/contexts/NavigationContext';
import {BatchActionBar} from './BatchActionBar';
import {PodContentArea} from './PodContentArea';
import {reconcileGroup, selectedList} from './PodContentArea/selection';
import {usePodOperationModal} from './usePodOperationModal';
import {WorkloadsRuntimeProvider} from './useWorkloadsRuntime';
import {WorkloadsHeader} from './WorkloadsHeader';
import {WorkloadsOverview} from './WorkloadsOverview';

import type {Pod} from '@/interface/entities/pod';
import type {ModalKey} from '@/overlay';
import type {SelectedPods} from './PodContentArea/selection';
import {spacing} from '@/constants/spacing';
import {semantic} from '@/constants/colors';
import {Sticky} from '@/components/Sticky';

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

    const [selection, setSelection] = useState<SelectedPods>({});
    const selectedPods = selectedList(selection);

    const clearSelection = () => setSelection({});

    const { openForPods, handlePodOperation } = usePodOperationModal({
        appEnvID,
        environmentName,
        onSuccess: clearSelection,
    });

    const handleGroupSelection = (groupId: string, keys: string[], rows: Pod[]) =>
        setSelection(prev => reconcileGroup(prev, groupId, keys, rows));

    return (
        <WorkloadsRuntimeProvider>
            <PageContainer>
                <Sticky
                    top="0px"
                    backgroundColor={semantic.bg.page}
                    style={{
                        paddingBottom: `${spacing.l}px`,
                    }}
                >
                    <WorkloadsHeader />
                </Sticky>
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
                                        openForPods(modalKey, selectedPods, operationName);
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
