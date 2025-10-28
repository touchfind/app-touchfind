import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export interface JWTPayload {
  userId: string;
  email: string;
  tipo: 'admin' | 'parceiro' | 'cliente';
  exp: number;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  tipo: 'admin' | 'parceiro' | 'cliente';
  auth_user_id: string;
  password_hash?: string;
}

/**
 * Gerar token JWT com payload específico
 */
export function generateToken(payload: { userId: string; email: string; tipo: string }): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não está definido nas variáveis de ambiente');
  }

  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      tipo: payload.tipo,
    },
    secret,
    { expiresIn: '2h' }
  );
}

/**
 * Verificar e decodificar token JWT
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET não está definido nas variáveis de ambiente');
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return null;
  }
}

/**
 * Hash da password usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Comparar password com hash usando bcrypt
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}