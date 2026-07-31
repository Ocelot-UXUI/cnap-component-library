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
        '.ant-5-table-thead > tr > th, .ant-5-table-tbody > tr > td': {
            borderBottomColor: semantic.border.divider,
        },
    },
});
