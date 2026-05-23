// ─── RBAC (Role-Based Access Control) ─────────────────────────────────────

export type UserRole = 'admin' | 'manager' | 'analyst' | 'viewer'

export type Permission =
  // Clientes
  | 'clientes:read' | 'clientes:create' | 'clientes:update' | 'clientes:delete'
  // Analytics
  | 'analytics:read' | 'analytics:export'
  // Financeiro
  | 'financeiro:read' | 'financeiro:write' | 'financeiro:admin'
  // Tarefas
  | 'tarefas:read' | 'tarefas:create' | 'tarefas:update' | 'tarefas:delete'
  // Configurações
  | 'config:read' | 'config:write'
  // Usuários (RBAC)
  | 'users:read' | 'users:manage'
  // Audit
  | 'audit:read'

// Mapeamento de papéis para permissões
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'clientes:read', 'clientes:create', 'clientes:update', 'clientes:delete',
    'analytics:read', 'analytics:export',
    'financeiro:read', 'financeiro:write', 'financeiro:admin',
    'tarefas:read', 'tarefas:create', 'tarefas:update', 'tarefas:delete',
    'config:read', 'config:write',
    'users:read', 'users:manage',
    'audit:read',
  ],
  manager: [
    'clientes:read', 'clientes:create', 'clientes:update',
    'analytics:read', 'analytics:export',
    'financeiro:read', 'financeiro:write',
    'tarefas:read', 'tarefas:create', 'tarefas:update', 'tarefas:delete',
    'config:read',
    'users:read',
    'audit:read',
  ],
  analyst: [
    'clientes:read',
    'analytics:read', 'analytics:export',
    'financeiro:read',
    'tarefas:read', 'tarefas:create', 'tarefas:update',
    'config:read',
  ],
  viewer: [
    'clientes:read',
    'analytics:read',
    'tarefas:read',
    'config:read',
  ],
}

// Verificar se usuário tem permissão
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

// Verificar se usuário tem alguma das permissões
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(p => ROLE_PERMISSIONS[role].includes(p))
}

// Verificar se usuário tem todas as permissões
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(p => ROLE_PERMISSIONS[role].includes(p))
}

// Obter todas as permissões de um papel
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role]
}

// Labels para papéis (UI)
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  analyst: 'Analista',
  viewer: 'Visualizador',
}

// Descrições para papéis
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Acesso total ao sistema, incluindo gerenciamento de usuários',
  manager: 'Pode gerenciar clientes, tarefas e financeiro',
  analyst: 'Acesso a analytics e tarefas operacionais',
  viewer: 'Somente visualização de dados',
}
