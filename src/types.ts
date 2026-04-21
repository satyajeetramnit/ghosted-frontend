export type ApplicationStatus = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
export type ContactCategory = 'HR' | 'POI';

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
  companyName?: string;
  category: ContactCategory;
}

export interface Application {
  id: string;
  companyName: string;
  jobTitle: string;
  jobUrl?: string;
  status: ApplicationStatus;
  contact?: Contact;
  // Enriched fields from backend for instant detail view
  contactId?: string;
  contactName?: string;
  contactEmail?: string;
  contactCategory?: ContactCategory;
  appliedDate: string;
  followUpDate?: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
}

