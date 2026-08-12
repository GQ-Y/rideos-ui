import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";

interface PermissionContextValue {
  permissions: Set<string>;
}

const PermissionContext = createContext<PermissionContextValue>({ permissions: new Set() });

export interface PermissionProviderProps {
  /** 当前用户拥有的权限码 */
  permissions: string[];
  children?: ReactNode;
}

/** 注入当前用户权限(通常在应用根部) */
export function PermissionProvider({ permissions, children }: PermissionProviderProps) {
  const value = useMemo(() => ({ permissions: new Set(permissions) }), [permissions]);
  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

/** 判断是否拥有权限(any 语义:任一命中即通过) */
export function usePermission(required: string | string[]): boolean {
  const { permissions } = useContext(PermissionContext);
  const list = Array.isArray(required) ? required : [required];
  return list.some((code) => permissions.has(code));
}

export interface PermissionGuardProps {
  /** 所需权限码(数组为任一命中) */
  permission: string | string[];
  /** 无权限时的替代内容(缺省不渲染) */
  fallback?: ReactNode;
  children?: ReactNode;
}

/**
 * 权限包装(Pro):按钮/区块级权限控制
 */
export function PermissionGuard({ permission, fallback = null, children }: PermissionGuardProps) {
  const allowed = usePermission(permission);
  return <>{allowed ? children : fallback}</>;
}
