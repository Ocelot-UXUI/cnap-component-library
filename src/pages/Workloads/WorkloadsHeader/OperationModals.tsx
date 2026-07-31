import type {ComponentType} from 'react';

import {capabilityRegistry, listModalCapabilities} from '@/domain/workload';
import type {DialogKey} from '@/domain/workload';
import type {OperationCapability} from '@/interface/entities/runtimeOperation';
import {HorizontalScaleModal} from '../operations/horizontalScale/HorizontalScaleModal';
import {RestartModal} from '../operations/restart/RestartModal';
import {VerticalScaleModal} from '../operations/verticalScale/VerticalScaleModal';

interface OperationModalProps {
    appEnvID: string;
    clusterId?: string;
    environmentName?: string;
    defaultGroupId?: string;
    open: boolean;
    onClose: () => void;
}

/** dialog key → 弹窗组件（registry 只存 key，组件映射留在 UI 层） */
const DIALOG_COMPONENTS: Partial<Record<DialogKey, ComponentType<OperationModalProps>>> = {
    verticalScale: VerticalScaleModal,
    horizontalScale: HorizontalScaleModal,
    restart: RestartModal,
};

/** 支持通过标题栏操作按钮打开弹窗的能力（由注册表派生） */
export const MODAL_CAPABILITIES: Set<OperationCapability> = new Set(listModalCapabilities());

interface WorkloadOperationModalsProps {
    active: OperationCapability | null;
    appEnvID: string;
    clusterId?: string;
    environmentName?: string;
    defaultGroupId?: string;
    onClose: () => void;
}

export const WorkloadOperationModals = ({
    active,
    appEnvID,
    clusterId,
    environmentName,
    defaultGroupId,
    onClose,
}: WorkloadOperationModalsProps) => {
    const dialog = active ? capabilityRegistry[active]?.dialog : undefined;
    const Modal = dialog ? DIALOG_COMPONENTS[dialog] : undefined;
    if (!Modal) {
        return null;
    }
    return (
        <Modal
            appEnvID={appEnvID}
            clusterId={clusterId}
            environmentName={environmentName}
            defaultGroupId={defaultGroupId}
            open
            onClose={onClose}
        />
    );
};
