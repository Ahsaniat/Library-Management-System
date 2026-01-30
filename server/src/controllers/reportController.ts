import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services';
import { ApiResponse } from '../types';

export class ReportController {
  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await reportService.getDashboardStats();
      const response: ApiResponse = {
        success: true,
        data: stats,
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCirculationStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const range = startDate && endDate
        ? { startDate: new Date(startDate as string), endDate: new Date(endDate as string) }
        : undefined;
      
      const stats = await reportService.getCirculationStats(range);
      const response: ApiResponse = {
        success: true,
        data: stats,
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getBookStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await reportService.getBookStats();
      const response: ApiResponse = {
        success: true,
        data: stats,
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getUserStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const range = startDate && endDate
        ? { startDate: new Date(startDate as string), endDate: new Date(endDate as string) }
        : undefined;
      
      const stats = await reportService.getUserStats(range);
      const response: ApiResponse = {
        success: true,
        data: stats,
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getFinancialStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      const range = startDate && endDate
        ? { startDate: new Date(startDate as string), endDate: new Date(endDate as string) }
        : undefined;
      
      const stats = await reportService.getFinancialStats(range);
      const response: ApiResponse = {
        success: true,
        data: stats,
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getOverdueReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await reportService.getOverdueReport();
      const response: ApiResponse = {
        success: true,
        data: report,
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getInventoryReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await reportService.getInventoryReport();
      const response: ApiResponse = {
        success: true,
        data: report,
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
