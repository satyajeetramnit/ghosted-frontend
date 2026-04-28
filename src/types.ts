export type ApplicationStatus = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN';
export type ContactCategory = 'HR' | 'POI' | 'OTHER';
export type InterviewType = 'TECHNICAL' | 'HR' | 'BEHAVIORAL' | 'SYSTEM_DESIGN' | 'MIXED';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'PENDING_FEEDBACK';
export type OAStatus = 'PENDING' | 'SUBMITTED' | 'EXPIRED' | 'PASSED' | 'FAILED';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  linkedInUrl?: string;
  companyName?: string;
  role?: string;
  category: ContactCategory;
}

export interface Interview {
  id: string;
  type: InterviewType;
  scheduledAt: string;
  status: InterviewStatus;
  notes?: string;
  meetingLink?: string;
  applicationId?: string;
  companyName?: string;
  jobTitle?: string;
}

export interface OnlineAssessment {
  id: string;
  platform?: string; // HackerRank, CodeSignal, etc.
  deadline?: string;
  status: OAStatus;
  notes?: string;
}

export interface Application {
  id: string;
  companyName: string;
  jobTitle: string;
  jobUrl?: string;
  status: ApplicationStatus;
  contacts: Contact[];
  interviews: Interview[];
  oa?: OnlineAssessment;
  appliedDate: string;
  followUpDate?: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
}

