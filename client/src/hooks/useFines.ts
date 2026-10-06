import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fineService, PayFineData } from '../services/fineService';

export function useMyFines(page = 1) {
  return useQuery({
    queryKey: ['fines', 'my', page],
    queryFn: () => fineService.getMyFines(page),
  });
}

export function useMyFineSummary() {
  return useQuery({
    queryKey: ['fines', 'summary', 'my'],
    queryFn: () => fineService.getMySummary(),
  });
}

export function useAllFines(status?: string, page = 1) {
  return useQuery({
    queryKey: ['fines', 'all', status, page],
    queryFn: () => fineService.getAllFines({ status, page }),
  });
}

export function usePayFine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PayFineData }) =>
      fineService.payFine(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fines'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
}

export function useWaiveFine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      fineService.waiveFine(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fines'] });
    },
  });
}
