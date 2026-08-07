/**
 * 集群表格行选中的共享纯逻辑。
 *
 * rowSelection 仅作为受控视图（selectedRowKeys 从 rows 派生），选中真源仍是各操作
 * 弹窗 rows 上的 row.selected；toggledKeys 将 antd 的整集合变化拆回逐行 TOGGLE_CLUSTER，
 * 使选中联动副作用（Lim 镜像、回滚等）继续走原 machine 逻辑。
 */

/** antd rowSelection onChange 的键类型（React Key，含 bigint） */
type RowSelectionKey = string | number | bigint;

/** 对比新旧选中键集合，返回需要翻转选中态的行 key（新增选中 + 取消选中） */
export function toggledKeys(
    rows: ReadonlyArray<{ key: string; selected: boolean }>,
    nextKeys: ReadonlyArray<RowSelectionKey>,
): string[] {
    const selected = new Set(rows.filter(row => row.selected).map(row => row.key));
    const next = new Set(nextKeys.map(String));
    return [
        ...[...next].filter(key => !selected.has(key)),
        ...[...selected].filter(key => !next.has(key)),
    ];
}
