/**
 * @deprecated CNAP 2.0 起请使用 `palette` / `semantic` / `sidebar`（见 docs/design/design-tokens.md）。
 * 本文件保留用于兼容存量代码，新代码禁止引用。
 */
export const colors = {
    'white': '#fff',
    'black': '#000',
    'gray-1': '#fff',
    'gray-2': '#f7f7f7',
    'gray-3': '#f2f2f2',
    'gray-4': '#e8e8e8',
    'gray-5': '#d9d9d9',
    'gray-6': '#bfbfbf',
    'gray-7': '#8f8f8f',
    'gray-8': '#5c5c5c',
    'gray-9': '#2e2e2e',
    'gray-10': '#000',
    'primary': '#317ff5', // from #035fff
    'info': '#317ff5', // from #035fff
    'warning': '#f58300',
    'success': '#00cc6d',
    'error': '#e62c4b',
    'link': '#0047b3',
};

export type Color = keyof typeof colors;

// 以下颜色是自定义颜色，没有限制，可以自行添加
// 如果有非常相近的颜色，可以和视觉同学确认下能不能统一
// 在添加颜色之前，先确认一下 token 里面有没有对应的颜色，比如 colorPrimaryBg 之类的
// token 对应的规范可以看 https://panda-design-team.github.io/
export const myColors = {
    aiBg: '#8c66ff1a',
    steelBlueLight: '#e9ebef',
    muted: '#f8fafc',
    textBlue: '#60a5fa',
    darkGray: '#4b5563',
    lightGray: '#9ca3af',
    whiteTransparent: 'rgba(255, 255, 255, 0.5)',
    blueGray: '#4b6c9f',
    lightBlueGray: '#4b6c9f26',
    primaryTransparent40: '#0080ff66',
    lightBlueTransparent15: '#8dc9fe26',
    lightBlueTransparent30: '#8dc9fe4d',
    legacyPrimary: '#0080ff',
    primaryFocus: '#cce5ff',
    primaryBg: '#e5f2ff',
    primaryBgTransparent: '#e5f2ff33',
    purple: '#8862e6',
    purpleTransparent: '#8862e626',
    success: '#00aa5b',
    successTransparent: '#00cc6d1a',
    yellow: '#f58300',
    yellowTransparent: '#f583001a',
    infoTransparent15: '#317ff526',
    infoTransparent20: '#317ff533',
};
