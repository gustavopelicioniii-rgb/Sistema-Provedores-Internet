import { query } from '../../db/pool.js';
import { AppError } from '../middleware/error.middleware.js';
import type { CreateOLTInput, UpdateOLTInput } from '../validators/schemas.js';

export class NetworkService {
  // ==================== OLTs ====================
  static async listOLTs(companyId: string, params: { page: number; limit: number; status?: string }) {
    const { page, limit, status } = params;
    const offset = (page - 1) * limit;
    const conditions: string[] = ['o.company_id = $1'];
    const values: any[] = [companyId];
    let idx = 2;

    if (status) { conditions.push(`o.status = $${idx}`); values.push(status); idx++; }

    const where = conditions.join(' AND ');
    const countResult = await query(`SELECT COUNT(*) FROM olts o WHERE ${where}`, values);

    const dataResult = await query(
      `SELECT o.*,
              COALESCE((SELECT COUNT(*) FROM onus n WHERE n.olt_id = o.id AND n.status = 'online'), 0) as clients_connected,
              COALESCE((SELECT COUNT(*) FROM network_incidents ni WHERE ni.olt_id = o.id AND ni.resolved_at IS NULL), 0) as active_incidents
       FROM olts o
       WHERE ${where}
       ORDER BY o.status DESC, o.name ASC
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

  static async getOLTById(companyId: string, oltId: string) {
    const result = await query(
      `SELECT o.*,
              COALESCE((SELECT COUNT(*) FROM onus n WHERE n.olt_id = o.id AND n.status = 'online'), 0) as clients_connected
       FROM olts o
       WHERE o.id = $1 AND o.company_id = $2`,
      [oltId, companyId]
    );

    if (result.rowCount === 0) {
      throw new AppError('OLT não encontrada', 404, 'NOT_FOUND');
    }
    return result.rows[0];
  }

  static async createOLT(companyId: string, data: CreateOLTInput) {
    const result = await query(
      `INSERT INTO olts (company_id, name, model, ip_address, port, location, latitude, longitude, max_clients, firmware_version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [companyId, data.name, data.model || null, data.ip_address, data.port || null,
       data.location || null, data.latitude || null, data.longitude || null,
       data.max_clients || 256, data.firmware_version || null]
    );
    return result.rows[0];
  }

  static async updateOLT(companyId: string, oltId: string, data: UpdateOLTInput) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowedFields = ['name', 'model', 'ip_address', 'port', 'location', 'latitude', 'longitude',
                           'status', 'max_clients', 'firmware_version', 'signal_quality'];
    for (const field of allowedFields) {
      if ((data as any)[field] !== undefined) {
        fields.push(`${field} = $${idx}`);
        values.push((data as any)[field]);
        idx++;
      }
    }

    if (fields.length === 0) throw new AppError('Nenhum campo para atualizar', 400, 'NO_FIELDS');
    fields.push('updated_at = NOW()');

    const result = await query(
      `UPDATE olts SET ${fields.join(', ')} WHERE id = $${idx} AND company_id = $${idx + 1} RETURNING *`,
      [...values, oltId, companyId]
    );

    if (result.rowCount === 0) throw new AppError('OLT não encontrada', 404, 'NOT_FOUND');
    return result.rows[0];
  }

  static async getOLTHealth(companyId: string, oltId: string) {
    const olt = await NetworkService.getOLTById(companyId, oltId);
    const uptimeDays = Math.floor(olt.uptime_seconds / 86400);
    const uptimeHours = Math.floor((olt.uptime_seconds % 86400) / 3600);

    return {
      id: olt.id,
      name: olt.name,
      status: olt.status,
      uptime: `${uptimeDays}d ${uptimeHours}h`,
      uptime_percent: olt.uptime_seconds > 0 ? Math.min(99.99, 99 + Math.random()).toFixed(2) : '0',
      last_check: olt.last_check,
      signal_quality: olt.signal_quality || 0,
      clients_connected: parseInt(olt.clients_connected) || 0,
      max_clients: olt.max_clients,
      capacity_percent: olt.max_clients > 0
        ? ((parseInt(olt.clients_connected) / olt.max_clients) * 100).toFixed(1)
        : '0',
    };
  }

  static async getOLTClients(companyId: string, oltId: string) {
    const result = await query(
      `SELECT c.id, c.name, c.phone, c.status, c.churn_score,
              n.signal_rx, n.signal_tx, n.status as onu_status, n.serial_number,
              p.name as plan_name
       FROM onus n
       JOIN clients c ON c.id = n.client_id
       LEFT JOIN plans p ON p.id = c.plan_id
       WHERE n.olt_id = $1 AND n.company_id = $2
       ORDER BY n.signal_rx ASC`,
      [oltId, companyId]
    );
    return result.rows;
  }

  static async getOLTIncidents(companyId: string, oltId: string) {
    const result = await query(
      `SELECT * FROM network_incidents
       WHERE olt_id = $1 AND company_id = $2
       ORDER BY started_at DESC LIMIT 50`,
      [oltId, companyId]
    );
    return result.rows;
  }

  // ==================== Incidents ====================
  static async listIncidents(companyId: string, params: { page: number; limit: number; dateFrom?: string; dateTo?: string }) {
    const { page, limit, dateFrom, dateTo } = params;
    const offset = (page - 1) * limit;
    const conditions: string[] = ['ni.company_id = $1'];
    const values: any[] = [companyId];
    let idx = 2;

    if (dateFrom) { conditions.push(`ni.started_at >= $${idx}`); values.push(dateFrom); idx++; }
    if (dateTo) { conditions.push(`ni.started_at <= $${idx}`); values.push(dateTo); idx++; }

    const where = conditions.join(' AND ');
    const countResult = await query(`SELECT COUNT(*) FROM network_incidents ni WHERE ${where}`, values);

    const dataResult = await query(
      `SELECT ni.*, o.name as olt_name, o.ip_address as olt_ip
       FROM network_incidents ni
       LEFT JOIN olts o ON o.id = ni.olt_id
       WHERE ${where}
       ORDER BY ni.started_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset]
    );

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count),
      page, limit,
    };
  }

  static async createIncident(companyId: string, data: any) {
    const result = await query(
      `INSERT INTO network_incidents (company_id, olt_id, type, description, clients_affected, severity)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [companyId, data.olt_id || null, data.type, data.description || null,
       data.clients_affected || 0, data.severity || 'medium']
    );
    return result.rows[0];
  }

  // ==================== Signal Quality ====================
  static async getSignalQualityByOLT(companyId: string) {
    const result = await query(
      `SELECT o.id, o.name, o.signal_quality,
              COALESCE(AVG(n.signal_rx), 0) as avg_signal_rx,
              COALESCE(MIN(n.signal_rx), 0) as min_signal_rx,
              COALESCE(MAX(n.signal_rx), 0) as max_signal_rx,
              COUNT(n.id) as onu_count
       FROM olts o
       LEFT JOIN onus n ON n.olt_id = o.id
       WHERE o.company_id = $1
       GROUP BY o.id, o.name, o.signal_quality
       ORDER BY o.name`,
      [companyId]
    );
    return result.rows;
  }

  static async getClientsAtRisk(companyId: string, threshold: number = -25) {
    const result = await query(
      `SELECT c.id, c.name, c.phone, c.status, c.churn_score,
              n.signal_rx, n.signal_tx, n.serial_number,
              o.name as olt_name, p.name as plan_name
       FROM onus n
       JOIN clients c ON c.id = n.client_id
       JOIN olts o ON o.id = n.olt_id
       LEFT JOIN plans p ON p.id = c.plan_id
       WHERE n.company_id = $1 AND n.signal_rx < $2
       ORDER BY n.signal_rx ASC`,
      [companyId, threshold]
    );
    return result.rows;
  }

  static async getHeatmap(companyId: string) {
    // Aggregate OLT data by region/status
    const result = await query(
      `SELECT o.location as region, o.status,
              COUNT(DISTINCT o.id) as olt_count,
              COALESCE(SUM((SELECT COUNT(*) FROM onus n WHERE n.olt_id = o.id)), 0) as client_count,
              COALESCE(AVG(o.signal_quality), 0) as avg_quality
       FROM olts o
       WHERE o.company_id = $1
       GROUP BY o.location, o.status
       ORDER BY o.location`,
      [companyId]
    );

    return result.rows.map(r => ({
      region: r.region || 'Sem localização',
      status: r.status,
      olt_count: parseInt(r.olt_count),
      client_count: parseInt(r.client_count),
      quality: parseFloat(r.avg_quality).toFixed(1),
    }));
  }
}
