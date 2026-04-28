import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '../services/api';
import { Application, ApplicationStatus, Note, PageResponse } from '../types';
import toast from 'react-hot-toast';

export const useApplications = (page = 0, size = 100) => {
  return useQuery({
    queryKey: ['applications', page, size],
    queryFn: () => applicationService.fetchApplications(page, size),
  });
};

export const useApplicationById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['application', id],
    queryFn: () => applicationService.getById(id!),
    enabled: !!id,
  });
};

export const useUpdateApplicationStatus = (page = 0, size = 100) => {
  const queryClient = useQueryClient();
  const queryKey = ['applications', page, size];

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) => 
      applicationService.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<PageResponse<Application>>(queryKey);

      if (previousData) {
        queryClient.setQueryData<PageResponse<Application>>(queryKey, {
          ...previousData,
          content: previousData.content.map(app => 
            app.id === id ? { ...app, status } : app
          ),
        });
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error('Failed to update status. Reverting changes.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useCreateApplication = (page = 0, size = 100) => {
  const queryClient = useQueryClient();
  const queryKey = ['applications', page, size];

  return useMutation({
    mutationFn: applicationService.createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Application added successfully!');
    },
  });
};

// ─── Notes ────────────────────────────────────────────────────────────────────

export const useNotes = (applicationId: string | undefined) => {
  return useQuery<Note[]>({
    queryKey: ['notes', applicationId],
    queryFn: () => applicationService.fetchNotes(applicationId!),
    enabled: !!applicationId,
  });
};

export const useAddNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => applicationService.addNote(id, content),
    onSuccess: (_, variables) => {
      // Invalidate the notes list so it re-fetches and shows the new note
      queryClient.invalidateQueries({ queryKey: ['notes', variables.id] });
      toast.success('Note saved!');
    },
  });
};

// ─── Interviews ───────────────────────────────────────────────────────────────

export const useAddInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, data }: { applicationId: string; data: any }) => 
      applicationService.addInterview(applicationId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', variables.applicationId] });
      queryClient.invalidateQueries({ queryKey: ['all-interviews'] });
      toast.success('Interview round added!');
    },
  });
};

export const useUpdateInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, interviewId, data }: { applicationId: string; interviewId: string; data: any }) => 
      applicationService.updateInterview(applicationId, interviewId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', variables.applicationId] });
      toast.success('Interview updated!');
    },
  });
};

export const useDeleteInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, interviewId }: { applicationId: string; interviewId: string }) =>
      applicationService.deleteInterview(applicationId, interviewId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', variables.applicationId] });
      queryClient.invalidateQueries({ queryKey: ['all-interviews'] });
      toast.success('Interview round removed.');
    },
  });
};

// ─── OA ───────────────────────────────────────────────────────────────────────

export const useUpdateOA = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, data }: { applicationId: string; data: any }) => 
      applicationService.updateOA(applicationId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', variables.applicationId] });
      toast.success('Assessment updated!');
    },
  });
};

// ─── Interview Hub ────────────────────────────────────────────────────────────

export const useAllInterviews = () => {
  return useQuery({
    queryKey: ['all-interviews'],
    queryFn: () => applicationService.fetchAllInterviews(),
  });
};

// ─── Delete Application ────────────────────────────────────────────────────────────

export const useDeleteApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => applicationService.deleteApplication(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.removeQueries({ queryKey: ['application', id] });
      toast.success('Application deleted.');
    },
  });
};

// ─── Applied Date ─────────────────────────────────────────────────────────────

export const useUpdateAppliedDate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, appliedDate }: { id: string; appliedDate: string }) =>
      applicationService.updateAppliedDate(id, appliedDate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', variables.id] });
      toast.success('Applied date updated!');
    },
  });
};

// ─── Contacts ─────────────────────────────────────────────────────────────────

export const useUpdateContacts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, contactIds }: { id: string; contactIds: string[] }) =>
      applicationService.updateContacts(id, contactIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', variables.id] });
      toast.success('Contacts updated!');
    },
  });
};
