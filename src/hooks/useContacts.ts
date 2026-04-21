import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '../services/api';
import { Contact, PageResponse } from '../types';
import toast from 'react-hot-toast';

export const useContacts = (page = 0, size = 100) => {
  return useQuery<PageResponse<Contact>>({
    queryKey: ['contacts', page, size],
    queryFn: () => contactService.fetchContacts(page, size),
  });
};

export const useCreateContact = (page = 0, size = 100) => {
  const queryClient = useQueryClient();
  const queryKey = ['contacts', page, size];

  return useMutation<Contact, Error, any>({
    mutationFn: contactService.createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Contact created successfully!');
    },
  });
};
