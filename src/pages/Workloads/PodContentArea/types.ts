/** Pod 列表内容区本地类型 */

import type {QuickFilterKey} from './quickFilter';

export type ViewMode = 'detailed' | 'simple';

/** 页面级筛选态（作用于所有分组） */
export interface PodFilterState {
    /** Pod 状态多选 */
    status: string[];
    /** 屏蔽与解除屏蔽：true=已屏蔽 false=未屏蔽 undefined=不限 */
    blocked?: boolean;
    /** 搜索关键字（Pod 名 / IP） */
    keyword: string;
    /** 当前选中的快捷筛选（单选），无则 null */
    quick: QuickFilterKey | null;
}

/** 单个分组表格的分页/排序态 */
export interface GroupQuery {
    page: number;
    pageSize: number;
    /** 排序表达式：字段名 / -字段名；仅 restarts / creationTimestamp / status */
    sort?: string;
}

export const DEFAULT_FILTER: PodFilterState = { status: [], blocked: undefined, keyword: '', quick: null };
export const DEFAULT_QUERY: GroupQuery = { page: 1, pageSize: 10 };
