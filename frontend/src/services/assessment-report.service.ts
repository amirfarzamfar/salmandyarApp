import axios from '@/lib/axios';
import { 
  ExamStatisticsDto, 
  UserExamResultDto, 
  UserAttemptDetailDto, 
  ExamAnalyticsDto, 
  ReportFilterDto 
} from '@/types/assessment-report';

const API_URL = '/assessment-reports';

export const assessmentReportService = {
  getExamStatistics: async (filter?: ReportFilterDto) => {
    const { data } = await axios.get<ExamStatisticsDto[]>(`${API_URL}/stats`, { params: filter });
    return data;
  },

  getExamUserReports: async (examId: number, filter?: ReportFilterDto) => {
    const { data } = await axios.get<UserExamResultDto[]>(`${API_URL}/exams/${examId}`, { params: filter });
    return data;
  },

  getUserAttemptDetail: async (submissionId: number) => {
    const { data } = await axios.get<UserAttemptDetailDto>(`${API_URL}/attempts/${submissionId}`);
    return data;
  },

  getExamAnalytics: async (examId: number) => {
    const { data } = await axios.get<ExamAnalyticsDto>(`${API_URL}/analytics/${examId}`);
    return data;
  }
};
