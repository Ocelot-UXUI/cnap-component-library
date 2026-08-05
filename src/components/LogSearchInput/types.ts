export interface LogSearchInputProps {
    /** 输入文本（受控） */
    value?: string;
    /** 输入文本默认值（非受控） */
    defaultValue?: string;
    /** 输入文本变化回调 */
    onChange?: (value: string) => void;
    /** 占位提示文本 */
    placeholder?: string;

    /** 匹配项总数（完全由外部控制） */
    total?: number;
    /** 当前匹配项序号（受控，可选；不传则为非受控，默认 total 为 0 时为 0，否则为 1） */
    current?: number;
    /** 点击上/下箭头切换当前匹配项时触发 */
    onCurrentChange?: (current: number) => void;

    /** 眼睛可见状态（受控） */
    visible?: boolean;
    /** 眼睛可见状态默认值（非受控） */
    defaultVisible?: boolean;
    /** 眼睛可见状态切换回调 */
    onVisibleChange?: (visible: boolean) => void;

    /** 点击清空按钮时触发（清空输入文本与匹配项信息） */
    onClear?: () => void;

    className?: string;
}
