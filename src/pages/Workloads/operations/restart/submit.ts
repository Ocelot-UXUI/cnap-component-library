/** 领域行 → restartWorkload() 封装 API 入参的映射 */

import type {RestartInput} from '@/api/runtimeOperation';
import {toRestartTargets} from './rows';
import type {RestartRow} from './rows';

export function toRestartInput(
    appEnvID: string,
    rows: RestartRow[],
    container: string | undefined,
    exitTimeoutSeconds: number,
    operationName: string,
): RestartInput {
    return {
        appEnvID,
        targets: toRestartTargets(rows, container),
        exitTimeoutSeconds,
        operation: operationName,
    };
}
