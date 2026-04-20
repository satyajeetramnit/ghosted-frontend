import axios, { AxiosError } from 'axios';
import { Application, ApplicationStatus, Note, ApiResponse, PageResponse } from '../types';
import toast from 'react-hot-toast';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
// In a real app, this would be fetched from an Auth context or token.
const MOCK_USER_ID = '123e4567-e89b-12d3-a456-426614174000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<any>>) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

export const applicationService = {
  fetchApplications: async (page = 0, size = 100, userId = MOCK_USER_ID): Promise<PageResponse<Application>> => {
    const response = await api.get<ApiResponse<PageResponse<Application>>>(
      `/applications?userId=${userId}&page=${page}&size=${size}`
    );
    return response.data.data;
  },

  createApplication: async (data: { companyName: string; jobTitle: string; contactName?: string; status: ApplicationStatus }): Promise<Application> => {
    const payload = {
      userId: MOCK_USER_ID,
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      contactName: data.contactName,
    };
    const response = await api.post<ApiResponse<Application>>('/applications', payload);
    const app = response.data.data;
    
    // If a non-default status was selected, update it
    if (data.status !== 'APPLIED' && app.id) {
       return await applicationService.updateStatus(app.id, data.status);
    }
    
    return app;
  },

  updateStatus: async (id: string, status: ApplicationStatus): Promise<Application> => {
    const response = await api.put<ApiResponse<Application>>(`/applications/${id}/status`, { status });
    return response.data.data;
  },

  addNote: async (id: string, content: string): Promise<Note> => {
    const response = await api.post<ApiResponse<Note>>(`/applications/${id}/notes`, { content });
    return response.data.data;
  }
};
