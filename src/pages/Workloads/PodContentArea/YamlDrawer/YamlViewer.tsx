import {yaml} from '@codemirror/lang-yaml';
import {search, SearchQuery, setSearchQuery} from '@codemirror/search';
import {EditorView} from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';
import type {ReactCodeMirrorRef} from '@uiw/react-codemirror';
import {useEffect, useRef} from 'react';

interface YamlViewerProps {
    value: string;
    /** 搜索关键字，驱动 CodeMirror 高亮全部匹配项 */
    keyword?: string;
}

/**
 * 只读 YAML 展示组件（CodeMirror 6，默认主题）。
 * 支持语法高亮、行号、代码折叠（foldGutter），以及由外部关键字驱动的搜索高亮。
 */
export const YamlViewer = ({ value, keyword = '' }: YamlViewerProps) => {
    const ref = useRef<ReactCodeMirrorRef>(null);

    useEffect(() => {
        const view = ref.current?.view;
        if (!view) {
            return;
        }
        view.dispatch({ effects: setSearchQuery.of(new SearchQuery({ search: keyword })) });
    }, [keyword, value]);

    return (
        <CodeMirror
            ref={ref}
            value={value}
            readOnly
            editable={false}
            height="calc(100vh - 120px)"
            extensions={[yaml(), search(), EditorView.lineWrapping]}
            basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                highlightActiveLine: false,
                highlightActiveLineGutter: false,
            }}
        />
    );
};
