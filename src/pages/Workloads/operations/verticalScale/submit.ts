/** 领域写模型 → verticalScale() 封装 API 入参的映射 */

import type {VerticalScaleInput} from '@/api/runtimeOperation';
import {buildVerticalScaleCommand} from '@/domain/workload';
import {toVerticalScaleRows} from './rows';
import type {RowState} from './rows';

export function toVerticalScaleInput(appEnvID: string, rows: RowState[], container?: string, operationName?: string): VerticalScaleInput {
    const command = buildVerticalScaleCommand(toVerticalScaleRows(rows, container));
    return {
        appEnvID,
        targets: command.targets.map(target => ({
            clusterId: target.ref.clusterId,
            resourceType: target.ref.resourceType,
            name: target.ref.name,
            container: target.container,
            resourceLimits: target.params?.resourceLimits as Record<string, string> | undefined,
            resourceRequests: target.params?.resourceRequests as Record<string, string> | undefined,
        })),
        operation: operationName!,
    };
}
