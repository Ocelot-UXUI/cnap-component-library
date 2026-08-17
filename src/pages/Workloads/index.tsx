import styled from '@emotion/styled';
import {AnimatePresence, motion} from 'framer-motion';
import {useRef, useState} from 'react';

import {Sticky} from '@/components/Sticky';
import {semantic} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {useAppEnvID, useNavigationSnapshot} from '@/contexts/NavigationContext';

import {BatchActionBar} from './BatchActionBar';
import {PodContentArea} from './PodContentArea';
import {reconcileGroup, selectedList} from './PodContentArea/selection';
import {StickyScrollStage} from './StickyScrollStage';
import {usePodOperationModal} from './usePodOperationModal';
import {WorkloadsRuntimeProvider} from './useWorkloadsRuntime';
import {WorkloadsHeader} from './WorkloadsHeader';
import {WorkloadsOverview} from './WorkloadsOverview';

import type {Pod} from '@/interface/entities/pod';
import type {ModalKey} from '@/overlay';
import type {SelectedPods} from './PodContentArea/selection';

/** 批量操作栏 action key → 全局弹窗 key */
const BATCH_KEY_TO_MODAL: Record<string, ModalKey> = {
    restart: 'pod-restart',
    delete: 'pod-delete',
    'force-delete': 'pod-force-delete',
};

const PageContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    /* min-height 而非 height：盒子须随 Stage+Spacer 增长——否则 WorkloadsHeader 的 sticky 约束矩形只到一屏，长内容深滚时 header 会被顶走 */
    min-height: 100%;
    padding: 0 ${spacing.xl4}px 0 ${spacing.xl4}px;
`;

/** 批量操作栏固定屏幕底部、PodContentArea 定高窗口下方 */
const BatchBarDock = styled(motion.div)`
    position: fixed;
    align-self: center;
    bottom: ${spacing.xl2}px;
    display: flex;
    justify-content: center;
    z-index: 1000;
    pointer-events: none;

    & > * {
        pointer-events: auto;
    }
`;

const WorkloadsPage = () => {
    const appEnvID = useAppEnvID();
    const snapshot = useNavigationSnapshot();
    const environmentName = snapshot.environments.find(item => item.id === snapshot.environmentId)?.environmentName;

    const [selection, setSelection] = useState<SelectedPods>({});
    const selectedPods = selectedList(selection);
    const headerRef = useRef<HTMLDivElement>(null);
    const batchBarRef = useRef<HTMLDivElement>(null);

    const clearSelection = () => setSelection({});

    const {openForPods, handlePodOperation} = usePodOperationModal({
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
                    ref={headerRef}
                    top="0px"
                    backgroundColor={semantic.bg.page}
                    style={{paddingBottom: `${spacing.l}px`, zIndex: 20}}
                >
                    <WorkloadsHeader />
                </Sticky>
                <WorkloadsOverview />
                <StickyScrollStage
                    headerRef={headerRef}
                    batchBarRef={batchBarRef}
                    batchBarVisible={selectedPods.length > 0}
                >
                    <PodContentArea
                        selection={selection}
                        onGroupSelectionChange={handleGroupSelection}
                        onPodOperation={handlePodOperation}
                    />
                </StickyScrollStage>
                <AnimatePresence>
                    {selectedPods.length > 0 && (
                        <BatchBarDock
                            ref={batchBarRef}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: 20}}
                            transition={{duration: 0.2, ease: 'easeInOut'}}
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
                        </BatchBarDock>
                    )}
                </AnimatePresence>
            </PageContainer>
        </WorkloadsRuntimeProvider>
    );
};

export default WorkloadsPage;
