import api from '@/lib/axios';

export interface UserListDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalCode: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginDate?: string;
}

export interface UserDetailDto extends UserListDto {
  adminNotes?: string;
  banReason?: string;
  lastLoginIp?: string;
  lockoutEnabled: boolean;
  lockoutEnd?: string;
  auditLogs: AuditLogDto[];
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
  pageNumber: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export const userService = {
  getUsers: async (filter: UserFilterDto) => {
    const params = new URLSearchParams();
    if (filter.searchTerm) params.append('searchTerm', filter.searchTerm);
    if (filter.role) params.append('role', filter.role);
    if (filter.isActive !== undefined) params.append('isActive', filter.isActive.toString());
    params.append('pageNumber', filter.pageNumber.toString());
    params.append('pageSize', filter.pageSize.toString());

    const url = `/admin/users?${params.toString()}`;
    console.log('Fetching users from:', url);

    const response = await api.get<PaginatedResult<UserListDto>>(url);
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await api.get<UserDetailDto>(`/admin/users/${id}`);
    return response.data;
  },

  changeStatus: async (id: string, isActive: boolean, banReason?: string) => {
    await api.patch(`/admin/users/${id}/status`, { isActive, banReason });
  },

  changeRole: async (id: string, role: string) => {
    await api.patch(`/admin/users/${id}/role`, { role });
  },

  resetPassword: async (id: string, newPassword: string) => {
    await api.post(`/admin/users/${id}/reset-password`, { newPassword });
  },

  forceLogout: async (id: string) => {
    await api.post(`/admin/users/${id}/force-logout`);
  },

  bulkAction: async (userIds: string[], action: string, reason?: string) => {
    await api.post(`/admin/users/bulk-action`, { userIds, action, reason });
  }
};
