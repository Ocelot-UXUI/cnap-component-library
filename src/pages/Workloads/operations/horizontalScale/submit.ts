/** 领域行 → horizontalScale() 封装 API 入参的映射 */

import type {HorizontalScaleInput} from '@/api/runtimeOperation';
import {toHorizontalScaleTargets} from './rows';
import type {HorizontalRow} from './rows';

export function toHorizontalScaleInput(appEnvID: string, rows: HorizontalRow[]): HorizontalScaleInput {
    return { appEnvID, targets: toHorizontalScaleTargets(rows) };
}
