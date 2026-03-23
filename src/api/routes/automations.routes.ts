import { Router, Request, Response } from 'express';
import { query } from '../../db/pool.js';
import { createAutomationSchema, updateAutomationSchema, paginationSchema } from '../validators/schemas.js';
import { getCompanyId } from '../middleware/rls.middleware.js';
import { AppError } from '../middleware/error.middleware.js';

const router = Router();

// GET /api/automations
router.get('/', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const { page, limit } = paginationSchema.parse(req.query);
  const offset = (page - 1) * limit;

  const countResult = await query(`SELECT COUNT(*) FROM automations WHERE company_id = $1`, [companyId]);
  const dataResult = await query(
    `SELECT * FROM automations WHERE company_id = $1 ORDER BY is_active DESC, name ASC LIMIT $2 OFFSET $3`,
    [companyId, limit, offset]
  );

  res.json({ success: true, data: dataResult.rows, total: parseInt(countResult.rows[0].count), page, limit });
});

// POST /api/automations
router.post('/', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const data = createAutomationSchema.parse(req.body);
  const result = await query(
    `INSERT INTO automations (company_id, name, description, trigger_type, action_type, config, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [companyId, data.name, data.description || null, data.trigger_type, data.action_type,
     JSON.stringify(data.config || {}), data.is_active ?? true]
  );
  res.status(201).json({ success: true, data: result.rows[0] });
});

// PATCH /api/automations/:id
router.patch('/:id', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const data = updateAutomationSchema.parse(req.body);
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = $${idx}`);
      values.push(key === 'config' ? JSON.stringify(value) : value);
      idx++;
    }
  }
  fields.push(`updated_at = NOW()`);

  const result = await query(
    `UPDATE automations SET ${fields.join(', ')} WHERE id = $${idx} AND company_id = $${idx + 1} RETURNING *`,
    [...values, req.params.id, companyId]
  );
  if (result.rowCount === 0) throw new AppError('Automação não encontrada', 404, 'NOT_FOUND');
  res.json({ success: true, data: result.rows[0] });
});

export default router;
