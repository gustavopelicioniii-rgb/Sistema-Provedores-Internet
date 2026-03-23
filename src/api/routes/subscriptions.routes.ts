import { Router, Request, Response } from 'express';
import { query } from '../../db/pool.js';
import { createSubscriptionSchema, paginationSchema } from '../validators/schemas.js';
import { getCompanyId } from '../middleware/rls.middleware.js';
import { AppError } from '../middleware/error.middleware.js';

const router = Router();

// GET /api/subscriptions
router.get('/', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const { page, limit } = paginationSchema.parse(req.query);
  const offset = (page - 1) * limit;

  const countResult = await query(`SELECT COUNT(*) FROM subscriptions WHERE company_id = $1`, [
    companyId,
  ]);
  const dataResult = await query(
    `SELECT s.*, c.name as client_name, p.name as plan_name
     FROM subscriptions s
     JOIN clients c ON c.id = s.client_id
     JOIN plans p ON p.id = s.plan_id
     WHERE s.company_id = $1
     ORDER BY s.created_at DESC LIMIT $2 OFFSET $3`,
    [companyId, limit, offset]
  );

  res.json({
    success: true,
    data: dataResult.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    limit,
  });
});

// POST /api/subscriptions
router.post('/', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const data = createSubscriptionSchema.parse(req.body);
  const result = await query(
    `INSERT INTO subscriptions (company_id, client_id, plan_id, monthly_price, discount, start_date)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      companyId,
      data.client_id,
      data.plan_id,
      data.monthly_price,
      data.discount || 0,
      data.start_date || 'now()',
    ]
  );
  res.status(201).json({ success: true, data: result.rows[0] });
});

// PATCH /api/subscriptions/:id
router.patch('/:id', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const { status } = req.body;
  if (!status) throw new AppError('Status obrigatório', 400, 'VALIDATION_ERROR');

  const result = await query(
    `UPDATE subscriptions SET status = $1, updated_at = NOW() WHERE id = $2 AND company_id = $3 RETURNING *`,
    [status, req.params.id, companyId]
  );
  if (result.rowCount === 0) throw new AppError('Assinatura não encontrada', 404, 'NOT_FOUND');
  res.json({ success: true, data: result.rows[0] });
});

export default router;
