import { useQuery } from '@tanstack/react-query';
import { bookService, BookSearchParams } from '../services/bookService';

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

export function useCategories() {
  return useQuery({
    queryKey: ['books', 'categories'],
    queryFn: () => bookService.getCategories(),
    staleTime: 30 * 60 * 1000,
  });
}
