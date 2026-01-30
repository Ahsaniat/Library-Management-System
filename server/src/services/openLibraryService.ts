import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';

interface OpenLibraryBook {
  title: string;
  subtitle?: string;
  authors?: Array<{ name: string }>;
  publishers?: Array<{ name: string }>;
  publish_date?: string;
  number_of_pages?: number;
  subjects?: string[];
  description?: string | { value: string };
  covers?: number[];
}

interface OpenLibrarySearchResult {
  numFound: number;
  docs: Array<{
    key: string;
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    isbn?: string[];
    cover_i?: number;
    publisher?: string[];
    number_of_pages_median?: number;
    subject?: string[];
    ratings_average?: number;
    ratings_count?: number;
  }>;
}

interface BookData {
  isbn: string;
  title: string;
  subtitle?: string;
  description?: string;
  publishedYear?: number;
  pageCount?: number;
  coverImage?: string;
  authorName?: string;
  publisherName?: string;
  categories?: string[];
  language?: string;
  averageRating?: number;
  ratingsCount?: number;
}

interface OpenLibraryRatings {
  summary?: {
    average?: number;
    count?: number;
  };
}

export class OpenLibraryService {
  private baseUrl = config.openLibraryApiUrl;

  private async fetchRatings(workKey: string): Promise<{ average?: number; count?: number }> {
    try {
      const response = await axios.get<OpenLibraryRatings>(
        `${this.baseUrl}${workKey}/ratings.json`,
        { timeout: 5000 }
      );
      return {
        average: response.data.summary?.average,
        count: response.data.summary?.count,
      };
    } catch {
      return {};
    }
  }

  async lookupByIsbn(isbn: string): Promise<BookData | null> {
    const cleanIsbn = isbn.replace(/[-\s]/g, '');
    
    try {
      const response = await axios.get(`${this.baseUrl}/isbn/${cleanIsbn}.json`, {
        timeout: 10000,
        headers: { 'Accept': 'application/json' },
      });

      if (response.status !== 200) {
        logger.info({ action: 'openlibrary_isbn_not_found', isbn: cleanIsbn });
        return null;
      }

      const data: OpenLibraryBook = response.data;
      const coverImage = data.covers?.[0] 
        ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
        : undefined;

      let authorName: string | undefined;
      if (data.authors && data.authors.length > 0) {
        const authorKey = (data.authors[0] as unknown as { key?: string })?.key;
        if (authorKey) {
          try {
            const authorResponse = await axios.get(`${this.baseUrl}${authorKey}.json`);
            authorName = authorResponse.data?.name;
          } catch {
            logger.warn('Failed to fetch author details');
          }
        }
      }

      let publishedYear: number | undefined;
      if (data.publish_date) {
        const yearMatch = data.publish_date.match(/\d{4}/);
        if (yearMatch) {
          publishedYear = parseInt(yearMatch[0], 10);
        }
      }

      let description: string | undefined;
      if (typeof data.description === 'string') {
        description = data.description;
      } else if (data.description?.value) {
        description = data.description.value;
      }

      // Fetch ratings if work key is available
      let averageRating: number | undefined;
      let ratingsCount: number | undefined;
      const workKey = (response.data as { works?: Array<{ key: string }> }).works?.[0]?.key;
      if (workKey) {
        const ratings = await this.fetchRatings(workKey);
        averageRating = ratings.average;
        ratingsCount = ratings.count;
      }

      const bookData: BookData = {
        isbn: cleanIsbn,
        title: data.title,
        subtitle: data.subtitle,
        description,
        publishedYear,
        pageCount: data.number_of_pages,
        coverImage,
        authorName,
        publisherName: data.publishers?.[0]?.name,
        categories: data.subjects?.slice(0, 5),
        averageRating,
        ratingsCount,
      };

      logger.info({ action: 'openlibrary_isbn_found', isbn: cleanIsbn, title: data.title });
      return bookData;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        logger.info({ action: 'openlibrary_isbn_not_found', isbn: cleanIsbn });
        return null;
      }
      logger.error({ action: 'openlibrary_lookup_error', isbn: cleanIsbn, error });
      throw error;
    }
  }

  async search(query: string, limit = 10): Promise<BookData[]> {
    try {
      const response = await axios.get<OpenLibrarySearchResult>(`${this.baseUrl}/search.json`, {
        params: { q: query, limit, fields: 'key,title,author_name,first_publish_year,isbn,cover_i,publisher,number_of_pages_median,subject,ratings_average,ratings_count' },
        timeout: 10000,
        headers: { 'Accept': 'application/json' },
      });

      return response.data.docs.map((doc) => ({
        isbn: doc.isbn?.[0] ?? '',
        title: doc.title,
        publishedYear: doc.first_publish_year,
        pageCount: doc.number_of_pages_median,
        coverImage: doc.cover_i 
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
          : undefined,
        authorName: doc.author_name?.[0],
        publisherName: doc.publisher?.[0],
        categories: doc.subject?.slice(0, 5),
        averageRating: doc.ratings_average,
        ratingsCount: doc.ratings_count,
      }));
    } catch (error) {
      logger.error({ action: 'openlibrary_search_error', query, error });
      throw error;
    }
  }

  getCoverUrl(coverId: number, size: 'S' | 'M' | 'L' = 'L'): string {
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
  }

  getCoverByIsbn(isbn: string, size: 'S' | 'M' | 'L' = 'L'): string {
    const cleanIsbn = isbn.replace(/[-\s]/g, '');
    return `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-${size}.jpg`;
  }
}

export const openLibraryService = new OpenLibraryService();
