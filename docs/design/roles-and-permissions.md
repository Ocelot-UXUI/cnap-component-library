# Roles And Permissions

## Purpose

定义 CNAP 前端的角色和权限模型（当前版本）。

## Current State

CNAP 前端目前没有内置的角色权限管理系统。权限控制由后端 API 和 UUAP 认证平台统一处理。

## User Roles (via UUAP)

| Role            | Access                               |
| --------------- | ------------------------------------ |
| Authenticated   | 所有已登录用户可以访问控制台全部页面 |
| Unauthenticated | 重定向到 UUAP 登录页                 |

## AI Agent Permissions

AI Agent 的操作权限受限于:

1. **前端能力边界**: AI 只能执行 `src/capabilities/` 中注册的能力函数
2. **页面可见性**: AI 只能操作当前渲染的 DOM 元素
3. **路由范围**: AI 只能导航到当前已注册的路由

## Future Considerations

- 按应用/环境/集群的细粒度权限控制
- AI Agent 操作审计日志
- 敏感操作（删除、部署）的二次确认机制
