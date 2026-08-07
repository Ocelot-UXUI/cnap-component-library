/**
 * 纵向扩缩：从状态机 context 派生视图模型。
 */

import type {VerticalScaleContext} from './machine';
import {canSubmit} from './rows';

/** 确定按钮是否可用 */
export function selectCanSubmit(context: VerticalScaleContext): boolean {
    return canSubmit(context.rows);
}

/** 底部提示文案：未选中集群 / 选中行校验未通过时分别提示 */
export function selectBottomHint(context: VerticalScaleContext): string {
    if (!context.rows.some(row => row.selected)) {
        return '请选择一个集群后，再发起确定';
    }
    // 不确定这里是否要提示用户校验失败
    return selectCanSubmit(context) ? '' : '';
}
