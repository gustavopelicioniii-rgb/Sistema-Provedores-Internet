import { Router, Request, Response } from 'express';
import { ClientService } from '../services/client.service.js';
import { createClientSchema, updateClientSchema, paginationSchema } from '../validators/schemas.js';
import { getCompanyId } from '../middleware/rls.middleware.js';

const router = Router();

// GET /api/clients
router.get('/', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const pagination = paginationSchema.parse(req.query);
  const result = await ClientService.list(companyId, {
    ...pagination,
    status: req.query.status as string,
    city: req.query.city as string,
    search: req.query.search as string,
    plan_id: req.query.plan_id as string,
  });
  res.json({ success: true, ...result });
});

// GET /api/clients/:id
router.get('/:id', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const result = await ClientService.getById(companyId, req.params.id);
  res.json({ success: true, data: result });
});

// GET /api/clients/:id/history
router.get('/:id/history', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const result = await ClientService.getHistory(companyId, req.params.id);
  res.json({ success: true, data: result });
});

// POST /api/clients
router.post('/', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const data = createClientSchema.parse(req.body);
  const result = await ClientService.create(companyId, data);
  res.status(201).json({ success: true, data: result, message: 'Cliente cadastrado' });
});

// PATCH /api/clients/:id
router.patch('/:id', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const data = updateClientSchema.parse(req.body);
  const result = await ClientService.update(companyId, req.params.id, data);
  res.json({ success: true, data: result, message: 'Cliente atualizado' });
});

// POST /api/clients/:id/churn-score
router.post('/:id/churn-score', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const result = await ClientService.calculateChurnScore(companyId, req.params.id);
  res.json({ success: true, data: result });
});

// POST /api/clients/:id/mass-communication
router.post('/:id/mass-communication', async (req: Request, res: Response) => {
  // Placeholder for mass communication feature
  res.json({
    success: true,
    data: { queued: true, message: 'Mensagem enfileirada para envio' },
  });
});

export default router;
