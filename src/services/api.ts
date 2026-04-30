import axios, { AxiosError } from 'axios';
import { Application, ApplicationStatus, Note, ApiResponse, PageResponse, Contact, User, ContactCategory, Interview, InterviewType } from '../types';
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

// ─── Contact helpers ──────────────────────────────────────────────────────────

// Backend returns { companies: [{id, name}] } — flatten to companyName for UI
const mapContact = (contact: any): Contact => ({
  ...contact,
  companyName: contact.companies?.[0]?.name || contact.companyName || undefined,
});

export const contactService = {
  fetchContacts: async (page = 0, size = 100): Promise<PageResponse<Contact>> => {
    const response = await api.get<ApiResponse<PageResponse<Contact>>>(`/contacts?page=${page}&size=${size}`);
    const data = response.data.data;
    data.content = data.content.map(mapContact);
    return data;
  },
  createContact: async (data: { name: string; email?: string; phone?: string; linkedInUrl?: string; companyName?: string; category: ContactCategory }): Promise<Contact> => {
    const response = await api.post<ApiResponse<any>>('/contacts', data);
    return mapContact(response.data.data);
  },
  updateContact: async (id: string, data: Partial<Contact>): Promise<Contact> => {
    const response = await api.put<ApiResponse<any>>(`/contacts/${id}`, data);
    return mapContact(response.data.data);
  },
  deleteContact: async (id: string): Promise<void> => {
    await api.delete(`/contacts/${id}`);
  }
};

// ─── Date helpers ────────────────────────────────────────────────────────────

/**
 * Append 'Z' to LocalDateTime strings from the backend (e.g. "2026-04-28T09:00:00")
 * so JS treats them as UTC instead of local time.
 */
export function normalizeBackendDate(s: string | undefined | null): string {
  if (!s) return s as string;
  // Already has timezone info
  if (s.endsWith('Z') || s.includes('+') || /[-+]\d{2}:\d{2}$/.test(s)) return s;
  // datetime string without timezone
  if (s.includes('T')) return s + 'Z';
  return s;
}

/**
 * Parse a "YYYY-MM-DD" date string as local midnight.
 * Using new Date("YYYY-MM-DD") parses as UTC midnight, causing off-by-one-day
 * errors in non-UTC timezones. This avoids that.
 */
export function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// ─── Application helpers ──────────────────────────────────────────────────────

const mapApplication = (app: any): Application => ({
  ...app,
  contacts: Array.isArray(app.contacts)
    ? app.contacts
    : app.contactName
      ? [{ id: app.contactId || '', name: app.contactName, email: app.contactEmail, category: (app.contactCategory as any) || 'HR' }]
      : [],
  appliedDate: app.appliedDate || new Date().toISOString().slice(0, 10),
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

  getById: async (id: string): Promise<Application> => {
    const response = await api.get<ApiResponse<any>>(`/applications/${id}`);
    return mapApplication(response.data.data);
  },

  createApplication: async (data: { 
    companyName: string; 
    jobTitle: string; 
    contactName?: string; 
    contactIds?: string[];
    appliedDate?: string;
    status: ApplicationStatus;
  }): Promise<Application> => {
    const payload: any = {
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      contactName: data.contactName,
      contactIds: data.contactIds,
      appliedDate: data.appliedDate,
    };
    const response = await api.post<ApiResponse<any>>('/applications', payload);
    let app = response.data.data;
    
    if (data.status !== 'APPLIED' && app.id) {
       app = await applicationService.updateStatus(app.id, data.status);
    }
    
    return mapApplication(app);
  },

  updateAppliedDate: async (id: string, appliedDate: string): Promise<Application> => {
    const response = await api.put<ApiResponse<any>>(`/applications/${id}/applied-date`, { appliedDate });
    return mapApplication(response.data.data);
  },

  updateContacts: async (id: string, contactIds: string[]): Promise<Application> => {
    const response = await api.put<ApiResponse<any>>(`/applications/${id}/contacts`, { contactIds });
    return mapApplication(response.data.data);
  },

  updateStatus: async (id: string, status: ApplicationStatus): Promise<Application> => {
    const response = await api.put<ApiResponse<any>>(`/applications/${id}/status`, { status });
    return mapApplication(response.data.data);
  },

  // Notes
  addNote: async (id: string, content: string): Promise<Note> => {
    const response = await api.post<ApiResponse<Note>>(`/applications/${id}/notes`, { content });
    return response.data.data;
  },

  fetchNotes: async (applicationId: string): Promise<Note[]> => {
    const response = await api.get<ApiResponse<Note[]>>(`/applications/${applicationId}/notes`);
    return response.data.data;
  },

  // Interview Management
  addInterview: async (applicationId: string, data: any): Promise<any> => {
    const response = await api.post<ApiResponse<any>>(`/applications/${applicationId}/interviews`, data);
    return response.data.data;
  },
  updateInterview: async (applicationId: string, interviewId: string, data: any): Promise<any> => {
    const response = await api.put<ApiResponse<any>>(`/applications/${applicationId}/interviews/${interviewId}`, data);
    return response.data.data;
  },
  deleteInterview: async (applicationId: string, interviewId: string): Promise<void> => {
    await api.delete(`/applications/${applicationId}/interviews/${interviewId}`);
  },

  // OA Management
  updateOA: async (applicationId: string, data: any): Promise<any> => {
    const response = await api.put<ApiResponse<any>>(`/applications/${applicationId}/oa`, data);
    return response.data.data;
  },

  // Central Hub
  fetchAllInterviews: async (): Promise<(Interview & { application: Application })[]> => {
    const response = await api.get<ApiResponse<(Interview & { application: Application })[]>>('/applications/interviews');
    return response.data.data;
  },

  deleteApplication: async (id: string): Promise<void> => {
    await api.delete(`/applications/${id}`);
  },
};

// ─── Profile & Resume Builder ─────────────────────────────────────────────────

export interface BackendProfile {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  leetcode?: string;
  hackerrank?: string;
  currentTitle?: string;
  yearsExp?: string;
  existingSummary?: string;
  experiencesJson?: string;
  educationJson?: string;
  projectsJson?: string;
  preferencesJson?: string;
}

export interface BackendSavedResume {
  id: string;
  companyName: string;
  jobTitle: string;
  applicationId?: string | null;
  resumeDataJson: string;
  latexCode: string;
  createdAt: string;
  updatedAt: string;
}

export const profileService = {
  getProfile: async (): Promise<BackendProfile> => {
    const response = await api.get<ApiResponse<BackendProfile>>('/profile');
    return response.data.data;
  },
  saveProfile: async (data: BackendProfile): Promise<BackendProfile> => {
    const response = await api.put<ApiResponse<BackendProfile>>('/profile', data);
    return response.data.data;
  },
};

export const savedResumeService = {
  list: async (): Promise<BackendSavedResume[]> => {
    const response = await api.get<ApiResponse<BackendSavedResume[]>>('/profile/resumes');
    return response.data.data;
  },
  create: async (data: Omit<BackendSavedResume, 'id' | 'createdAt' | 'updatedAt'>): Promise<BackendSavedResume> => {
    const response = await api.post<ApiResponse<BackendSavedResume>>('/profile/resumes', data);
    return response.data.data;
  },
  update: async (id: string, data: Partial<Omit<BackendSavedResume, 'id' | 'createdAt' | 'updatedAt'>>): Promise<BackendSavedResume> => {
    const response = await api.put<ApiResponse<BackendSavedResume>>(`/profile/resumes/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/profile/resumes/${id}`);
  },
};

