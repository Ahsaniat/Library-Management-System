import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loanService } from '../services/loanService';

export function useMyLoans(status?: string, page = 1) {
  return useQuery({
    queryKey: ['loans', 'my', status, page],
    queryFn: () => loanService.getMyLoans(status, page),
  });
}

export function useRenewLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (loanId: string) => loanService.renew(loanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
}

export function useSelfCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => loanService.selfCheckout(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}

export function useOverdueLoans(page = 1) {
  return useQuery({
    queryKey: ['loans', 'overdue', page],
    queryFn: () => loanService.getOverdue(page),
  });
}
