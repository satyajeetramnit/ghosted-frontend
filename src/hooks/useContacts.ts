import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '../services/api';
import toast from 'react-hot-toast';

export const useContacts = (page = 0, size = 100) => {
  return useQuery({
    queryKey: ['contacts', page, size],
    queryFn: () => contactService.fetchContacts(page, size),
  });
};

export const useCreateContact = (page = 0, size = 100) => {
  const queryClient = useQueryClient();
  const queryKey = ['contacts', page, size];

  return useMutation({
    mutationFn: contactService.createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Contact created successfully!');
    },
  });
};
