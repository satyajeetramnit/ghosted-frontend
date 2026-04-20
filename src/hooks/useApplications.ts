import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '../services/api';
import { Application, ApplicationStatus, PageResponse } from '../types';
import toast from 'react-hot-toast';

const MOCK_USER_ID = '123e4567-e89b-12d3-a456-426614174000';

export const useApplications = (page = 0, size = 100, userId = MOCK_USER_ID) => {
  return useQuery({
    queryKey: ['applications', userId, page, size],
    queryFn: () => applicationService.fetchApplications(page, size, userId),
  });
};

export const useUpdateApplicationStatus = (page = 0, size = 100, userId = MOCK_USER_ID) => {
  const queryClient = useQueryClient();
  const queryKey = ['applications', userId, page, size];

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) => 
      applicationService.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<PageResponse<Application>>(queryKey);

      // Optimistically update to the new value
      if (previousData) {
        queryClient.setQueryData<PageResponse<Application>>(queryKey, {
          ...previousData,
          content: previousData.content.map(app => 
            app.id === id ? { ...app, status } : app
          ),
        });
      }

      // Return a context object with the snapshotted value
      return { previousData };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error('Failed to update status. Reverting changes.');
    },
    // Always refetch after error or success to ensure sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useCreateApplication = (page = 0, size = 100, userId = MOCK_USER_ID) => {
  const queryClient = useQueryClient();
  const queryKey = ['applications', userId, page, size];

  return useMutation({
    mutationFn: applicationService.createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Application added successfully!');
    },
  });
};

export const useAddNote = () => {
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => applicationService.addNote(id, content),
    onSuccess: () => {
      toast.success('Note added successfully!');
    },
  });
};
