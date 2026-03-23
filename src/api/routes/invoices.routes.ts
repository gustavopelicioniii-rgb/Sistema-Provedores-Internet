import { Router, Request, Response } from 'express';
import { query } from '../../db/pool.js';
import { createInvoiceSchema, updateInvoiceSchema, paginationSchema } from '../validators/schemas.js';
import { getCompanyId } from '../middleware/rls.middleware.js';
import { AppError } from '../middleware/error.middleware.js';

const router = Router();

// GET /api/invoices
router.get('/', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const { page, limit } = paginationSchema.parse(req.query);
  const offset = (page - 1) * limit;
  const conditions: string[] = ['i.company_id = $1'];
  const values: any[] = [companyId];
  let idx = 2;

  if (req.query.status) { conditions.push(`i.status = $${idx}`); values.push(req.query.status); idx++; }
  if (req.query.client_id) { conditions.push(`i.client_id = $${idx}`); values.push(req.query.client_id); idx++; }

  const where = conditions.join(' AND ');
  const countResult = await query(`SELECT COUNT(*) FROM invoices i WHERE ${where}`, values);
  const dataResult = await query(
    `SELECT i.*, c.name as client_name
     FROM invoices i
     LEFT JOIN clients c ON c.id = i.client_id
     WHERE ${where}
     ORDER BY i.due_date DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...values, limit, offset]
  );

  res.json({ success: true, data: dataResult.rows, total: parseInt(countResult.rows[0].count), page, limit });
});

// POST /api/invoices
router.post('/', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const data = createInvoiceSchema.parse(req.body);
  const invoiceNum = `INV-${Date.now().toString().slice(-5)}`;
  const result = await query(
    `INSERT INTO invoices (company_id, client_id, subscription_id, invoice_number, amount, due_date, status, payment_method, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [companyId, data.client_id, data.subscription_id || null, invoiceNum, data.amount,
     data.due_date, data.status || 'pendente', data.payment_method || null, data.notes || null]
  );
  res.status(201).json({ success: true, data: result.rows[0] });
});

// PATCH /api/invoices/:id
router.patch('/:id', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const data = updateInvoiceSchema.parse(req.body);
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) { fields.push(`${key} = $${idx}`); values.push(value); idx++; }
  }

  if (data.status === 'pago') {
    fields.push(`paid_date = CURRENT_DATE`);
  }
  fields.push(`updated_at = NOW()`);

  const result = await query(
    `UPDATE invoices SET ${fields.join(', ')} WHERE id = $${idx} AND company_id = $${idx + 1} RETURNING *`,
    [...values, req.params.id, companyId]
  );
  if (result.rowCount === 0) throw new AppError('Fatura não encontrada', 404, 'NOT_FOUND');
  res.json({ success: true, data: result.rows[0] });
});

export default router;
