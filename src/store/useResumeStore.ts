import { create } from 'zustand';
import { SavedResume } from '@/types/resume';

/**
 * In-memory cache for saved resumes.
 * NOTE: This store is intentionally NOT persisted to localStorage.
 * The source of truth is the backend. The resume builder page
 * calls useSavedResumes() on mount to hydrate this store from the DB.
 */
interface ResumeStoreState {
  savedResumes: SavedResume[];
  activeResumeId: string | null;

  // Hydrate from the server (called once on page load)
  setResumes: (resumes: SavedResume[]) => void;

  // Local state helpers (optimistic)
  upsertResume: (resume: SavedResume) => void;
  removeResume: (id: string) => void;

  setActiveResume: (id: string | null) => void;
  getResumeByApplication: (applicationId: string) => SavedResume | undefined;
}

export const useResumeStore = create<ResumeStoreState>((set, get) => ({
  savedResumes: [],
  activeResumeId: null,

  setResumes: (resumes) => set({ savedResumes: resumes }),

  upsertResume: (resume) =>
    set((state) => {
      const exists = state.savedResumes.some((r) => r.id === resume.id);
      if (exists) {
        return {
          savedResumes: state.savedResumes.map((r) => (r.id === resume.id ? resume : r)),
        };
      }
      return { savedResumes: [resume, ...state.savedResumes] };
    }),

  removeResume: (id) =>
    set((state) => ({
      savedResumes: state.savedResumes.filter((r) => r.id !== id),
      activeResumeId: state.activeResumeId === id ? null : state.activeResumeId,
    })),

  setActiveResume: (id) => set({ activeResumeId: id }),

  getResumeByApplication: (applicationId) =>
    get().savedResumes.find((r) => r.applicationId === applicationId),
}));
