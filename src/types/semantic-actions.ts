/**
 * AI 业务动作类型定义 - 按模块分类
 */

/** 通用操作 */
type CommonAction =
    | 'view'
    | 'create'
    | 'update'
    | 'delete'
    | 'search'
    | 'filter'
    | 'sort'
    | 'export'
    | 'import'
    | 'refresh'
    | 'submit'
    | 'cancel'
    | 'confirm'
    | 'close';

/** 用户相关操作 */
type UserAction =
    | 'uploadAvatar'
    | 'saveProfile'
    | 'updatePassword'
    | 'configure2FA'
    | 'revokeSession'
    | 'toggleTerminalFont';

/** 集群相关操作 */
type ClusterAction =
    | 'addCluster'
    | 'viewCluster'
    | 'deleteCluster'
    | 'shareCluster'
    | 'manageCredentials'
    | 'openClusterMenu';

/** 环境相关操作 */
type EnvironmentAction =
    | 'createEnvironment'
    | 'openCreateEnvironmentModal'
    | 'viewEnvironment'
    | 'deleteEnvironment'
    | 'settingsEnvironment'
    | 'openEnvironmentMenu';

/** 应用相关操作 */
type ApplicationAction =
    | 'createApplication'
    | 'viewApplication'
    | 'deleteApplication'
    | 'deployApplication'
    | 'configApplication'
    | 'submitSettings'
    | 'toggleViewMode';

/** 账户相关操作 */
type AccountAction =
    | 'createAccount'
    | 'viewAccount'
    | 'deleteAccount'
    | 'lockAccount'
    | 'unlockAccount';

/** 部署相关操作 */
type DeploymentAction =
    | 'submitDeploy'
    | 'viewDeploymentDetails'
    | 'viewDeploymentLogs';

/** 首页相关操作 */
type HomeAction =
    | 'viewDashboardStats'
    | 'manageFavorites'
    | 'openAppUrl'
    | 'openAppMenu'
    | 'quickNavigate';

/** 导航相关操作 */
type NavigationAction =
    | 'openMobileMenu'
    | 'toggleSidebar';

/** 主题相关操作 */
type ThemeAction = 'switchTheme';

/** 所有业务动作类型 */
export type AIAction =
    | CommonAction
    | UserAction
    | ClusterAction
    | EnvironmentAction
    | ApplicationAction
    | AccountAction
    | DeploymentAction
    | HomeAction
    | NavigationAction
    | ThemeAction;
