import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService, savedResumeService, BackendProfile, BackendSavedResume } from '../services/api';
import toast from 'react-hot-toast';

// ─── Profile ──────────────────────────────────────────────────────────────────

export const useProfile = () => {
  return useQuery<BackendProfile>({
    queryKey: ['profile'],
    queryFn: () => profileService.getProfile(),
  });
};

export const useSaveProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BackendProfile) => profileService.saveProfile(data),
    onSuccess: (saved) => {
      queryClient.setQueryData(['profile'], saved);
      toast.success('Profile saved!');
    },
  });
};

// ─── Saved Resumes ────────────────────────────────────────────────────────────

export const useSavedResumes = () => {
  return useQuery<BackendSavedResume[]>({
    queryKey: ['saved-resumes'],
    queryFn: () => savedResumeService.list(),
  });
};

export const useCreateSavedResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<BackendSavedResume, 'id' | 'createdAt' | 'updatedAt'>) =>
      savedResumeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-resumes'] });
      toast.success('Resume saved!');
    },
  });
};

export const useUpdateSavedResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<BackendSavedResume, 'id' | 'createdAt' | 'updatedAt'>> }) =>
      savedResumeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-resumes'] });
      toast.success('Resume updated!');
    },
  });
};

export const useDeleteSavedResume = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => savedResumeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-resumes'] });
      toast.success('Resume deleted.');
    },
  });
};
