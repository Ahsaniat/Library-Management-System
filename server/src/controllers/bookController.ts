import { Request, Response, NextFunction } from 'express';
import { bookService } from '../services';
import { ApiResponse } from '../types';

export class BookController {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = {
        q: req.query.q as string | undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: req.query.sortBy as string | undefined,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
        category: req.query.category as string | undefined,
        author: req.query.author as string | undefined,
        publisher: req.query.publisher as string | undefined,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        available: req.query.available === 'true',
        language: req.query.language as string | undefined,
      };

      const result = await bookService.search(params);
      const response: ApiResponse = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const book = await bookService.findById(req.params.id as string);
      const response: ApiResponse = {
        success: true,
        data: { book },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const book = await bookService.create(req.body);
      const response: ApiResponse = {
        success: true,
        message: 'Book created successfully',
        data: { book },
        requestId: req.requestId,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const book = await bookService.update(req.params.id as string, req.body);
      const response: ApiResponse = {
        success: true,
        message: 'Book updated successfully',
        data: { book },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await bookService.delete(req.params.id as string);
      const response: ApiResponse = {
        success: true,
        message: 'Book deleted successfully',
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getPopular(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const books = await bookService.getPopular(limit);
      const response: ApiResponse = {
        success: true,
        data: { books },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getRecent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const books = await bookService.getRecentlyAdded(limit);
      const response: ApiResponse = {
        success: true,
        data: { books },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async lookupIsbn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isbn = req.params.isbn as string;
      const existingBook = await bookService.findByIsbn(isbn);
      if (existingBook) {
        const response: ApiResponse = {
          success: true,
          data: { book: existingBook, source: 'database' },
          requestId: req.requestId,
        };
        res.json(response);
        return;
      }

      const { openLibraryService } = await import('../services');
      const openLibraryData = await openLibraryService.lookupByIsbn(isbn);
      
      if (openLibraryData) {
        const response: ApiResponse = {
          success: true,
          data: { book: openLibraryData, source: 'openlibrary' },
          requestId: req.requestId,
        };
        res.json(response);
        return;
      }

      const response: ApiResponse = {
        success: false,
        message: 'Book not found in database or Open Library.',
        requestId: req.requestId,
      };
      res.status(404).json(response);
    } catch (error) {
      next(error);
    }
  }

  async searchOpenLibrary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!query) {
        const response: ApiResponse = {
          success: false,
          message: 'Search query is required',
          requestId: req.requestId,
        };
        res.status(400).json(response);
        return;
      }

      const { openLibraryService } = await import('../services');
      const results = await openLibraryService.search(query, limit);
      
      const response: ApiResponse = {
        success: true,
        data: { books: results },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const bookController = new BookController();
