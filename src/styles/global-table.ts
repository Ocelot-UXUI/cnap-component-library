import {injectGlobal} from '@emotion/css';

import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

/**
 * 全局 antd 组件样式修正（Table / Checkbox / Radio / Tag / Pagination / Switch / Tooltip）。
 * 通过 injectGlobal 注入，承载只能在 class 层解决、无法由主题 token 表达的视觉规范要求。
 *
 * Table 样式要点：白色表头/表体、48px 行高、表头三级文字色 + 中等字重、
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
        // 表头如果给rowSelection配置了selections，会有一个向下的箭头可以触发选择菜单，这里的padding是为了给该箭头足够的空间
        '.ant-5-table-container table>thead>tr:first-child >*:first-child': {
            paddingRight: '12px'
        },
    },
    // Checkbox 强调态统一走品牌绿（与 themes/presets.ts 的 Checkbox preset 对齐）。
    // 早期实现用深色主按钮底覆盖，导致同一页面出现深色与品牌绿两套选中色。
    '.ant-5-checkbox-checked ,.ant-5-checkbox-indeterminate': {
        backgroundColor: semantic.button.primary.bg,
        borderColor: semantic.button.primary.bg,
    },
    '.ant-5-checkbox-indeterminate:after': {
        height: '2px',
        backgroundColor: semantic.button.primary.text
    },
    '.ant-5-checkbox-disabled': {
        opacity: 0.7
    },
    '.ant-5-checkbox-wrapper:not(.ant-5-checkbox-wrapper-disabled):hover .ant-5-checkbox, .ant-5-checkbox:not(.ant-5-checkbox-disabled):hover .ant-5-checkbox': {
        borderColor: semantic.state.component.borderHover,
    },
    '.ant-5-checkbox-indeterminate:not(.ant-5-checkbox-disabled):hover': {
         backgroundColor: semantic.button.primary.bg,
         borderColor: semantic.button.primary.bg,
    },
    '.ant-5-checkbox-wrapper:not(.ant-5-checkbox-wrapper-disabled):hover .ant-5-checkbox-checked:not(.ant-5-checkbox-disabled)': {
        backgroundColor: semantic.button.primary.bg,
    },
    '.ant-5-checkbox-checked.ant-5-checkbox-disabled:after': {
        borderColor: semantic.button.primary.text,
    },
    '.ant-5-checkbox-disabled.ant-5-checkbox-indeterminate::after': {
        backgroundColor: semantic.button.primary.text
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
    // 已选禁用态：视觉规范要求「默认态 + 60% 透明度」，且内实心圆固定 6px。
    // 60% 与 6px 均无对应设计 token（spacing 无 6 档），故按受控局部值处理，勿外扩到其他组件。
    '.ant-5-radio-wrapper .ant-5-radio-checked.ant-5-radio-disabled': {
        backgroundColor: semantic.bg.default,
        borderColor: semantic.state.component.borderFocus,
        opacity: 0.6,
    },
    '.ant-5-radio-wrapper .ant-5-radio-checked.ant-5-radio-disabled:after': {
        width: '6px',
        height: '6px',
        backgroundColor: semantic.state.component.borderFocus,
    },
    '.ant-5-select-multiple .ant-5-select-content .ant-5-select-selection-item-content, .ant-5-select-multiple .ant-5-select-content .ant-5-select-selection-item-remove >.anticon': {
        color: semantic.state.brand.active,
    },
    '.ant-5-select.ant-5-select-sm': {
        '--ant-5-select-font-size': '12px',
    },
    '.ant-5-select-dropdown .ant-5-select-item': {
        borderRadius: radius.lg
    },
    // Tag：视觉规范要求无描边；关闭图标走辅助文字色；置灰态走禁用三件套
    '.ant-5-tag': {
        borderColor: 'transparent',
    },
    '.ant-5-tag .ant-5-tag-close-icon, .ant-5-tag .ant-5-tag-close-icon:hover': {
        color: 'inherit',
    },
    '.ant-5-tag.ant-5-tag-disabled': {
        background: semantic.state.component.disabledBg,
        color: semantic.text.disabled,
    },
    // Pagination：省略号走辅助色、激活项不加粗、条数选择器下拉面板 8px 圆角 / 选项 hover 6px
    '.ant-5-pagination .ant-5-pagination-jump-next .ant-5-pagination-item-container .ant-5-pagination-item-ellipsis': {
        color: semantic.icon.secondary,
    },
    '.ant-5-pagination .ant-5-pagination-item-active a': {
        fontWeight: typography.body.regular.fontWeight,
    },
    '.ant-5-pagination-options .ant-5-select-dropdown': {
        borderRadius: `${radius.lg}px`,
    },
    '.ant-5-pagination-options .ant-5-select-dropdown .ant-5-select-item': {
        borderRadius: `${radius.md}px`,
    },
    '.ant-5-pagination .ant-5-pagination-item:not(.ant-5-pagination-item-active)': {
        borderColor: semantic.state.component.borderDefault,
    },
    '.ant-5-pagination .ant-5-pagination-item:not(.ant-5-pagination-item-active):hover': {
        backgroundColor: semantic.bg.default
    },
    '.ant-5-switch.ant-5-switch-small.ant-5-switch-checked .ant-5-switch-handle': {
        insetInlineStart: 'calc(100% - 12px)',
    },
    '.ant-5-switch:hover:not(.ant-5-switch-disabled)': {
        opacity: 0.6
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
        fontSize: `${typography.body.small.fontSize}px`,
    },
    '.ant-5-btn.ant-5-btn-color-default.ant-5-btn-variant-outlined': {
        opacity: 0.6,
    },
    '.ant-5-btn-primary:disabled': {
        color: semantic.button.primary.text,
        backgroundColor: semantic.button.primary.bg,
        opacity: 0.6,
    },
    '.ant-5-btn.ant-5-btn-icon-only': {
        borderRadius: radius.md
    }
});
