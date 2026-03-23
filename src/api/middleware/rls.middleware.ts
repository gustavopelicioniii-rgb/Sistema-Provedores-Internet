import { Request, Response, NextFunction } from 'express';

/**
 * RLS Middleware - Extracts company_id from JWT and makes it available
 * for all database queries to enforce multi-tenant isolation.
 */
export function rlsMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.companyId) {
    return res.status(401).json({
      success: false,
      error: 'Company context not found in token',
      code: 'MISSING_COMPANY_CONTEXT',
    });
  }

  // Attach companyId to request for easy access in controllers
  (req as any).companyId = req.user.companyId;
  next();
}

/**
 * Helper to get company_id from request (set by RLS middleware)
 */
export function getCompanyId(req: Request): string {
  return req.user?.companyId || '';
}
