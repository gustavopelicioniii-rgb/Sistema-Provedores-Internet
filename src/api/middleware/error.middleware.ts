import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number = 400, code: string = 'BAD_REQUEST') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError';
  }
}

export function errorMiddleware(err: Error, req: Request, res: Response, _next: NextFunction) {
  const timestamp = new Date().toISOString();

  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    console.error(`[${timestamp}] Validation error:`, JSON.stringify(errors));
    return res.status(400).json({
      success: false,
      error: 'Erro de validação',
      code: 'VALIDATION_ERROR',
      details: errors,
    });
  }

  if (err instanceof AppError) {
    console.error(`[${timestamp}] App error: ${err.message}`);
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
  }

  // PostgreSQL unique violation
  if ((err as any).code === '23505') {
    console.error(`[${timestamp}] Unique violation:`, err.message);
    return res.status(409).json({
      success: false,
      error: 'Registro já existe',
      code: 'DUPLICATE_ENTRY',
    });
  }

  // PostgreSQL foreign key violation
  if ((err as any).code === '23503') {
    console.error(`[${timestamp}] FK violation:`, err.message);
    return res.status(400).json({
      success: false,
      error: 'Referência inválida',
      code: 'FK_VIOLATION',
    });
  }

  console.error(`[${timestamp}] Unhandled error:`, err);
  return res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    code: 'INTERNAL_ERROR',
  });
}
