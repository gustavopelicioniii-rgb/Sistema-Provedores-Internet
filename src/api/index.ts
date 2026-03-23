import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';

import { authMiddleware } from './middleware/auth.middleware.js';
import { rlsMiddleware } from './middleware/rls.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { setupWebSocket } from './websocket.js';

import authRoutes from './routes/auth.routes.js';
import plansRoutes from './routes/plans.routes.js';
import clientsRoutes from './routes/clients.routes.js';
import networkRoutes from './routes/network.routes.js';
import ticketsRoutes from './routes/tickets.routes.js';
import invoicesRoutes from './routes/invoices.routes.js';
import automationsRoutes from './routes/automations.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import subscriptionsRoutes from './routes/subscriptions.routes.js';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8080';

// ==================== Middleware ====================
app.use(cors({
  origin: [CORS_ORIGIN, 'http://localhost:3000', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging (optional - commented out for production)
app.use((req, _res, next) => {
  next();
});

// ==================== Routes ====================

// Public routes (no auth required)
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Protected routes (auth + RLS required)
app.use('/api/plans', authMiddleware, rlsMiddleware, plansRoutes);
app.use('/api/clients', authMiddleware, rlsMiddleware, clientsRoutes);
app.use('/api/network', authMiddleware, rlsMiddleware, networkRoutes);
app.use('/api/tickets', authMiddleware, rlsMiddleware, ticketsRoutes);
app.use('/api/invoices', authMiddleware, rlsMiddleware, invoicesRoutes);
app.use('/api/automations', authMiddleware, rlsMiddleware, automationsRoutes);
app.use('/api/reports', authMiddleware, rlsMiddleware, reportsRoutes);
app.use('/api/subscriptions', authMiddleware, rlsMiddleware, subscriptionsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Rota não encontrada', code: 'NOT_FOUND' });
});

// Global error handler (must be last)
app.use(errorMiddleware);

// ==================== Server ====================
const server = createServer(app);

// Setup WebSocket
setupWebSocket(server);

server.listen(PORT, () => {
  console.log(`
========================================
  NetAdmin API Server
  Port: ${PORT}
  CORS: ${CORS_ORIGIN}
  Env:  ${process.env.NODE_ENV || 'development'}
  WS:   ws://localhost:${PORT}/ws
========================================
  `);
});

export default app;
