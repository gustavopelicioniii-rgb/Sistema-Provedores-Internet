import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, transaction } from '../../db/pool.js';
import { AppError } from '../middleware/error.middleware.js';
import type { JWTPayload } from '../middleware/auth.middleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'netadmin-super-secret-key-min-32-chars-long-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BCRYPT_ROUNDS = 10;

export class AuthService {
  static async login(email: string, password: string) {
    const result = await query(
      `SELECT u.id, u.company_id, u.name, u.email, u.password_hash, u.role, u.is_active,
              c.name as company_name
       FROM users u
       JOIN companies c ON c.id = u.company_id
       WHERE u.email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      throw new AppError('Email ou senha inválidos', 401, 'INVALID_CREDENTIALS');
    }

    const user = result.rows[0];

    if (!user.is_active) {
      throw new AppError('Conta desativada', 403, 'ACCOUNT_DISABLED');
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      throw new AppError('Email ou senha inválidos', 401, 'INVALID_CREDENTIALS');
    }

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const token = AuthService.generateToken({
      userId: user.id,
      companyId: user.company_id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.company_id,
        companyName: user.company_name,
      },
    };
  }

  static async register(data: {
    name: string;
    email: string;
    password: string;
    companyName: string;
    companyDocument: string;
  }) {
    // Check if email already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [data.email]);
    if (existing.rowCount && existing.rowCount > 0) {
      throw new AppError('Email já cadastrado', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    return transaction(async (client) => {
      // Create company
      const companyResult = await client.query(
        `INSERT INTO companies (name, document, email) VALUES ($1, $2, $3) RETURNING id, name`,
        [data.companyName, data.companyDocument, data.email]
      );
      const company = companyResult.rows[0];

      // Create admin user
      const userResult = await client.query(
        `INSERT INTO users (company_id, name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, 'admin') RETURNING id, name, email, role`,
        [company.id, data.name, data.email, passwordHash]
      );
      const user = userResult.rows[0];

      const token = AuthService.generateToken({
        userId: user.id,
        companyId: company.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: company.id,
          companyName: company.name,
        },
      };
    });
  }

  static async refreshToken(payload: JWTPayload) {
    // Verify user still exists and is active
    const result = await query('SELECT id, is_active FROM users WHERE id = $1', [payload.userId]);

    if (result.rowCount === 0 || !result.rows[0].is_active) {
      throw new AppError('Sessão inválida', 401, 'INVALID_SESSION');
    }

    return AuthService.generateToken(payload);
  }

  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  }
}
