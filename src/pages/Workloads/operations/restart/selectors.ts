/** 重启：从状态机 context 派生视图模型。 */

import type {RestartContext} from './machine';
import {canSubmitRows, isTimeoutValid} from './rows';

/** 确定按钮是否可用：至少选中一个合法集群且超时时间合法 */
export function selectCanSubmit(context: RestartContext): boolean {
    return canSubmitRows(context.rows) && isTimeoutValid(context.exitTimeout);
}

/** 底部提示文案（未满足提交条件时展示） */
export function selectBottomHint(context: RestartContext): string {
    return selectCanSubmit(context) ? '' : '请选择一个集群后，再发起确定';
}
