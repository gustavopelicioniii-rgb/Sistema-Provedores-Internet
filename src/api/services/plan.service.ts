import { query } from '../../db/pool.js';
import { AppError } from '../middleware/error.middleware.js';
import type { CreatePlanInput, UpdatePlanInput } from '../validators/schemas.js';

export class PlanService {
  static async list(companyId: string, params: { page: number; limit: number; status?: string; search?: string }) {
    const { page, limit, status, search } = params;
    const offset = (page - 1) * limit;
    const conditions: string[] = ['p.company_id = $1'];
    const values: any[] = [companyId];
    let paramIdx = 2;

    if (status) {
      conditions.push(`p.status = $${paramIdx}`);
      values.push(status);
      paramIdx++;
    }

    if (search) {
      conditions.push(`p.name ILIKE $${paramIdx}`);
      values.push(`%${search}%`);
      paramIdx++;
    }

    const where = conditions.join(' AND ');

    const countResult = await query(
      `SELECT COUNT(*) FROM plans p WHERE ${where}`,
      values
    );

    const dataResult = await query(
      `SELECT p.*,
              COALESCE((SELECT COUNT(*) FROM clients c WHERE c.plan_id = p.id AND c.status = 'ativo'), 0) as clients_count
       FROM plans p
       WHERE ${where}
       ORDER BY p.created_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...values, limit, offset]
    );

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
    };
  }

  static async getById(companyId: string, planId: string) {
    const result = await query(
      `SELECT p.*,
              COALESCE((SELECT COUNT(*) FROM clients c WHERE c.plan_id = p.id AND c.status = 'ativo'), 0) as clients_count,
              COALESCE((SELECT COUNT(*) FROM clients c WHERE c.plan_id = p.id AND c.status = 'cancelado'), 0) as churned_count
       FROM plans p
       WHERE p.id = $1 AND p.company_id = $2`,
      [planId, companyId]
    );

    if (result.rowCount === 0) {
      throw new AppError('Plano não encontrado', 404, 'NOT_FOUND');
    }

    return result.rows[0];
  }

  static async create(companyId: string, data: CreatePlanInput) {
    const result = await query(
      `INSERT INTO plans (company_id, name, download_speed, upload_speed, monthly_price, description, sla_uptime, data_cap, status, features)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        companyId,
        data.name,
        data.download_speed,
        data.upload_speed,
        data.monthly_price,
        data.description || null,
        data.sla_uptime || 99.5,
        data.data_cap || null,
        data.status || 'ativo',
        JSON.stringify(data.features || []),
      ]
    );

    return result.rows[0];
  }

  static async update(companyId: string, planId: string, data: UpdatePlanInput) {
    // Build dynamic SET clause
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowedFields = ['name', 'download_speed', 'upload_speed', 'monthly_price', 'description', 'sla_uptime', 'data_cap', 'status'];
    for (const field of allowedFields) {
      if ((data as any)[field] !== undefined) {
        fields.push(`${field} = $${idx}`);
        values.push(field === 'features' ? JSON.stringify((data as any)[field]) : (data as any)[field]);
        idx++;
      }
    }

    if (data.features !== undefined) {
      fields.push(`features = $${idx}`);
      values.push(JSON.stringify(data.features));
      idx++;
    }

    if (fields.length === 0) {
      throw new AppError('Nenhum campo para atualizar', 400, 'NO_FIELDS');
    }

    fields.push(`updated_at = NOW()`);

    const result = await query(
      `UPDATE plans SET ${fields.join(', ')} WHERE id = $${idx} AND company_id = $${idx + 1} RETURNING *`,
      [...values, planId, companyId]
    );

    if (result.rowCount === 0) {
      throw new AppError('Plano não encontrado', 404, 'NOT_FOUND');
    }

    return result.rows[0];
  }

  static async delete(companyId: string, planId: string) {
    // Check if plan has active clients
    const clients = await query(
      `SELECT COUNT(*) FROM clients WHERE plan_id = $1 AND status = 'ativo'`,
      [planId]
    );

    if (parseInt(clients.rows[0].count) > 0) {
      throw new AppError('Não é possível excluir plano com clientes ativos', 400, 'HAS_ACTIVE_CLIENTS');
    }

    const result = await query(
      'DELETE FROM plans WHERE id = $1 AND company_id = $2 RETURNING id',
      [planId, companyId]
    );

    if (result.rowCount === 0) {
      throw new AppError('Plano não encontrado', 404, 'NOT_FOUND');
    }

    return { deleted: true };
  }

  static async getKPIs(companyId: string, planId: string) {
    const plan = await PlanService.getById(companyId, planId);

    const totalClients = await query(
      `SELECT COUNT(*) FROM clients WHERE company_id = $1`,
      [companyId]
    );
    const total = parseInt(totalClients.rows[0].count) || 1;

    const revenueResult = await query(
      `SELECT COALESCE(SUM(i.amount), 0) as revenue
       FROM invoices i
       JOIN clients c ON c.id = i.client_id
       WHERE c.plan_id = $1 AND i.status = 'pago'
         AND i.paid_date >= NOW() - INTERVAL '30 days'`,
      [planId]
    );

    const migrations = await query(
      `SELECT
         COALESCE(SUM(CASE WHEN to_plan_id = $1 THEN 1 ELSE 0 END), 0) as upgrades,
         COALESCE(SUM(CASE WHEN from_plan_id = $1 THEN 1 ELSE 0 END), 0) as downgrades
       FROM plan_migrations
       WHERE (from_plan_id = $1 OR to_plan_id = $1)
         AND migrated_at >= NOW() - INTERVAL '30 days'`,
      [planId]
    );

    const clientsCount = parseInt(plan.clients_count) || 0;
    const churnedCount = parseInt(plan.churned_count) || 0;
    const adoptionRate = ((clientsCount / total) * 100).toFixed(1);
    const churnRate = clientsCount > 0 ? ((churnedCount / (clientsCount + churnedCount)) * 100).toFixed(1) : '0';

    // Calculate estimated margin (revenue - estimated costs)
    const revenue = parseFloat(revenueResult.rows[0].revenue) || clientsCount * parseFloat(plan.monthly_price);
    const estimatedCostPerClient = parseFloat(plan.monthly_price) * 0.35; // 35% cost estimate
    const estimatedMargin = ((1 - (estimatedCostPerClient / parseFloat(plan.monthly_price))) * 100).toFixed(1);

    // Default rate from overdue invoices
    const overdueResult = await query(
      `SELECT COUNT(*) as overdue_count
       FROM invoices i
       JOIN clients c ON c.id = i.client_id
       WHERE c.plan_id = $1 AND i.status = 'atrasado'`,
      [planId]
    );
    const defaultRate = clientsCount > 0
      ? ((parseInt(overdueResult.rows[0].overdue_count) / clientsCount) * 100).toFixed(1)
      : '0';

    return {
      adoption_rate: parseFloat(adoptionRate),
      churn_rate: parseFloat(churnRate),
      default_rate: parseFloat(defaultRate),
      estimated_margin: parseFloat(estimatedMargin),
      revenue: revenue,
      upgrades: parseInt(migrations.rows[0].upgrades),
      downgrades: parseInt(migrations.rows[0].downgrades),
      clients_count: clientsCount,
    };
  }

  static async getMigrationHistory(companyId: string, planId: string) {
    const result = await query(
      `SELECT pm.*, c.name as client_name,
              fp.name as from_plan_name, tp.name as to_plan_name
       FROM plan_migrations pm
       JOIN clients c ON c.id = pm.client_id
       LEFT JOIN plans fp ON fp.id = pm.from_plan_id
       LEFT JOIN plans tp ON tp.id = pm.to_plan_id
       WHERE pm.company_id = $1 AND (pm.from_plan_id = $2 OR pm.to_plan_id = $2)
       ORDER BY pm.migrated_at DESC
       LIMIT 50`,
      [companyId, planId]
    );

    return result.rows;
  }

  static async getComparison(companyId: string) {
    const result = await query(
      `SELECT p.*,
              COALESCE((SELECT COUNT(*) FROM clients c WHERE c.plan_id = p.id AND c.status = 'ativo'), 0) as clients_count,
              COALESCE((SELECT AVG(c.churn_score) FROM clients c WHERE c.plan_id = p.id), 0) as avg_churn_score
       FROM plans p
       WHERE p.company_id = $1 AND p.status = 'ativo'
       ORDER BY p.monthly_price ASC`,
      [companyId]
    );

    return result.rows;
  }
}
