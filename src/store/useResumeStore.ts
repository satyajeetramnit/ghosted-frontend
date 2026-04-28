import { create } from 'zustand';
import { SavedResume, ResumeData } from '@/types/resume';

interface ResumeStoreState {
  savedResumes: SavedResume[];
  activeResumeId: string | null;
  addResume: (resume: Omit<SavedResume, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateResume: (id: string, updates: Partial<Pick<SavedResume, 'resumeData' | 'latexCode' | 'companyName' | 'jobTitle'>>) => void;
  deleteResume: (id: string) => void;
  setActiveResume: (id: string | null) => void;
  getResumeByApplication: (applicationId: string) => SavedResume | undefined;
}

export const useResumeStore = create<ResumeStoreState>((set, get) => ({
  savedResumes: [],
  activeResumeId: null,

  addResume: (resume) => {
    const id = `resume_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const newResume: SavedResume = {
      ...resume,
      id,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ savedResumes: [newResume, ...state.savedResumes] }));
    return id;
  },

  updateResume: (id, updates) => {
    set((state) => ({
      savedResumes: state.savedResumes.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      ),
    }));
  },

  deleteResume: (id) => {
    set((state) => ({
      savedResumes: state.savedResumes.filter((r) => r.id !== id),
      activeResumeId: state.activeResumeId === id ? null : state.activeResumeId,
    }));
  },

  setActiveResume: (id) => {
    set({ activeResumeId: id });
  },

  getResumeByApplication: (applicationId) => {
    return get().savedResumes.find((r) => r.applicationId === applicationId);
  },
}));
