/** 将 `@/routes` 的路径（前导斜杠 + `{param}`）转为 useRoutes 的相对 pattern（去斜杠 + `:param`）。 */
export function toPattern(path: string): string {
    return path.replace(/^\//, '').replace(/\{(\w+)\}/g, ':$1');
}
