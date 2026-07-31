/**
 * Raw Resource 实体
 *
 * 用于获取 Kubernetes 资源原始 JSON/YAML，用于详情页的 YAML/JSON 查看。
 */

/**
 * Raw Resource 返回格式
 * - json：返回 JSON 对象
 * - yaml：返回 YAML 字符串
 */
export type RawResourceFormat = 'json' | 'yaml';
