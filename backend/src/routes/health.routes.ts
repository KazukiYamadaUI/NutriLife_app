import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const healthDataSchema = z.object({
  steps: z.number().optional(),
  heartRate: z.number().optional(),
  weight: z.number().optional(),
  bloodPressureSys: z.number().optional(),
  bloodPressureDia: z.number().optional(),
  sleepHours: z.number().optional(),
});

// POST /api/health/sync
router.post('/sync', async (req: AuthRequest, res: Response) => {
  try {
    const data = healthDataSchema.parse(req.body);

    const healthRecord = await prisma.healthData.create({
      data: {
        userId: req.userId!,
        ...data,
      },
    });

    res.json({
      connected: true,
      steps: healthRecord.steps,
      heartRate: healthRecord.heartRate,
      weight: healthRecord.weight,
      bloodPressureSys: healthRecord.bloodPressureSys,
      bloodPressureDia: healthRecord.bloodPressureDia,
      sleepHours: healthRecord.sleepHours,
      lastSynced: healthRecord.syncedAt.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'データの形式が正しくありません' });
      return;
    }
    throw error;
  }
});

// GET /api/health/summary
router.get('/summary', async (req: AuthRequest, res: Response) => {
  try {
    const latest = await prisma.healthData.findFirst({
      where: { userId: req.userId! },
      orderBy: { syncedAt: 'desc' },
    });

    if (!latest) {
      res.json({ connected: false });
      return;
    }

    res.json({
      connected: true,
      steps: latest.steps,
      heartRate: latest.heartRate,
      weight: latest.weight,
      bloodPressureSys: latest.bloodPressureSys,
      bloodPressureDia: latest.bloodPressureDia,
      sleepHours: latest.sleepHours,
      lastSynced: latest.syncedAt.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  } catch (error) {
    console.error('Get health summary error:', error);
    res.status(500).json({ error: 'ヘルスデータの取得に失敗しました' });
  }
});

// DELETE /api/health/disconnect
router.delete('/disconnect', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.healthData.deleteMany({
      where: { userId: req.userId! },
    });
    res.json({ message: 'ヘルスケア連携を解除しました' });
  } catch (error) {
    console.error('Disconnect health error:', error);
    res.status(500).json({ error: '連携解除に失敗しました' });
  }
});

export default router;
