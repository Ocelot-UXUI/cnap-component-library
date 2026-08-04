import {RangeSetBuilder, StateEffect, StateField} from '@codemirror/state';
import {Decoration, EditorView} from '@codemirror/view';
import type {EditorState, Extension} from '@codemirror/state';
import type {DecorationSet} from '@codemirror/view';

import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';

/** 由外部输入框驱动的关键字变更 effect，触发命中高亮重算 */
export const setHighlightKeyword = StateEffect.define<string>();

const matchMark = Decoration.mark({ class: 'cm-yamlSearchMatch' });

function buildMatches(state: EditorState, keyword: string): DecorationSet {
    if (!keyword) {
        return Decoration.none;
    }
    const builder = new RangeSetBuilder<Decoration>();
    const needle = keyword.toLowerCase();
    const haystack = state.doc.toString().toLowerCase();
    let from = haystack.indexOf(needle);
    while (from !== -1) {
        builder.add(from, from + needle.length, matchMark);
        from = haystack.indexOf(needle, from + needle.length);
    }
    return builder.finish();
}

interface HighlightState {
    keyword: string;
    decorations: DecorationSet;
}

const highlightField = StateField.define<HighlightState>({
    create() {
        return { keyword: '', decorations: Decoration.none };
    },
    update(value, tr) {
        let keyword = value.keyword;
        let dirty = tr.docChanged;
        for (const effect of tr.effects) {
            if (effect.is(setHighlightKeyword)) {
                keyword = effect.value;
                dirty = true;
            }
        }
        if (!dirty) {
            return value;
        }
        return { keyword, decorations: buildMatches(tr.state, keyword) };
    },
    provide: field => EditorView.decorations.from(field, value => value.decorations),
});

const highlightTheme = EditorView.theme({
    '.cm-yamlSearchMatch': {
        backgroundColor: semantic.logConsole.highlightBg,
        color: semantic.logConsole.highlightText,
        borderRadius: `${radius.sm}px`,
    },
});

/** 外部关键字驱动的 YAML 命中高亮扩展（不依赖 CodeMirror 搜索面板） */
export function yamlSearchHighlight(): Extension {
    return [highlightField, highlightTheme];
}
