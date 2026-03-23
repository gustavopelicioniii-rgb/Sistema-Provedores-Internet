import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { loginSchema, registerSchema } from '../validators/schemas.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);
  const result = await AuthService.login(data.email, data.password);
  res.json({ success: true, data: result });
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const result = await AuthService.register(data);
  res.status(201).json({ success: true, data: result, message: 'Conta criada com sucesso' });
});

// POST /api/auth/refresh
router.post('/refresh', authMiddleware, async (req: Request, res: Response) => {
  const token = await AuthService.refreshToken(req.user!);
  res.json({ success: true, data: { token } });
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  res.json({ success: true, data: req.user });
});

export default router;
