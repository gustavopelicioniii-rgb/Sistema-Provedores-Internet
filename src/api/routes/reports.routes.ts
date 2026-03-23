import { Router, Request, Response } from 'express';
import { query } from '../../db/pool.js';
import { getCompanyId } from '../middleware/rls.middleware.js';

const router = Router();

// GET /api/reports/dashboard-kpis
router.get('/dashboard-kpis', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);

  const [clientsRes, mrrRes, ticketsRes, churnRes, automationsRes, overdueRes, uptimeRes] =
    await Promise.all([
      query(`SELECT COUNT(*) as total FROM clients WHERE company_id = $1 AND status = 'ativo'`, [
        companyId,
      ]),
      query(
        `SELECT COALESCE(SUM(i.amount), 0) as mrr FROM invoices i WHERE i.company_id = $1 AND i.status = 'pago' AND i.paid_date >= NOW() - INTERVAL '30 days'`,
        [companyId]
      ),
      query(
        `SELECT COUNT(*) as total FROM tickets WHERE company_id = $1 AND status IN ('aberto', 'em_andamento')`,
        [companyId]
      ),
      query(
        `SELECT COALESCE(AVG(churn_score), 0) as avg_churn FROM clients WHERE company_id = $1 AND status = 'ativo'`,
        [companyId]
      ),
      query(
        `SELECT COALESCE(SUM(executions_count), 0) as total FROM automations WHERE company_id = $1 AND is_active = true`,
        [companyId]
      ),
      query(
        `SELECT COUNT(*) as total FROM invoices WHERE company_id = $1 AND status = 'atrasado'`,
        [companyId]
      ),
      query(
        `SELECT COUNT(*) as online, (SELECT COUNT(*) FROM olts WHERE company_id = $1) as total FROM olts WHERE company_id = $1 AND status = 'online'`,
        [companyId]
      ),
    ]);

  const totalOLTs = parseInt(uptimeRes.rows[0].total) || 1;
  const onlineOLTs = parseInt(uptimeRes.rows[0].online) || 0;

  res.json({
    success: true,
    data: {
      active_clients: parseInt(clientsRes.rows[0].total),
      mrr: parseFloat(mrrRes.rows[0].mrr),
      open_tickets: parseInt(ticketsRes.rows[0].total),
      avg_churn_score: parseFloat(churnRes.rows[0].avg_churn).toFixed(1),
      automations_total: parseInt(automationsRes.rows[0].total),
      overdue_invoices: parseInt(overdueRes.rows[0].total),
      uptime_percent: ((onlineOLTs / totalOLTs) * 100).toFixed(1),
      olts_online: onlineOLTs,
      olts_total: totalOLTs,
    },
  });
});

// GET /api/reports/revenue-chart
router.get('/revenue-chart', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const result = await query(
    `SELECT
       TO_CHAR(i.due_date, 'Mon') as month,
       COALESCE(SUM(CASE WHEN i.status = 'pago' THEN i.amount ELSE 0 END), 0) as revenue,
       COALESCE(SUM(CASE WHEN i.status = 'atrasado' THEN i.amount ELSE 0 END), 0) as overdue
     FROM invoices i
     WHERE i.company_id = $1 AND i.due_date >= NOW() - INTERVAL '6 months'
     GROUP BY TO_CHAR(i.due_date, 'Mon'), EXTRACT(MONTH FROM i.due_date)
     ORDER BY EXTRACT(MONTH FROM i.due_date)`,
    [companyId]
  );
  res.json({ success: true, data: result.rows });
});

// GET /api/reports/clients-by-plan
router.get('/clients-by-plan', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const result = await query(
    `SELECT p.name, COUNT(c.id) as value, p.monthly_price
     FROM plans p
     LEFT JOIN clients c ON c.plan_id = p.id AND c.status = 'ativo'
     WHERE p.company_id = $1 AND p.status = 'ativo'
     GROUP BY p.id, p.name, p.monthly_price
     ORDER BY COUNT(c.id) DESC`,
    [companyId]
  );
  res.json({ success: true, data: result.rows });
});

export default router;
