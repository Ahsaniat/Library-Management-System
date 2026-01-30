import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookRequestService, CreateBookRequestData } from '../services/bookRequestService';

export function useMyBookRequests() {
  return useQuery({
    queryKey: ['bookRequests', 'my'],
    queryFn: () => bookRequestService.getMyRequests(),
  });
}

export function useAllBookRequests(status?: string) {
  return useQuery({
    queryKey: ['bookRequests', 'all', status],
    queryFn: () => bookRequestService.getAllRequests(status),
  });
}

export function useCreateBookRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookRequestData) => bookRequestService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookRequests'] });
    },
  });
}

export function useCancelBookRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookRequestService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookRequests'] });
    },
  });
}

export function useProcessBookRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) =>
      bookRequestService.process(id, status, adminNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookRequests'] });
    },
  });
}
