import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface SupabaseAuthRequest extends Request {
  userId?: string;
}

export function supabaseAuthMiddleware(
  req: SupabaseAuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: '認証が必要です' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!env.SUPABASE_JWT_SECRET) {
    res.status(500).json({ error: 'サーバーの認証設定が不完全です' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET) as { sub: string };
    req.userId = decoded.sub;
    next();
  } catch {
    res.status(401).json({ error: '無効なトークンです' });
  }
}
