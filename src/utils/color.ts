/* eslint-disable max-statements-per-line */
/**
 * 将 hex 颜色转换为 BorderGlow glowColor 所需的 "H S L" 格式
 * 例如: "#5E6AD2" → "232 57 60"
 */
export function hexToHslStr(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        return '40 80 80';
    }

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)} ${Math.round(l * 100)}`;
}

/**
 * 基于主色生成深色背景（降低亮度 + 饱和度）供 BorderGlow backgroundColor 使用
 */
export function toDarkBackground(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '#0f0f14';

    const r = Math.round(parseInt(result[1], 16) * 0.08);
    const g = Math.round(parseInt(result[2], 16) * 0.08);
    const b = Math.round(parseInt(result[3], 16) * 0.08);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
