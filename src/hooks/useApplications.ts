import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '../services/api';
import { Application, ApplicationStatus, PageResponse } from '../types';
import toast from 'react-hot-toast';

export const useApplications = (page = 0, size = 100) => {
  return useQuery({
    queryKey: ['applications', page, size],
    queryFn: () => applicationService.fetchApplications(page, size),
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

export const useAddNote = () => {
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => applicationService.addNote(id, content),
    onSuccess: () => {
      toast.success('Note added successfully!');
    },
  });
};

