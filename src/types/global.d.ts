declare module '*.png' {
    const url: string;
    export default url;
}

declare module '*.jpg' {
    const url: string;
    export default url;
}

declare module '*.gif' {
    const url: string;
    export default url;
}

declare module '*.svg' {
    import {SVGAttributes} from 'react';
    const url: string;
    export default url;
    export const ReactComponent: (props: SVGAttributes<SVGElement>) => JSX.Element;
}

declare module '*.module.less' {
    const content: {
        [className: string]: string;
    };
    export default content;
}

/** iCloud framework 全局变量类型声明 */
declare interface Window {
    __icloud__?: {
        username: string;
        realname?: string;
    };
    __custom__?: {
        headerElement?: HTMLElement;
    };
    __POWERED_BY_QIANKUN__?: boolean;
}
