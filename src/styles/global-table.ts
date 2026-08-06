import {injectGlobal} from '@emotion/css';

import {semantic} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

/**
 * 全局 Table 样式（原 BaseTable 样式）。
 * 通过 injectGlobal 注入，对所有 antd Table 组件生效。
 *
 * 样式要点：白色表头/表体、48px 行高、表头三级文字色 + 中等字重、
 * 去除表头竖向分隔线、保留浅灰横向分割线、首列贴左对齐。
 */
injectGlobal({
    '.ant-5-table-wrapper': {
        '.ant-5-table': {
            background: semantic.bg.default,
            ...typography.body.regular,
        },
        '.ant-5-table-thead > tr > th': {
            height: spacing.xl8,
            padding: `${spacing.m + 1}px ${spacing.xl}px`,
            background: semantic.bg.default,
            color: semantic.text.tertiary,
            ...typography.body.medium,
        },
        '.ant-5-table-tbody > tr > td': {
            height: spacing.xl8,
            padding: `${spacing.m + 1}px ${spacing.xl}px`,
            color: semantic.text.primary,
        },
        '.ant-5-table-thead > tr > th:first-of-type, .ant-5-table-tbody > tr > td:first-of-type': {
            paddingLeft: spacing.xs,
        },
        '.ant-5-table-thead > tr > th::before': {
            display: 'none',
        },
        '.ant-5-table-thead .ant-5-table-column-sorters': {
            justifyContent: 'flex-start',
            '.ant-5-table-column-title': {
                flex: 'none',
            },
        },
        '.ant-5-table-thead > tr > th, .ant-5-table-tbody > tr > td': {
            borderBottomColor: semantic.border.divider,
        },
    },
    '.ant-5-checkbox-checked ,.ant-5-checkbox-indeterminate': {
        backgroundColor: semantic.button.primary.bg,
        borderColor: semantic.button.primary.bg,
    },
    '.ant-5-checkbox-indeterminate:after': {
        height: '2px',
    },
    '.ant-5-checkbox-wrapper:not(.ant-5-checkbox-wrapper-disabled):hover .ant-5-checkbox, .ant-5-checkbox:not(.ant-5-checkbox-disabled):hover .ant-5-checkbox': {
        borderColor: semantic.button.primary.bg,
    },
    '.ant-5-checkbox-indeterminate:not(.ant-5-checkbox-disabled):hover': {
        backgroundColor: semantic.button.primary.bg,
    },
    '.ant-5-checkbox-disabled:after': {
        borderColor: semantic.button.primary.text
    },
    '.ant-5-checkbox-wrapper:not(.ant-5-checkbox-wrapper-disabled):hover .ant-5-checkbox-checked:not(.ant-5-checkbox-disabled)': {
        backgroundColor: semantic.button.primary.bg
    },
    // Radio 选中态为 outline 形态：白底 + 黑环(border) + 黑色中心圆点。
    // antd 默认 checked 为「实心圆盘 + 白点」，故需覆盖 inner 背景与 ::after 圆点颜色。
    '.ant-5-radio-wrapper .ant-5-radio-checked': {
        backgroundColor: semantic.bg.default,
        borderColor: semantic.state.component.borderFocus,
    },
    '.ant-5-radio-wrapper .ant-5-radio:after': {
        backgroundColor: semantic.state.component.borderFocus,
    },
    '.ant-5-radio-wrapper:hover .ant-5-radio-checked:not(.ant-5-radio-disabled)': {
        backgroundColor: semantic.bg.default,
        borderColor: semantic.state.component.borderFocus,
    },
    '.ant-5-select-multiple .ant-5-select-content .ant-5-select-selection-item-content, .ant-5-select-multiple .ant-5-select-content .ant-5-select-selection-item-remove >.anticon': {
        color: semantic.state.brand.active,
    },
    '.ant-5-tooltip .ant-5-tooltip-container': {
        background: semantic.bg.default,
        color: semantic.text.primary,
    },
    '.ant-5-tooltip': {
        '--ant-5-tooltip-arrow-background-color': semantic.bg.default,
    },
    '.ant-5-btn-sm': {
        paddingTop: '2px',
        paddingBottom: '2px',
        fontSize: '12px',
    }
});
