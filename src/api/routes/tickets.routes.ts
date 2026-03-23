import { Router, Request, Response } from 'express';
import { query } from '../../db/pool.js';
import { createTicketSchema, updateTicketSchema, createTicketCommentSchema, paginationSchema } from '../validators/schemas.js';
import { getCompanyId } from '../middleware/rls.middleware.js';
import { AppError } from '../middleware/error.middleware.js';

const router = Router();

// GET /api/tickets
router.get('/', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const { page, limit } = paginationSchema.parse(req.query);
  const offset = (page - 1) * limit;
  const conditions: string[] = ['t.company_id = $1'];
  const values: any[] = [companyId];
  let idx = 2;

  if (req.query.status) { conditions.push(`t.status = $${idx}`); values.push(req.query.status); idx++; }
  if (req.query.priority) { conditions.push(`t.priority = $${idx}`); values.push(req.query.priority); idx++; }

  const where = conditions.join(' AND ');
  const countResult = await query(`SELECT COUNT(*) FROM tickets t WHERE ${where}`, values);
  const dataResult = await query(
    `SELECT t.*, c.name as client_name, u.name as assignee_name
     FROM tickets t
     LEFT JOIN clients c ON c.id = t.client_id
     LEFT JOIN users u ON u.id = t.assignee_id
     WHERE ${where}
     ORDER BY t.created_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...values, limit, offset]
  );

  res.json({ success: true, data: dataResult.rows, total: parseInt(countResult.rows[0].count), page, limit });
});

// GET /api/tickets/:id
router.get('/:id', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const result = await query(
    `SELECT t.*, c.name as client_name, u.name as assignee_name
     FROM tickets t
     LEFT JOIN clients c ON c.id = t.client_id
     LEFT JOIN users u ON u.id = t.assignee_id
     WHERE t.id = $1 AND t.company_id = $2`,
    [req.params.id, companyId]
  );
  if (result.rowCount === 0) throw new AppError('Ticket não encontrado', 404, 'NOT_FOUND');
  res.json({ success: true, data: result.rows[0] });
});

// POST /api/tickets
router.post('/', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const data = createTicketSchema.parse(req.body);
  const ticketNum = `TK-${Date.now().toString().slice(-4)}`;
  const result = await query(
    `INSERT INTO tickets (company_id, client_id, ticket_number, subject, description, priority, category, assignee_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [companyId, data.client_id || null, ticketNum, data.subject, data.description || null,
     data.priority || 'media', data.category || null, data.assignee_id || null]
  );
  res.status(201).json({ success: true, data: result.rows[0] });
});

// PATCH /api/tickets/:id
router.patch('/:id', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const data = updateTicketSchema.parse(req.body);
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) { fields.push(`${key} = $${idx}`); values.push(value); idx++; }
  }

  if (data.status === 'resolvido' || data.status === 'fechado') {
    fields.push(`resolved_at = NOW()`);
  }
  fields.push(`updated_at = NOW()`);

  const result = await query(
    `UPDATE tickets SET ${fields.join(', ')} WHERE id = $${idx} AND company_id = $${idx + 1} RETURNING *`,
    [...values, req.params.id, companyId]
  );
  if (result.rowCount === 0) throw new AppError('Ticket não encontrado', 404, 'NOT_FOUND');
  res.json({ success: true, data: result.rows[0] });
});

// GET /api/tickets/:id/comments
router.get('/:id/comments', async (req: Request, res: Response) => {
  const result = await query(
    `SELECT tc.*, u.name as user_name FROM ticket_comments tc
     LEFT JOIN users u ON u.id = tc.user_id
     WHERE tc.ticket_id = $1 ORDER BY tc.created_at ASC`,
    [req.params.id]
  );
  res.json({ success: true, data: result.rows });
});

// POST /api/tickets/:id/comments
router.post('/:id/comments', async (req: Request, res: Response) => {
  const data = createTicketCommentSchema.parse(req.body);
  const result = await query(
    `INSERT INTO ticket_comments (ticket_id, user_id, content, is_internal)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [req.params.id, req.user?.userId || null, data.content, data.is_internal || false]
  );
  res.status(201).json({ success: true, data: result.rows[0] });
});

export default router;
