import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loanService } from '../services/loanService';

export function useMyLoans(status?: string) {
  return useQuery({
    queryKey: ['loans', 'my', status],
    queryFn: () => loanService.getMyLoans(status),
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

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookCopyId, userId }: { bookCopyId: string; userId: string }) =>
      loanService.checkout(bookCopyId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useCheckin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookCopyId: string) => loanService.checkin(bookCopyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useOverdueLoans() {
  return useQuery({
    queryKey: ['loans', 'overdue'],
    queryFn: () => loanService.getOverdue(),
  });
}
