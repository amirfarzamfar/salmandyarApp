import api from '@/lib/axios';
import { ServiceDefinition, CreateServiceDefinition, UpdateServiceDefinition } from '@/types/service';

export const serviceCatalogService = {
  getAll: async () => {
    const response = await api.get<ServiceDefinition[]>('/service-definitions');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ServiceDefinition>(`/service-definitions/${id}`);
    return response.data;
  },

  create: async (data: CreateServiceDefinition) => {
    const response = await api.post('/service-definitions', data);
    return response.data;
  },

  update: async (id: number, data: UpdateServiceDefinition) => {
    const response = await api.put(`/service-definitions/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/service-definitions/${id}`);
  },
};
