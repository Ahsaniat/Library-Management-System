import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '../services/wishlistService';

export function useMyWishlist() {
  return useQuery({
    queryKey: ['wishlist', 'my'],
    queryFn: () => wishlistService.getMyWishlist(),
  });
}

export function useIsInWishlist(bookId: string) {
  return useQuery({
    queryKey: ['wishlist', 'check', bookId],
    queryFn: () => wishlistService.isInWishlist(bookId),
    enabled: !!bookId,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, notes, priority }: { bookId: string; notes?: string; priority?: number }) =>
      wishlistService.add(bookId, notes, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => wishlistService.remove(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

export function useUpdateWishlistPriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, priority }: { bookId: string; priority: number }) =>
      wishlistService.updatePriority(bookId, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

export function useUpdateWishlistNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, notes }: { bookId: string; notes: string }) =>
      wishlistService.updateNotes(bookId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}
