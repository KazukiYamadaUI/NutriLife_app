import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const profileSchema = z.object({
  displayName: z.string().optional(),
  gender: z.string().optional(),
  birthYear: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
});

const lifestyleSchema = z.object({
  portionSize: z.string().optional(),
  exerciseLevel: z.string().optional(),
  appetite: z.string().optional(),
  mealFrequency: z.string().optional(),
  walkMinutes: z.string().optional(),
});

// GET /api/user/profile
router.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
    });

    if (!user) {
      res.status(404).json({ error: 'ユーザーが見つかりません' });
      return;
    }

    res.json({
      id: user.id,
      phone: user.phone,
      displayName: user.displayName,
      gender: user.gender,
      birthYear: user.birthYear,
      height: user.height,
      weight: user.weight,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'プロフィールの取得に失敗しました' });
  }
});

// PUT /api/user/profile
router.put('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const data = profileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.userId! },
      data,
    });

    res.json({
      id: user.id,
      phone: user.phone,
      displayName: user.displayName,
      gender: user.gender,
      birthYear: user.birthYear,
      height: user.height,
      weight: user.weight,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: '入力が正しくありません' });
      return;
    }
    throw error;
  }
});

// GET /api/user/lifestyle
router.get('/lifestyle', async (req: AuthRequest, res: Response) => {
  try {
    const lifestyle = await prisma.lifestyle.findUnique({
      where: { userId: req.userId! },
    });

    res.json(
      lifestyle || {
        portionSize: '',
        exerciseLevel: '',
        appetite: '',
        mealFrequency: '',
        walkMinutes: '',
      }
    );
  } catch (error) {
    console.error('Get lifestyle error:', error);
    res.status(500).json({ error: 'ライフスタイルの取得に失敗しました' });
  }
});

// PUT /api/user/lifestyle
router.put('/lifestyle', async (req: AuthRequest, res: Response) => {
  try {
    const data = lifestyleSchema.parse(req.body);

    const lifestyle = await prisma.lifestyle.upsert({
      where: { userId: req.userId! },
      update: data,
      create: {
        userId: req.userId!,
        ...data,
      },
    });

    res.json(lifestyle);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: '入力が正しくありません' });
      return;
    }
    throw error;
  }
});

export default router;
