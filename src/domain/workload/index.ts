/**
 * Workload 领域层公共入口。
 * 调用方仅从此处 import，不直接引用内部文件。
 */

export type {ContainerResourceSpecs} from './adapters';
export {toContainerResourceSpecs, toResourceRef} from './adapters';
export type {CapabilityDef, DialogKey, VerticalScaleRow} from './capability';
export {
    buildVerticalScaleCommand,
    capabilityRegistry,
    listBatchCapabilities,
    listModalCapabilities,
} from './capability';
export type {CommandTarget, OperationCommand, ResourceRef} from './model';
export type {Quantity, ResourceKind, ResourceSpec} from './resource';
export {
    formatQuantity,
    fromResourceSpec,
    isKnownUnit,
    isLimitGteRequest,
    isPositive,
    parseQuantity,
    RESOURCE_UNITS,
    toBaseValue,
    toResourceSpec,
} from './resource';
