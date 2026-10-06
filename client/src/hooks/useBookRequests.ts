import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookRequestService, CreateBookRequestData } from '../services/bookRequestService';

export function useMyBookRequests(page = 1) {
  return useQuery({
    queryKey: ['bookRequests', 'my', page],
    queryFn: () => bookRequestService.getMyRequests(page),
  });
}

export function useAllBookRequests(status?: string, page = 1) {
  return useQuery({
    queryKey: ['bookRequests', 'all', status, page],
    queryFn: () => bookRequestService.getAllRequests(status, page),
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
