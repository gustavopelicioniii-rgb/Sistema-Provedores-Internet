import { query } from '../../db/pool.js';
import { AppError } from '../middleware/error.middleware.js';
import type { CreateClientInput, UpdateClientInput } from '../validators/schemas.js';

export class ClientService {
  static async list(companyId: string, params: {
    page: number; limit: number; status?: string; city?: string; search?: string; plan_id?: string;
  }) {
    const { page, limit, status, city, search, plan_id } = params;
    const offset = (page - 1) * limit;
    const conditions: string[] = ['c.company_id = $1'];
    const values: any[] = [companyId];
    let idx = 2;

    if (status) { conditions.push(`c.status = $${idx}`); values.push(status); idx++; }
    if (city) { conditions.push(`c.city = $${idx}`); values.push(city); idx++; }
    if (plan_id) { conditions.push(`c.plan_id = $${idx}`); values.push(plan_id); idx++; }
    if (search) {
      conditions.push(`(c.name ILIKE $${idx} OR c.document ILIKE $${idx} OR c.phone ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const where = conditions.join(' AND ');

    const countResult = await query(`SELECT COUNT(*) FROM clients c WHERE ${where}`, values);
    const dataResult = await query(
      `SELECT c.*, p.name as plan_name, p.download_speed, p.upload_speed, p.monthly_price as plan_price
       FROM clients c
       LEFT JOIN plans p ON p.id = c.plan_id
       WHERE ${where}
       ORDER BY c.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset]
    );

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page, limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
    };
  }

  static async getById(companyId: string, clientId: string) {
    const result = await query(
      `SELECT c.*, p.name as plan_name, p.download_speed, p.upload_speed, p.monthly_price as plan_price
       FROM clients c
       LEFT JOIN plans p ON p.id = c.plan_id
       WHERE c.id = $1 AND c.company_id = $2`,
      [clientId, companyId]
    );

    if (result.rowCount === 0) {
      throw new AppError('Cliente não encontrado', 404, 'NOT_FOUND');
    }

    return result.rows[0];
  }

  static async create(companyId: string, data: CreateClientInput) {
    const result = await query(
      `INSERT INTO clients (company_id, name, document, email, phone, address, city, state, zip_code,
                            latitude, longitude, plan_id, status, payment_method, due_day, install_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        companyId, data.name, data.document || null, data.email || null, data.phone || null,
        data.address || null, data.city || null, data.state || null, data.zip_code || null,
        data.latitude || null, data.longitude || null, data.plan_id || null,
        data.status || 'ativo', data.payment_method || 'boleto', data.due_day || 10,
        data.install_date || null, data.notes || null,
      ]
    );

    return result.rows[0];
  }

  static async update(companyId: string, clientId: string, data: UpdateClientInput) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowedFields = [
      'name', 'document', 'email', 'phone', 'address', 'city', 'state', 'zip_code',
      'latitude', 'longitude', 'plan_id', 'status', 'payment_method', 'due_day',
      'install_date', 'notes', 'churn_score',
    ];

    for (const field of allowedFields) {
      if ((data as any)[field] !== undefined) {
        fields.push(`${field} = $${idx}`);
        values.push((data as any)[field]);
        idx++;
      }
    }

    if (fields.length === 0) {
      throw new AppError('Nenhum campo para atualizar', 400, 'NO_FIELDS');
    }

    fields.push(`updated_at = NOW()`);

    const result = await query(
      `UPDATE clients SET ${fields.join(', ')} WHERE id = $${idx} AND company_id = $${idx + 1} RETURNING *`,
      [...values, clientId, companyId]
    );

    if (result.rowCount === 0) {
      throw new AppError('Cliente não encontrado', 404, 'NOT_FOUND');
    }

    return result.rows[0];
  }

  static async calculateChurnScore(companyId: string, clientId: string) {
    const client = await ClientService.getById(companyId, clientId);

    // Factors for churn scoring
    let score = 0;

    // Status factor
    if (client.status === 'suspenso') score += 30;
    if (client.status === 'cancelado') score += 50;

    // Overdue invoices
    const overdue = await query(
      `SELECT COUNT(*) FROM invoices WHERE client_id = $1 AND status = 'atrasado'`,
      [clientId]
    );
    const overdueCount = parseInt(overdue.rows[0].count);
    score += Math.min(overdueCount * 10, 30);

    // Open tickets
    const tickets = await query(
      `SELECT COUNT(*) FROM tickets WHERE client_id = $1 AND status IN ('aberto', 'em_andamento')`,
      [clientId]
    );
    const ticketCount = parseInt(tickets.rows[0].count);
    score += Math.min(ticketCount * 5, 15);

    // Tenure (newer clients are higher risk)
    if (client.install_date) {
      const months = Math.floor(
        (Date.now() - new Date(client.install_date).getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      if (months < 3) score += 10;
      else if (months < 6) score += 5;
    }

    score = Math.min(score, 100);

    // Update churn score in DB
    await query(
      'UPDATE clients SET churn_score = $1, updated_at = NOW() WHERE id = $2',
      [score, clientId]
    );

    return { churn_score: score, factors: { overdue: overdueCount, tickets: ticketCount, status: client.status } };
  }

  static async getHistory(companyId: string, clientId: string) {
    // Get recent events: tickets, invoices, plan changes
    const tickets = await query(
      `SELECT 'ticket' as type, t.subject as description, t.status, t.created_at as date
       FROM tickets t
       WHERE t.client_id = $1 AND t.company_id = $2
       ORDER BY t.created_at DESC LIMIT 10`,
      [clientId, companyId]
    );

    const invoices = await query(
      `SELECT 'invoice' as type, CONCAT('Fatura R$ ', i.amount) as description, i.status, i.created_at as date
       FROM invoices i
       WHERE i.client_id = $1 AND i.company_id = $2
       ORDER BY i.created_at DESC LIMIT 10`,
      [clientId, companyId]
    );

    const migrations = await query(
      `SELECT 'migration' as type,
              CONCAT('Migração de ', fp.name, ' para ', tp.name) as description,
              'completed' as status, pm.migrated_at as date
       FROM plan_migrations pm
       LEFT JOIN plans fp ON fp.id = pm.from_plan_id
       LEFT JOIN plans tp ON tp.id = pm.to_plan_id
       WHERE pm.client_id = $1
       ORDER BY pm.migrated_at DESC LIMIT 10`,
      [clientId]
    );

    const events = [...tickets.rows, ...invoices.rows, ...migrations.rows]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);

    return events;
  }
}
