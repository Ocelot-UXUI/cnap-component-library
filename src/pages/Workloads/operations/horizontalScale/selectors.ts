/** 横向扩缩：从状态机 context 派生视图模型。 */

import type {HorizontalScaleContext} from './machine';
import {canSubmit} from './rows';

/** 确定按钮是否可用 */
export function selectCanSubmit(context: HorizontalScaleContext): boolean {
    return canSubmit(context.rows);
}

/** 底部提示文案（未满足提交条件时展示） */
export function selectBottomHint(context: HorizontalScaleContext): string {
    return selectCanSubmit(context) ? '' : '请选择一个集群后，再发起确定';
}
