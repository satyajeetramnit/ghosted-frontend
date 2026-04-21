import axios, { AxiosError } from 'axios';
import { Application, ApplicationStatus, Note, ApiResponse, PageResponse } from '../types';
import toast from 'react-hot-toast';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for JWT
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<any>>) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    toast.error(message);
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (data: any) => {
    const response = await api.post('/auth/login', data);
    return response.data.data;
  },
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  }
};

export const contactService = {
  fetchContacts: async (page = 0, size = 100) => {
    const response = await api.get(`/contacts?page=${page}&size=${size}`);
    return response.data.data;
  },
  createContact: async (data: any) => {
    const response = await api.post('/contacts', data);
    return response.data.data;
  }
};

// Helper to map flat backend fields into the nested contact object for the UI
const mapApplication = (app: any): Application => ({
  ...app,
  contact: app.contactName ? {
    id: app.contactId || '',
    name: app.contactName,
    email: app.contactEmail,
    category: (app.contactCategory as any) || 'HR'
  } : undefined
});

export const applicationService = {
  fetchApplications: async (page = 0, size = 100): Promise<PageResponse<Application>> => {
    const response = await api.get<ApiResponse<PageResponse<Application>>>(
      `/applications?page=${page}&size=${size}`
    );
    
    const data = response.data.data;
    data.content = data.content.map(mapApplication);
    return data;
  },

  createApplication: async (data: { 
    companyName: string; 
    jobTitle: string; 
    contactName?: string; 
    contactId?: string;
    status: ApplicationStatus 
  }): Promise<Application> => {
    const payload = {
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      contactName: data.contactName,
      contactId: data.contactId,
    };
    const response = await api.post<ApiResponse<any>>('/applications', payload);
    let app = response.data.data;
    
    if (data.status !== 'APPLIED' && app.id) {
       app = await applicationService.updateStatus(app.id, data.status);
    }
    
    return mapApplication(app);
  },

  updateStatus: async (id: string, status: ApplicationStatus): Promise<Application> => {
    const response = await api.put<ApiResponse<any>>(`/applications/${id}/status`, { status });
    return mapApplication(response.data.data);
  },


  addNote: async (id: string, content: string): Promise<Note> => {
    const response = await api.post<ApiResponse<Note>>(`/applications/${id}/notes`, { content });
    return response.data.data;
  }
};

