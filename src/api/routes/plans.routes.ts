import { Router, Request, Response } from 'express';
import { PlanService } from '../services/plan.service.js';
import { createPlanSchema, updatePlanSchema, paginationSchema } from '../validators/schemas.js';
import { getCompanyId } from '../middleware/rls.middleware.js';

const router = Router();

// GET /api/plans
router.get('/', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const pagination = paginationSchema.parse(req.query);
  const result = await PlanService.list(companyId, {
    ...pagination,
    status: req.query.status as string,
    search: req.query.search as string,
  });
  res.json({ success: true, ...result });
});

// GET /api/plans/comparison
router.get('/comparison', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const result = await PlanService.getComparison(companyId);
  res.json({ success: true, data: result });
});

// GET /api/plans/:id
router.get('/:id', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const result = await PlanService.getById(companyId, req.params.id);
  res.json({ success: true, data: result });
});

// GET /api/plans/:id/kpis
router.get('/:id/kpis', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const result = await PlanService.getKPIs(companyId, req.params.id);
  res.json({ success: true, data: result });
});

// GET /api/plans/:id/migration-history
router.get('/:id/migration-history', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const result = await PlanService.getMigrationHistory(companyId, req.params.id);
  res.json({ success: true, data: result });
});

// POST /api/plans
router.post('/', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const data = createPlanSchema.parse(req.body);
  const result = await PlanService.create(companyId, data);
  res.status(201).json({ success: true, data: result, message: 'Plano criado com sucesso' });
});

// PATCH /api/plans/:id
router.patch('/:id', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const data = updatePlanSchema.parse(req.body);
  const result = await PlanService.update(companyId, req.params.id, data);
  res.json({ success: true, data: result, message: 'Plano atualizado' });
});

// DELETE /api/plans/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const result = await PlanService.delete(companyId, req.params.id);
  res.json({ success: true, data: result, message: 'Plano excluído' });
});

export default router;
