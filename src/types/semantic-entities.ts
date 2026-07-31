/**
 * AI 业务实体类型定义 - 按模块分类
 */

/** 用户相关实体 */
type UserEntity =
    | 'user'
    | 'userProfile'
    | 'userPreference'
    | 'security'
    | 'session';

/** 集群相关实体 */
type ClusterEntity = 'cluster' | 'clusters';

/** 环境相关实体 */
type EnvironmentEntity = 'environment' | 'environments';

/** 账户相关实体 */
type AccountEntity = 'account' | 'accounts';

/** 应用相关实体 */
type ApplicationEntity = 'application' | 'applications';

/** 部署相关实体 */
type DeploymentEntity = 'deployment' | 'deployments';

/** 首页相关实体 */
type HomeEntity = 'dashboard' | 'favorites' | 'recentActivity';

/** 导航相关实体 */
type NavigationEntity = 'navigation';

/** 主题相关实体 */
type ThemeEntity = 'theme';

/** 所有业务实体类型 */
export type AIEntity =
    | UserEntity
    | ClusterEntity
    | EnvironmentEntity
    | ApplicationEntity
    | AccountEntity
    | DeploymentEntity
    | HomeEntity
    | NavigationEntity
    | ThemeEntity;
