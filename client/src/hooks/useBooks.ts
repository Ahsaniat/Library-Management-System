import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookService, BookSearchParams } from '../services/bookService';
import { Book } from '../types';

export function useBooks(params: BookSearchParams = {}) {
  return useQuery({
    queryKey: ['books', params],
    queryFn: () => bookService.search(params),
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: ['book', id],
    queryFn: () => bookService.getById(id),
    enabled: !!id,
  });
}

export function usePopularBooks(limit = 10) {
  return useQuery({
    queryKey: ['books', 'popular', limit],
    queryFn: () => bookService.getPopular(limit),
  });
}

export function useRecentBooks(limit = 10) {
  return useQuery({
    queryKey: ['books', 'recent', limit],
    queryFn: () => bookService.getRecent(limit),
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Book>) => bookService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Book> }) =>
      bookService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['book', id] });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}
