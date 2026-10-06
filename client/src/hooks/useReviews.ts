import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewService, CreateReviewData } from '../services/reviewService';

export function useBookReviews(bookId: string, page = 1) {
  return useQuery({
    queryKey: ['reviews', bookId, page],
    queryFn: () => reviewService.list(bookId, page),
    enabled: !!bookId,
  });
}

export function useCreateReview(bookId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewData) => reviewService.create(bookId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', bookId] });
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useDeleteReview(bookId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewService.remove(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', bookId] });
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
    },
  });
}
