export type ApplicationStatus = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED';

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

export interface Application {
  id: string;
  companyName: string;
  jobTitle: string;
  jobUrl?: string;
  status: ApplicationStatus;
  contactName?: string;
  appliedDate: string;
  followUpDate?: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
}

