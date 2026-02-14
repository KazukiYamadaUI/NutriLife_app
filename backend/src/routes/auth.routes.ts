import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { smsService } from '../services/sms.service';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const sendCodeSchema = z.object({
  phone: z.string().min(10).max(15),
});

const verifySchema = z.object({
  phone: z.string().min(10).max(15),
  code: z.string().length(4),
});

// POST /api/auth/send-code
router.post('/send-code', async (req: Request, res: Response) => {
  try {
    const { phone } = sendCodeSchema.parse(req.body);
    const code = smsService.generateCode();

    // Store code in database
    await prisma.authCode.create({
      data: {
        phone,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    });

    // Send SMS
    await smsService.sendCode(phone, code);

    res.json({ message: '認証コードを送信しました' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: '電話番号の形式が正しくありません' });
      return;
    }
    throw error;
  }
});

// POST /api/auth/verify
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { phone, code } = verifySchema.parse(req.body);

    // Find valid auth code
    const authCode = await prisma.authCode.findFirst({
      where: {
        phone,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!authCode) {
      throw new AppError('認証コードが無効または期限切れです', 401);
    }

    // Mark code as used
    await prisma.authCode.update({
      where: { id: authCode.id },
      data: { used: true },
    });

    // Find or create user
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: { phone, displayName: 'ユーザー' },
      });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as string,
    } as jwt.SignOptions);

    res.json({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        displayName: user.displayName,
        gender: user.gender,
        birthYear: user.birthYear,
        height: user.height,
        weight: user.weight,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: '入力が正しくありません' });
      return;
    }
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    throw error;
  }
});

export default router;
