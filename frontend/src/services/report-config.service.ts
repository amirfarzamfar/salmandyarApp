import api from '@/lib/axios';
import { ReportCategory, CreateReportCategoryDto, UpdateReportCategoryDto, ReportItem, CreateReportItemDto, UpdateReportItemDto } from '@/types/report';

export const reportConfigService = {
  getCategories: async () => {
    const response = await api.get<ReportCategory[]>('/reportconfig/categories');
    return response.data;
  },
  createCategory: async (data: CreateReportCategoryDto) => {
    const response = await api.post<ReportCategory>('/reportconfig/categories', data);
    return response.data;
  },
  updateCategory: async (id: number, data: UpdateReportCategoryDto) => {
    const response = await api.put<ReportCategory>(`/reportconfig/categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id: number) => {
    await api.delete(`/reportconfig/categories/${id}`);
  },
  createItem: async (data: CreateReportItemDto) => {
    const response = await api.post<ReportItem>('/reportconfig/items', data);
    return response.data;
  },
  updateItem: async (id: number, data: UpdateReportItemDto) => {
    const response = await api.put<ReportItem>(`/reportconfig/items/${id}`, data);
    return response.data;
  },
  deleteItem: async (id: number) => {
    await api.delete(`/reportconfig/items/${id}`);
  }
};
