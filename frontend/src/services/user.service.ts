import api from '@/lib/axios';
import {
  PatientSelfServiceAccessAuditEntry,
  PatientSelfServiceAccessSummary,
  UpdatePatientSelfServiceAccessDto
} from '@/types/patient-self-service';

export interface UserListDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalCode: string;
  role: string;
  roles: string[];
  effectivePermissions: string[];
  isActive: boolean;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  isLocked: boolean;
  isOnline: boolean;
  createdAt: string;
  lastLoginDate?: string;
  lockoutEnd?: string;
}

export interface UserDetailDto extends UserListDto {
  adminNotes?: string;
  banReason?: string;
  lastLoginIp?: string;
  lockoutEnabled: boolean;
  auditLogs: AuditLogDto[];
  assignedPatients: UserPatientAssignmentDto[];
}

export interface AuditLogDto {
  id: number;
  action: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
  performedBy: string;
}

export interface UserFilterDto {
  searchTerm?: string;
  role?: string;
  isActive?: boolean;
  isLocked?: boolean;
  pageNumber: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface CreateAdminUserDto {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  nationalCode?: string;
  password: string;
  roles: string[];
  isActive: boolean;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  adminNotes?: string;
}

export interface UpdateAdminUserDto {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  nationalCode?: string;
  roles: string[];
  isActive: boolean;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  adminNotes?: string;
}

export interface UpdateUserRolesDto {
  roles: string[];
}

export interface AdminResetPasswordDto {
  newPassword: string;
}

export interface SetUserLockDto {
  isLocked: boolean;
  lockoutEnd?: string;
  reason?: string;
}

export interface UpdateUserContactVerificationDto {
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
}

export interface UserPatientAssignmentDto {
  id: string;
  patientId: number;
  patientName: string;
  assignmentType: number;
  shiftSlot?: number;
  status: number;
  isPrimaryCaregiver: boolean;
  startDate: string;
  endDate?: string;
  notes: string;
}

export interface RoleManagementDto {
  name: string;
  isSystemRole: boolean;
  userCount: number;
  permissions: string[];
}

export interface RoleCatalogDto {
  roles: RoleManagementDto[];
  availablePermissions: string[];
}

export interface UpsertRoleDto {
  name: string;
  permissions: string[];
}

export const userService = {
  getUsers: async (filter: UserFilterDto) => {
    const params = new URLSearchParams();
    if (filter.searchTerm) params.append('searchTerm', filter.searchTerm);
    if (filter.role) params.append('role', filter.role);
    if (filter.isActive !== undefined) params.append('isActive', filter.isActive.toString());
    if (filter.isLocked !== undefined) params.append('isLocked', filter.isLocked.toString());
    params.append('pageNumber', filter.pageNumber.toString());
    params.append('pageSize', filter.pageSize.toString());

    const response = await api.get<PaginatedResult<UserListDto>>(`/admin/users?${params.toString()}`);
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await api.get<UserDetailDto>(`/admin/users/${id}`);
    return response.data;
  },

  createUser: async (data: CreateAdminUserDto) => {
    const response = await api.post<UserDetailDto>('/admin/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: UpdateAdminUserDto) => {
    const response = await api.put<UserDetailDto>(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    await api.delete(`/admin/users/${id}`);
  },

  changeStatus: async (id: string, isActive: boolean, banReason?: string) => {
    await api.patch(`/admin/users/${id}/status`, { isActive, banReason });
  },

  changeRole: async (id: string, role: string) => {
    await api.patch(`/admin/users/${id}/role`, { role });
  },

  changeRoles: async (id: string, data: UpdateUserRolesDto) => {
    await api.patch(`/admin/users/${id}/roles`, data);
  },

  setLock: async (id: string, data: SetUserLockDto) => {
    await api.patch(`/admin/users/${id}/lock`, data);
  },

  updateContactVerification: async (id: string, data: UpdateUserContactVerificationDto) => {
    await api.patch(`/admin/users/${id}/contact-verification`, data);
  },

  resetPassword: async (id: string, data: AdminResetPasswordDto) => {
    await api.post(`/admin/users/${id}/reset-password`, data);
  },

  forceLogout: async (id: string) => {
    await api.post(`/admin/users/${id}/force-logout`);
  },

  getRoleCatalog: async () => {
    const response = await api.get<RoleCatalogDto>('/admin/users/roles');
    return response.data;
  },

  createRole: async (data: UpsertRoleDto) => {
    const response = await api.post<RoleManagementDto>('/admin/users/roles', data);
    return response.data;
  },

  updateRole: async (currentRoleName: string, data: UpsertRoleDto) => {
    const response = await api.put<RoleManagementDto>(`/admin/users/roles/${encodeURIComponent(currentRoleName)}`, data);
    return response.data;
  },

  deleteRole: async (roleName: string) => {
    await api.delete(`/admin/users/roles/${encodeURIComponent(roleName)}`);
  },

  getSelfServiceAccess: async (id: string) => {
    const response = await api.get<PatientSelfServiceAccessSummary>(`/admin/users/${id}/self-service-access`);
    return response.data;
  },

  updateSelfServiceAccess: async (id: string, data: UpdatePatientSelfServiceAccessDto) => {
    const response = await api.put<PatientSelfServiceAccessSummary>(`/admin/users/${id}/self-service-access`, data);
    return response.data;
  },

  getSelfServiceAccessAudit: async (id: string) => {
    const response = await api.get<PatientSelfServiceAccessAuditEntry[]>(`/admin/users/${id}/self-service-access/audit`);
    return response.data;
  },

  bulkAction: async (userIds: string[], action: string, reason?: string) => {
    await api.post(`/admin/users/bulk-action`, { userIds, action, reason });
  }
};
