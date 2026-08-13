/**
 * 应用-流量接入实体
 *
 * 来源接口文档：《应用-流量接入（服务暴露）》
 * https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/BmpsRg9e55_8yB
 */

/** 接入目标：工作负载@集群 */
export interface AccessTarget {
    /** 工作负载名 */
    workload: string;
    /** 集群 ID（注意字段名是 cluster） */
    cluster?: string;
}

/**
 * 接入基础配置（各类型不同，原样透传）
 *
 * 文档字段为常见字段；其余类型字段通过索引签名开放透传。
 */
export interface AccessBasic {
    /** 工作负载名 */
    workload?: string;
    /** 容器名 */
    container?: string;
    /** 是否使用默认服务名 */
    useDefaultServiceName?: boolean;
    /** 运行账号 */
    runAccount?: string;
    /** 部署路径 */
    deployPath?: string;
    /** 是否覆盖全部集群 */
    allClusters?: boolean;
    /** 已选集群 ID 列表 */
    selectedClusters?: string[];
    /** 仅 nlb/alb：下游 ENS 接入记录 ID 列表（服务端校验，透传） */
    targetEnsIds?: string[];
    /** 其它类型字段原样透传 */
    [key: string]: unknown;
}

/** 接入端口 */
export interface AccessPort {
    /** 端口名 */
    name: string;
    /** 目标端口名 */
    targetPortName?: string;
    /** 目标端口号 */
    targetPort?: number;
}

/** 接入标签 */
export interface AccessTag {
    /** 标签名 */
    name: string;
    /** 标签值 */
    value: string;
}

/** 同步规则 */
export interface AccessSyncRules {
    /** 是否同步 EKS 标签 */
    syncEksLabels?: boolean;
    /** 是否等待 Pod 就绪 */
    waitPodReady?: boolean;
}

/**
 * 接入详细配置（各类型不同，原样透传）
 *
 * 文档字段为常见字段；其余类型字段通过索引签名开放透传。
 */
export interface AccessDetail {
    /** 端口列表 */
    ports?: AccessPort[];
    /** 标签列表 */
    tags?: AccessTag[];
    /** 同步规则 */
    syncRules?: AccessSyncRules;
    /** 其它类型字段原样透传 */
    [key: string]: unknown;
}

/**
 * 接入记录（GET/POST/PUT /application-environments/:appEnvID/accesses）
 */
export interface AccessRecord {
    /** 接入记录 ID，后续单条接口的 :accessID */
    id: string;
    /** 接入类型，见公共枚举 */
    type: string;
    /** 最终名称（已按类型规则渲染） */
    name: string;
    /** 目标工作负载@集群列表 */
    targets: AccessTarget[];
    /** 基础配置，各类型不同，原样透传 */
    basic?: AccessBasic;
    /** 详细配置，各类型不同，原样透传 */
    detail?: AccessDetail;
    /** 创建时间，RFC3339 */
    createdAt: string;
}

/** 接入列表分页响应 */
export interface AccessListResult {
    /** 过滤后的总条数 */
    total: number;
    /** 回显请求页码 */
    page: number;
    /** 回显每页条数 */
    pageSize: number;
    /** 接入记录列表 */
    items: AccessRecord[];
}

/** 创建接入请求体（POST /application-environments/:appEnvID/accesses） */
export interface AccessCreateBody {
    /** 接入类型，见公共枚举 */
    type: string;
    /** 基础名/自定义名，见命名规则；ENS Group 外为空则取首个 target 的 workload */
    name?: string;
    /** 目标工作负载@集群，非空，每项 workload 必填 */
    targets: AccessTarget[];
    /** 基础配置，原样透传（仅 nlb/alb 的 basic.targetEnsIds 会被校验） */
    basic?: AccessBasic;
    /** 详细配置，原样透传 */
    detail?: AccessDetail;
}

/** 更新接入请求体（PUT /application-environments/:appEnvID/accesses/:accessID） */
export type AccessUpdateBody = Omit<AccessCreateBody, 'type'> & {
    /** 不可变：留空表示不变，传入则必须与原记录一致，不一致返回 400 */
    type?: string;
};

/** 接入类型分组 */
export type AccessGroup = 'inner' | 'cross' | 'inbound';

/** 接入类型层级 */
export type AccessLayer = 'l4' | 'naming' | 'l7';

/** 接入依赖模式 */
export type AccessDependencyMode = 'any' | 'all';

/**
 * 可创建的接入类型（GET /application-environments/:appEnvID/access-types）
 */
export interface AccessType {
    /** 接入类型 */
    type: string;
    /** 展示名 */
    label: string;
    /** 分组：inner/cross/inbound */
    group: AccessGroup;
    /** 层级：l4/naming/l7 */
    layer: AccessLayer;
    /** 依赖的类型，无依赖时省略 */
    dependsOn?: string[];
    /** 依赖模式：any（任一满足）/all（全部满足） */
    dependencyMode?: AccessDependencyMode;
    /** 允许的下游节点类型（pod 表示工作负载） */
    downstream: string[];
    /** 可作为其上游的类型 */
    upstream?: string[];
    /** 默认命名模板 */
    nameTemplate?: string;
    /** 说明 */
    description: string;
    /** 当前依赖是否已满足、可否创建 */
    selectable: boolean;
    /** 缺失的依赖类型，selectable=true 时省略 */
    missingDependencies?: string[];
}

/**
 * 名称预览结果（GET /application-environments/:appEnvID/access-name-preview）
 */
export interface AccessNamePreview {
    /** 默认服务名（基于 workload 渲染）；无命名模板的类型（如 cnap）为空 */
    defaultName: string;
    /** 基于当前输入（name 或 workload）渲染出的最终名 */
    name: string;
    /** 自定义名是否合法 */
    valid: boolean;
    /** 不合法时的原因，合法时省略 */
    message?: string;
}

/** 拓扑节点类型 */
export type AccessTopologyNodeKind = 'access' | 'workload';

/** 流量拓扑节点 */
export interface AccessTopologyNode {
    /** 节点 ID：接入节点为 access/{accessID}，工作负载节点为 workload/{workload}@{cluster} */
    id: string;
    /** 节点类型：access（接入）/workload（工作负载端点） */
    kind: AccessTopologyNodeKind;
    /** 接入类型，仅 access 节点有 */
    type?: string;
    /** 展示名 */
    label: string;
    /** 接入名称或工作负载名 */
    name: string;
    /** 所在层 */
    layer: string;
    /** 层序号，用于纵向排序 */
    layerIndex: number;
    /** 所属虚线框（按 workload 或 cluster）；跨多个时为空 */
    groupId?: string;
    /** 关联集群 */
    clusterIds: string[];
    /** 关联工作负载 */
    workloads: string[];
    /** 对应接入记录 ID，仅 access 节点有 */
    accessId?: string;
}

/** 流量拓扑边（从上游节点指向下游节点） */
export interface AccessTopologyEdge {
    /** 上游节点 ID */
    from: string;
    /** 下游节点 ID */
    to: string;
}

/** 流量拓扑（GET /application-environments/:appEnvID/access-topology） */
export interface AccessTopology {
    /** 回显分组方式 */
    groupBy: 'workload' | 'cluster';
    /** 从外到内的分层顺序 */
    layers: string[];
    /** 节点列表 */
    nodes: AccessTopologyNode[];
    /** 有向边列表 */
    edges: AccessTopologyEdge[];
}
