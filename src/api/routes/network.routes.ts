import { Router, Request, Response } from 'express';
import { NetworkService } from '../services/network.service.js';
import { createOLTSchema, updateOLTSchema, createIncidentSchema, paginationSchema } from '../validators/schemas.js';
import { getCompanyId } from '../middleware/rls.middleware.js';

const router = Router();

// ==================== OLTs ====================

// GET /api/network/olts
router.get('/olts', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const pagination = paginationSchema.parse(req.query);
  const result = await NetworkService.listOLTs(companyId, {
    ...pagination,
    status: req.query.status as string,
  });
  res.json({ success: true, ...result });
});

// GET /api/network/olts/:id
router.get('/olts/:id', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const result = await NetworkService.getOLTById(companyId, req.params.id);
  res.json({ success: true, data: result });
});

// GET /api/network/olts/:id/health
router.get('/olts/:id/health', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const result = await NetworkService.getOLTHealth(companyId, req.params.id);
  res.json({ success: true, data: result });
});

// GET /api/network/olts/:id/clients
router.get('/olts/:id/clients', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const result = await NetworkService.getOLTClients(companyId, req.params.id);
  res.json({ success: true, data: result });
});

// GET /api/network/olts/:id/incidents
router.get('/olts/:id/incidents', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const result = await NetworkService.getOLTIncidents(companyId, req.params.id);
  res.json({ success: true, data: result });
});

// POST /api/network/olts
router.post('/olts', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const data = createOLTSchema.parse(req.body);
  const result = await NetworkService.createOLT(companyId, data);
  res.status(201).json({ success: true, data: result, message: 'OLT cadastrada' });
});

// PATCH /api/network/olts/:id
router.patch('/olts/:id', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const data = updateOLTSchema.parse(req.body);
  const result = await NetworkService.updateOLT(companyId, req.params.id, data);
  res.json({ success: true, data: result, message: 'OLT atualizada' });
});

// ==================== Signal & Risk ====================

// GET /api/network/signal-quality-by-olt
router.get('/signal-quality-by-olt', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const result = await NetworkService.getSignalQualityByOLT(companyId);
  res.json({ success: true, data: result });
});

// GET /api/network/clients-at-risk
router.get('/clients-at-risk', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const threshold = parseFloat(req.query.threshold as string) || -25;
  const result = await NetworkService.getClientsAtRisk(companyId, threshold);
  res.json({ success: true, data: result });
});

// GET /api/network/heatmap
router.get('/heatmap', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const result = await NetworkService.getHeatmap(companyId);
  res.json({ success: true, data: result });
});

// ==================== Incidents ====================

// GET /api/network/incidents
router.get('/incidents', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const pagination = paginationSchema.parse(req.query);
  const result = await NetworkService.listIncidents(companyId, {
    ...pagination,
    dateFrom: req.query.dateFrom as string,
    dateTo: req.query.dateTo as string,
  });
  res.json({ success: true, ...result });
});

// POST /api/network/olt-incident
router.post('/olt-incident', async (req: Request, res: Response) => {
  const companyId = getCompanyId(req);
  const data = createIncidentSchema.parse(req.body);
  const result = await NetworkService.createIncident(companyId, data);
  res.status(201).json({ success: true, data: result, message: 'Incidente registrado' });
});

export default router;
