import api from '@/lib/axios';
import { SubmitNursingReportDto } from '@/types/report';

export const nursingReportService = {
  createReport: async (data: SubmitNursingReportDto) => {
    const response = await api.post('/nursingreports', data);
    return response.data;
  }
};
