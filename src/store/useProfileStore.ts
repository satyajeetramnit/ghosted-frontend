import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GlobalProfile } from '@/types/resume';

export const EMPTY_PROFILE: GlobalProfile = {
  name: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  github: '',
  portfolio: '',
  leetcode: '',
  hackerrank: '',
  currentTitle: '',
  yearsExp: '',
  existingSummary: '',
};

interface ProfileStoreState {
  profile: GlobalProfile;
  setProfile: (profile: GlobalProfile) => void;
  updateProfile: (updates: Partial<GlobalProfile>) => void;
}

export const useProfileStore = create<ProfileStoreState>()(
  persist(
    (set) => ({
      profile: EMPTY_PROFILE,
      setProfile: (profile) => set({ profile }),
      updateProfile: (updates) =>
        set((state) => ({ profile: { ...state.profile, ...updates } })),
    }),
    { name: 'ghosted-profile' }
  )
);
